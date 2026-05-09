"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Star, Crown, Zap } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const FEATURES = [
  'Unlimited Pose Analysis',
  'Advanced AI Feedback',
  'Progress Tracking & History',
  'Exclusive Challenges',
];

export default function UpgradePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<'monthly' | 'yearly' | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(firestore, 'users', user.uid))
      .then((snap) => {
        setSubscriptionStatus(snap.exists() ? (snap.data()?.subscriptionStatus ?? null) : null);
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
  }, [user]);

  const handleSubscribe = async (planId: 'monthly' | 'yearly') => {
    if (!user) return;
    setSubmittingPlan(planId);
    try {
      console.log('[Upgrade] Creating checkout session for plan:', planId);
      const functions = getFunctions(app);
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      const result = await createStripeCheckoutSession({ uid: user.uid, email: user.email, planId });
      const { sessionUrl } = result.data as { sessionUrl: string };
      console.log('[Upgrade] Redirecting to Stripe checkout');
      if (typeof window !== 'undefined') window.location.href = sessionUrl;
    } catch (error) {
      console.error('[Upgrade] Checkout error:', error);
      toast({ title: 'Error', description: 'Could not start checkout. Please try again.', variant: 'destructive' });
      setSubmittingPlan(null);
    }
  };

  if (authLoading || loadingStatus) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-[60vh]">
          <SmileyRockLoader />
        </div>
      </AppShell>
    );
  }

  if (subscriptionStatus === 'active') {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-10 max-w-md w-full space-y-6 text-center">
            <div className="mx-auto inline-block"><SnapYogaLogo /></div>
            <Crown className="h-16 w-16 mx-auto text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">You&apos;re already Premium! 🎉</h1>
            <p className="text-white/70">You have full access to all SnapYoga features.</p>
            <div className="p-4 rounded-xl bg-white/10 border border-white/20 space-y-2 text-left">
              {FEATURES.map((f) => (
                <p key={f} className="text-white text-sm flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" /> {f}
                </p>
              ))}
            </div>
            <p className="text-white/50 text-xs">
              To manage or cancel your subscription, contact support or visit your Stripe billing portal.
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full h-12 border-white/30 text-white hover:bg-white/10"
            >
              Go Back
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="w-full max-w-2xl space-y-8">

          <div className="text-center space-y-2">
            <div className="mx-auto inline-block"><SnapYogaLogo /></div>
            <h1 className="text-3xl font-bold text-white">Unlock SnapYoga Premium</h1>
            <p className="text-white/70">Choose the plan that works for you</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Monthly plan */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 flex flex-col space-y-5">
              <div>
                <p className="text-white/60 text-sm uppercase tracking-widest font-serif">Monthly</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-bold text-white">$6.99</span>
                  <span className="text-white/60 text-sm">/ month</span>
                </div>
              </div>
              <ul className="space-y-2 flex-grow">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe('monthly')}
                disabled={!!submittingPlan}
                className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold"
              >
                {submittingPlan === 'monthly'
                  ? <Loader2 className="animate-spin" />
                  : <><Star className="mr-2 h-4 w-4" /> Subscribe Now</>}
              </Button>
            </div>

            {/* Yearly plan */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-400/50 ring-1 ring-amber-400/30 flex flex-col space-y-5 relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-500 text-white text-xs font-bold px-2 py-0.5">
                Save 40%
              </Badge>
              <div>
                <p className="text-amber-400/80 text-sm uppercase tracking-widest font-serif">Yearly</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-bold text-white">$49.99</span>
                  <span className="text-white/60 text-sm">/ year</span>
                </div>
                <p className="text-amber-400 text-xs mt-1">~$4.17 / month · save $33.89</p>
              </div>
              <ul className="space-y-2 flex-grow">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                    <Check className="h-4 w-4 text-amber-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe('yearly')}
                disabled={!!submittingPlan}
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                {submittingPlan === 'yearly'
                  ? <Loader2 className="animate-spin" />
                  : <><Zap className="mr-2 h-4 w-4" /> Subscribe Now</>}
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-white/40">
            Cancel anytime. Secure payment via Stripe. 7-day free trial on monthly plan.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
