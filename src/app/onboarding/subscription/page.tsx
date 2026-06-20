"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Star, Loader2 } from 'lucide-react';
import { OnboardingScaffold } from '@/components/onboarding/onboarding-scaffold';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/clientApp';

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading && !user) {
    router.replace('/auth/signin');
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  const handleStartFreeTrial = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      console.log('[Subscription] Creating Stripe checkout session for uid:', user.uid);
      const functions = getFunctions(app);
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      const result = await createStripeCheckoutSession({
        uid: user.uid,
        email: user.email,
        planId: 'monthly',
      });
      const { sessionUrl } = result.data as { sessionUrl: string };
      console.log('[Subscription] Redirecting to Stripe checkout:', sessionUrl);
      if (typeof window !== 'undefined') {
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error('[Subscription] Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Could not start checkout. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleBackNavigation = () => {
    router.back();
  };

  return (
    <OnboardingScaffold
      title="Unlock SnapYoga Premium"
      subtitle="Choose your plan to continue."
      onBack={handleBackNavigation}
      cardClassName="space-y-8"
    >
                    <main className="space-y-6">
                        <div className="sy-option p-6 rounded-lg text-center">
                            <h3 className="sy-title text-2xl">Monthly Subscription</h3>
                            <p className="sy-accent text-4xl font-bold my-2">IDR 100,000</p>
                            <p className="sy-subtitle text-sm">per month</p>
                            <ul className="sy-body text-left space-y-2 mt-4 text-sm">
                                <li className="flex items-center"><Check className="sy-accent h-5 w-5 mr-2" /> Unlimited Pose Analysis</li>
                                <li className="flex items-center"><Check className="sy-accent h-5 w-5 mr-2" /> Advanced Feedback</li>
                                <li className="flex items-center"><Check className="sy-accent h-5 w-5 mr-2" /> Progress Tracking & History</li>
                                <li className="flex items-center"><Check className="sy-accent h-5 w-5 mr-2" /> Exclusive Challenges</li>
                            </ul>
                        </div>

                        <Button
                            onClick={handleStartFreeTrial}
                            className="sy-cta w-full h-12 rounded-xl"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Star className="mr-2 h-5 w-5" /> Start 7-Day Free Trial</>}
                        </Button>
                    </main>

                    <footer className="text-center">
                        <p className="sy-body text-xs">
                        Cancel anytime. Payment will be processed after the 7-day trial if not cancelled.
                        </p>
                    </footer>
    </OnboardingScaffold>
  );
}
