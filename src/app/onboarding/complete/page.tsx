"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowUp } from 'lucide-react';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingThemeToggle } from '@/components/onboarding/onboarding-theme-toggle';

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Mark onboarding finished so future sign-ins go straight to the dashboard
  // instead of being routed back through the onboarding flow.
  useEffect(() => {
    if (user) {
      createUserProfileDocument(user, { onboardingCompleted: true })
        .catch(err => console.error('Failed to mark onboarding complete:', err));
    }
  }, [user]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6 cursor-pointer"
      onClick={handleContinue}
    >
      <OnboardingThemeToggle />
      <div className="relative z-10 w-full max-w-sm animate-in fade-in duration-1000 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full sy-option flex items-center justify-center">
            <Check className="sy-accent h-8 w-8" />
          </div>
        </div>

        <OnboardingHeader />

        <div className="space-y-1">
          <h1 className="sy-title" style={{ fontSize: 26 }}>You're all set</h1>
          <p className="sy-subtitle" style={{ fontSize: 12, letterSpacing: '0.04em' }}>Your journey begins now</p>
        </div>

        <p className="sy-body" style={{ fontSize: 13, lineHeight: 1.7 }}>
          Your personalised practice<br />is ready and waiting.
        </p>

        <div className="flex flex-col items-center gap-3 pt-2">
          <ArrowUp className="sy-accent h-8 w-8 animate-bounce" />
          <p className="sy-subtitle text-sm font-medium">Tap or swipe up to enter</p>
        </div>
      </div>
    </div>
  );
}
