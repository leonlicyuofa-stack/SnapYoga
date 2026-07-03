"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { Button } from '@/components/ui/button';
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
          router.replace('/onboarding/complete');
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
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm flex flex-col items-center">
          <OnboardingHeader className="mb-6" />
          <div className="sy-card backdrop-blur-lg rounded-2xl p-8 w-full text-center space-y-5">
            {status === 'loading' && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full sy-option flex items-center justify-center">
                  <Loader2 className="sy-accent h-8 w-8 animate-spin" />
                </div>
                <h1 className="sy-title" style={{ fontSize: 22 }}>Confirming your payment…</h1>
                <p className="sy-body text-sm">Please wait while we activate your subscription.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ border: '1.5px solid rgba(93,202,165,0.55)', background: 'rgba(93,202,165,0.10)' }}>
                  <CheckCircle className="h-8 w-8" style={{ color: 'rgba(93,202,165,0.95)' }} />
                </div>
                <h1 className="sy-title" style={{ fontSize: 22 }}>Payment confirmed</h1>
                <p className="sy-body text-sm">Your subscription is now active. Let's finish setting things up.</p>
                <div className="flex items-center justify-end gap-4">
                  <span className="sy-title" style={{ fontSize: 16 }}>Continue</span>
                  <Button onClick={() => router.replace('/onboarding/complete')} variant="ghost" aria-label="Continue" className="rounded-full h-12 w-12 p-0 bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border border-[rgba(50,14,59,0.4)] dark:border-white/20">
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ border: '1.5px solid rgba(226,75,74,0.55)', background: 'rgba(226,75,74,0.10)' }}>
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
                <h1 className="sy-title" style={{ fontSize: 22 }}>Something went wrong</h1>
                <p className="sy-body text-sm">{errorMessage}</p>
                <Button
                  onClick={() => router.replace('/onboarding/subscription')}
                  className="sy-option sy-cta-outline w-full h-12 rounded-xl hover:opacity-80"
                >
                  Back to Subscription
                </Button>
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
          <Loader2 className="sy-accent h-16 w-16 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
