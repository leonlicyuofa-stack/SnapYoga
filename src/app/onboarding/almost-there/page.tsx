"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, ArrowLeft, CheckCircle, MoveUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { PebbleTrioIcon } from '@/components/icons/PebbleTrioIcon';

export default function OnboardingAlmostTherePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Define total steps in your onboarding flow
  const totalOnboardingSteps = 7;
  // This page is roughly step 5
  const currentStep = 5;

  useEffect(() => {
    // Calculate progress and animate it
    const calculatedProgress = (currentStep / totalOnboardingSteps) * 100;
    const timer = setTimeout(() => setProgress(calculatedProgress), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setIsNavigating(true);
    router.push('/onboarding/focus-areas');
  };

  const handleBack = () => {
    router.back();
  };

  if (authLoading) {
      return (
          <AppShell>
              <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                  <SmileyRockLoader text="Loading..." />
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
        
        <div className="relative z-10 flex flex-col items-center max-w-md w-full">
            <OnboardingHeader />
            
            <PebbleTrioIcon className="h-24 w-24 text-primary mb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }} />

            <div className="w-full mt-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Progress value={progress} className="w-full h-3" />
                <p className="text-sm text-muted-foreground mt-2 font-semibold">
                    {Math.round(progress)}% Complete
                </p>
            </div>

            <div className="mt-10 w-full max-w-xs flex flex-col gap-3 animate-fade-in-up items-center" style={{ animationDelay: '600ms' }}>
                
                <Button 
                    onClick={handleNext} 
                    className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                    disabled={isNavigating}
                >
                  {isNavigating ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
