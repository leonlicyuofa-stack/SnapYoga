"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/clientApp';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const uid = searchParams.get('uid');

    if (!sessionId || !uid) {
      setErrorMessage('Missing payment session information.');
      setStatus('error');
      return;
    }

    const finalizePayment = async () => {
      try {
        console.log('[PaymentSuccess] Finalizing payment for session:', sessionId, 'uid:', uid);
        const functions = getFunctions(app);
        const finalizeStripePayment = httpsCallable(functions, 'finalizeStripePayment');
        const result = await finalizeStripePayment({ sessionId, uid });
        console.log('[PaymentSuccess] Finalization result:', result.data);
        setStatus('success');
        setTimeout(() => {
          router.replace('/onboarding/pick-a-prize');
        }, 1500);
      } catch (error) {
        console.error('[PaymentSuccess] Error finalizing payment:', error);
        setErrorMessage('Payment verification failed. Please contact support.');
        setStatus('error');
      }
    };

    finalizePayment();
  }, [searchParams, router]);

  return (
    <div className="relative min-h-screen font-serif text-white">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8 text-center">
            <div className="mx-auto mb-4 inline-block">
              <SnapYogaLogo />
            </div>

            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-white/80" />
                <h1 className="text-2xl font-bold">Confirming your payment…</h1>
                <p className="text-white/70 text-sm">Please wait while we activate your subscription.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
                <h1 className="text-2xl font-bold">Payment Confirmed!</h1>
                <p className="text-white/70 text-sm">Your subscription is now active. Redirecting…</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 mx-auto text-red-400" />
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="text-white/70 text-sm">{errorMessage}</p>
                <button
                  onClick={() => router.replace('/onboarding/subscription')}
                  className="mt-4 px-6 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
                >
                  Back to Subscription
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-white" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
