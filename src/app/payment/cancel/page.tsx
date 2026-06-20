"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/clientApp';

export default function PaymentCancelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Both actions re-open Stripe checkout, where the payment method is chosen.
  const restartCheckout = async () => {
    if (!user) {
      router.replace('/onboarding/subscription');
      return;
    }
    setIsSubmitting(true);
    try {
      const functions = getFunctions(app);
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      const result = await createStripeCheckoutSession({
        uid: user.uid,
        email: user.email,
        planId: 'monthly',
      });
      const { sessionUrl } = result.data as { sessionUrl: string };
      if (typeof window !== 'undefined') {
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error('[PaymentCancel] Error restarting checkout:', error);
      toast({
        title: "Error",
        description: "Could not restart checkout. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm flex flex-col items-center">
          <OnboardingHeader className="mb-6" />
          <div className="sy-card backdrop-blur-lg rounded-2xl p-8 w-full text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ border: '1.5px solid rgba(214,178,130,0.60)', background: 'rgba(193,154,107,0.12)' }}>
              <XCircle className="sy-accent h-8 w-8" />
            </div>
            <h1 className="sy-title" style={{ fontSize: 22 }}>Payment cancelled</h1>
            <p className="sy-body text-sm">
              No worries — your payment was not charged. You can pick up your free trial whenever you&apos;re ready.
            </p>

            <div className="space-y-3 pt-1">
              <Button
                onClick={restartCheckout}
                disabled={isSubmitting}
                className="sy-cta w-full h-12 rounded-xl"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Try again'}
              </Button>
              <Button
                onClick={restartCheckout}
                disabled={isSubmitting}
                variant="outline"
                className="sy-option sy-cta-outline w-full h-12 rounded-xl hover:opacity-80"
              >
                Use a different payment method
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
