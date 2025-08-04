
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const affirmations = [
    "I am becoming everything I’m meant to be, one small step at a time.",
    "Today, I choose peace over pressure.",
    "I don’t need to rush. What’s meant for me will find me.",
    "I am allowed to take up space, rest, and breathe deeply.",
    "Progress is quiet, gentle, and still counts.",
    "I trust myself to grow through what I go through.",
    "Even slow blooms still become flowers.",
    "I honor where I am, even if it’s not where I thought I’d be.",
    "Every breath is a reset. I start fresh now."
];

export default function OnboardingAffirmationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isRevealed, setIsRevealed] = useState(false);
  const [affirmation, setAffirmation] = useState<string | null>(null);

  const handleReveal = () => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setAffirmation(affirmations[randomIndex]);
    setIsRevealed(true);
  };

  const handleNext = () => {
    router.push('/onboarding/yoga-goal');
  };

  const handleBack = () => {
      router.back();
  }

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
            <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Daily affirmation</h1>

            <div 
              className="relative w-full max-w-sm h-64 mx-auto rounded-lg cursor-pointer group my-8 shadow-xl flex items-center justify-center bg-card/80 backdrop-blur-sm border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-primary hover:bg-primary/5 p-6"
              onClick={!isRevealed ? handleReveal : undefined}
            >
              {!isRevealed ? (
                 <div className="flex flex-col items-center justify-center">
                    <Sparkles className="h-10 w-10 text-muted-foreground/50 mb-2 transition-colors group-hover:text-primary" />
                    <p className="text-lg font-semibold text-muted-foreground transition-colors group-hover:text-primary">Tap to Reveal</p>
                </div>
              ) : (
                <p className="text-xl font-medium text-primary/90 animate-in zoom-in-125 duration-500">
                    &ldquo;{affirmation}&rdquo;
                </p>
              )}
            </div>

            <div className="w-full max-w-xs flex flex-col gap-2">
                <Button 
                    onClick={handleBack} 
                    className="w-full"
                    variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button 
                    onClick={handleNext} 
                    className="w-full"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
            {isRevealed && (
                <p className="text-sm text-muted-foreground animate-in fade-in duration-500 mt-4">
                    Let's set up your goals.
                </p>
            )}
        </div>
      </div>
    </AppShell>
  );
}
