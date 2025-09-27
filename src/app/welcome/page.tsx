"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { MoveUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Shadows_Into_Light } from 'next/font/google';

const shadowsIntoLight = Shadows_Into_Light({
  weight: '400',
});


export default function WelcomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // If user is not logged in and we are done loading, redirect to signin
    if (!authLoading && !user) {
      router.replace('/auth/signup');
    }
  }, [user, authLoading, router]);

  const handleContinue = () => {
    setIsNavigating(true);
    // Add a small delay for transition effect before navigating
    setTimeout(() => {
        router.push('/onboarding/gender-profile');
    }, 500);
  };

  if (authLoading || !user) {
    return (
        <AppShell>
            <div className="flex justify-center items-center min-h-screen">
                <SmileyRockLoader />
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-screen items-center justify-center py-12 px-4 text-center">
        
        <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
            <div className={cn("text-center text-splash-foreground animate-fade-in-up")}>
                <h1 className={cn("text-6xl font-bold tracking-tighter mt-4 flex flex-col items-center", shadowsIntoLight.className)}>
                    <span className="mb-4 font-bold text-[40px]">your</span>
                    <div className="relative inline-block my-4">
                        <svg
                            className="absolute -inset-4 sm:-inset-6 md:-inset-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-full text-white/50 z-0"
                            viewBox="0 0 300 60"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                           <path transform="translate(0, 20)" d="M0 20 Q 50 10, 100 20 T 200 20 T 300 20" stroke="currentColor" strokeWidth="25" fill="none" strokeLinecap="round" style={{filter: 'url(#wavy)'}} />
                           <path transform="translate(0, 30)" d="M0 25 Q 50 18, 100 25 T 200 25 T 300 25" stroke="currentColor" strokeWidth="20" fill="none" strokeLinecap="round" style={{filter: 'url(#wavy2)', opacity: 0.7}} />
                           <path transform="translate(0, 40)" d="M0 20 Q 50 10, 100 20 T 200 20 T 300 20" stroke="currentColor" strokeWidth="25" fill="none" strokeLinecap="round" style={{filter: 'url(#wavy)'}} />
                           <defs>
                             <filter id="wavy">
                               <feTurbulence x="0" y="0" baseFrequency="0.01 0.005" numOctaves="2" seed="2" />
                               <feDisplacementMap in="SourceGraphic" scale="10" />
                             </filter>
                             <filter id="wavy2">
                               <feTurbulence x="0" y="0" baseFrequency="0.02 0.01" numOctaves="1" seed="3" />
                               <feDisplacementMap in="SourceGraphic" scale="8" />
                             </filter>
                           </defs>
                        </svg>
                        <span className="relative font-extrabold text-5xl z-10 overflow-hidden whitespace-nowrap animate-typewriter border-r-4 border-r-transparent">YOGA JOURNEY</span>
                    </div>
                    <span className="mt-8 font-bold text-[40px]">begins</span>
                </h1>
            </div>
            
            <div className="mt-12 w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Button 
                    onClick={handleContinue} 
                    className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                    disabled={isNavigating}
                >
                  {isNavigating ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Continue</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
