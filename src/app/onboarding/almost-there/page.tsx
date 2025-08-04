
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

export default function OnboardingAlmostTherePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
        <div className="absolute inset-0 z-0 bg-splash-background">
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                    <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
                <path d="M 0,0 L 100,0 C 50,50 100,50 100,100 L 0,100 Z" fill="hsl(var(--splash-blob-1))" />
                <path d="M 0,100 C 50,50 0,50 0,0" fill="hsl(var(--splash-background))" />
                <path d="M 100,0 L 0,0 C 50,50 0,50 0,100 L 100,100 Z" fill="hsl(var(--splash-blob-2))" style={{ opacity: 0.5 }}/>
            </svg>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
            <CheckCircle className="mx-auto h-16 w-16 text-primary mb-6 animate-scale-in" />
            <h1 className="text-4xl font-bold text-foreground animate-fade-in-up" style={{ animationDelay: '200ms' }}>You are almost there!</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-md animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                Just a few more details to go. Your personalized yoga journey is right around the corner.
            </p>

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
