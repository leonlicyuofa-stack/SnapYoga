
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
            <div className="text-center text-primary animate-fade-in-up font-serif">
                <p className="text-4xl tracking-widest">YOUR</p>
                <h1 className="text-6xl font-bold tracking-tighter my-2 font-playfair">yoga journey</h1>
                <p className="text-4xl tracking-widest mt-2">BEGINS</p>
            </div>
            
            <div className="mt-12 w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Button 
                    onClick={handleContinue} 
                    className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                    disabled={isNavigating}
                >
                  {isNavigating ? <SmileyRockLoader /> : <><span>Continue</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
