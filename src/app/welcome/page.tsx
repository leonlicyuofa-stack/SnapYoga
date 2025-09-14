
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { QuoteCarousel } from '@/components/features/dashboard/QuoteCarousel';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // If user is not logged in and we are done loading, redirect to signin
    if (!authLoading && !user) {
      router.replace('/auth/signin');
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
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <SmileyRockLoader text="Loading your session..." />
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4 text-center">
        {/* Animated Background */}
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
        
        <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
            <Sparkles className="mx-auto h-16 w-16 text-primary mb-6 animate-pulse" />
            <h1 className="text-4xl font-bold text-foreground animate-fade-in-up">Welcome to SnapYoga</h1>
            <p className="text-lg text-muted-foreground mt-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Take a moment for a brief, reflective pause before we begin.
            </p>
            
            <div className="h-48 flex items-center justify-center w-full animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <QuoteCarousel />
            </div>

            <div className="mt-6 w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <Button 
                    onClick={handleContinue} 
                    className="w-full"
                    size="lg"
                    isLoadingWithBar={isNavigating}
                    disabled={isNavigating}
                >
                  Start Onboarding <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
