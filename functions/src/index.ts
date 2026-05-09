import * as admin from 'firebase-admin';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

admin.initializeApp();
const db = admin.firestore();

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(secretKey, { apiVersion: '2024-06-20' });
}

const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;
const SUCCESS_URL = 'https://snap-yoga.vercel.app/payment/success?session_id={CHECKOUT_SESSION_ID}';
const CANCEL_URL = 'https://snap-yoga.vercel.app/payment/cancel';

// Creates a Stripe Checkout session and returns the hosted payment URL
export const createStripeCheckoutSession = onCall(async (request) => {
  const { uid, email, planId } = request.data as { uid: string; email: string; planId: string };

  if (!uid || !email) {
    throw new HttpsError('invalid-argument', 'uid and email are required');
  }

  console.log('[createStripeCheckoutSession] Creating session for uid:', uid, 'planId:', planId);

  const stripe = getStripe();
  const priceId = planId === 'yearly' ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;

  if (!priceId) {
    throw new HttpsError('internal', `Stripe price ID for plan "${planId}" is not configured`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SUCCESS_URL}&uid=${uid}`,
      cancel_url: CANCEL_URL,
      customer_email: email,
      client_reference_id: uid,
      subscription_data: {
        trial_period_days: 7,
      },
    });

    console.log('[createStripeCheckoutSession] Session created:', session.id);
    return { sessionUrl: session.url };
  } catch (error) {
    console.error('[createStripeCheckoutSession] Stripe error:', error);
    throw new HttpsError('internal', 'Failed to create checkout session');
  }
});

// Verifies a completed Stripe Checkout session and activates the user's subscription in Firestore
export const finalizeStripePayment = onCall(async (request) => {
  const { sessionId, uid } = request.data as { sessionId: string; uid: string };

  if (!sessionId || !uid) {
    throw new HttpsError('invalid-argument', 'sessionId and uid are required');
  }

  console.log('[finalizeStripePayment] Verifying session:', sessionId, 'for uid:', uid);

  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('[finalizeStripePayment] Session status:', session.payment_status);

    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      throw new HttpsError('failed-precondition', 'Payment has not been completed');
    }

    if (session.client_reference_id !== uid) {
      throw new HttpsError('permission-denied', 'Session does not belong to this user');
    }

    await db.collection('users').doc(uid).set(
      {
        subscriptionStatus: 'active',
        subscriptionPlan: 'monthly',
        stripeCustomerId: session.customer,
        stripeSessionId: sessionId,
        subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log('[finalizeStripePayment] Subscription activated for uid:', uid);
    return { success: true };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('[finalizeStripePayment] Error:', error);
    throw new HttpsError('internal', 'Failed to finalize payment');
  }
});

// Stripe webhook endpoint — handles async payment events as backup verification
export const stripeWebhook = onRequest(async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[stripeWebhook] STRIPE_WEBHOOK_SECRET is not configured');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  const sig = req.headers['stripe-signature'] as string;
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (error) {
    console.error('[stripeWebhook] Signature verification failed:', error);
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  console.log('[stripeWebhook] Received event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        if (!uid) {
          console.warn('[stripeWebhook] No client_reference_id on session:', session.id);
          break;
        }
        if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
          await db.collection('users').doc(uid).set(
            {
              subscriptionStatus: 'active',
              subscriptionPlan: 'monthly',
              stripeCustomerId: session.customer,
              stripeSessionId: session.id,
              subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          console.log('[stripeWebhook] Subscription activated via webhook for uid:', uid);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find the user by their stripeCustomerId
        const snapshot = await db
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({ subscriptionStatus: 'cancelled' });
          console.log('[stripeWebhook] Subscription cancelled for customer:', customerId);
        } else {
          console.warn('[stripeWebhook] No user found for customerId:', customerId);
        }
        break;
      }

      default:
        console.log('[stripeWebhook] Unhandled event type:', event.type);
    }
  } catch (error) {
    console.error('[stripeWebhook] Error processing event:', event.type, error);
    res.status(500).send('Error processing webhook');
    return;
  }

  res.status(200).json({ received: true });
});
