
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

export default function OnboardingAlmostTherePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState(0);

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
            <CheckCircle className="mx-auto h-16 w-16 text-primary mb-6 animate-scale-in" />
            <h1 className="text-4xl font-bold text-foreground animate-fade-in-up" style={{ animationDelay: '200ms' }}>You are almost there!</h1>
            
            <div className="w-full mt-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Progress value={progress} className="w-full h-3" />
                <p className="text-sm text-muted-foreground mt-2 font-semibold">
                    {Math.round(progress)}% Complete
                </p>
            </div>

            <div className="mt-10 w-full max-w-xs flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <Button 
                    onClick={handleBack} 
                    className="w-full"
                    variant="outline"
                    size="lg"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button 
                    onClick={handleNext} 
                    className="w-full"
                    size="lg"
                >
                  Next <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
