
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, ArrowLeft, MoveUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { useEffect, useState } from 'react';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { HappyLifeGraphic } from '@/components/icons/HappyLifeGraphic';


export default function OnboardingAlmostTherePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleNext = () => {
    setIsNavigating(true);
    setTimeout(() => {
        router.push('/onboarding/profile-summary');
    }, 800);
  };

  const handleBack = () => {
    router.back();
  };

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
        
        <div className="relative z-10 flex flex-col items-center max-w-md w-full">
            <OnboardingHeader />

            <div className="mt-8 z-20">
              <HappyLifeGraphic />
            </div>

            <div className="mt-10 w-full max-w-xs flex flex-col gap-3 animate-fade-in-up items-center" style={{ animationDelay: '600ms' }}>
                
                <Button 
                    onClick={handleNext} 
                    className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                    disabled={isNavigating}
                >
                  {isNavigating ? <Loader2 className="animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
