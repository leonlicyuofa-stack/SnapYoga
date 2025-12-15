
"use client";

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { useEffect } from 'react';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';

export default function OnboardingAlmostTherePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Automatically navigate after a short delay
    const timer = setTimeout(() => {
        router.push('/onboarding/profile-summary');
    }, 1500); // 1.5-second delay to show the loader

    return () => clearTimeout(timer);
  }, [router]);

  if (authLoading) {
      return (
          <AppShell>
              <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                  <SmileyRockLoader />
              </div>
          </AppShell>
      );
  }

  if (!user && !authLoading) {
      router.replace('/auth/signin');
      return null;
  }

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4 text-center">
        <QuadrantBackground />
        <div className="relative z-10 flex flex-col items-center max-w-md w-full">
            <OnboardingHeader />

            <div className="mt-20 z-20">
              <SmileyRockLoader />
            </div>
            
            <p className="text-muted-foreground mt-4">Preparing your summary...</p>

        </div>
      </div>
    </AppShell>
  );
}
