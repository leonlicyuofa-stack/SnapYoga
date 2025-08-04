
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, ArrowLeft, Heart, Hand, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function OnboardingAffirmationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isRevealed, setIsRevealed] = useState(false);

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
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
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
        <Card className="z-10 w-full max-w-md shadow-xl text-center bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <Heart className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Quote of the Day</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div 
              className="relative aspect-[9/16] w-full max-w-xs mx-auto rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setIsRevealed(true)}
            >
              {!isRevealed ? (
                 <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 transition-colors group-hover:border-primary group-hover:bg-primary/5">
                    <Sparkles className="h-10 w-10 text-muted-foreground/50 mb-2 transition-colors group-hover:text-primary" />
                    <p className="text-lg font-semibold text-muted-foreground transition-colors group-hover:text-primary">Tap to Reveal</p>
                </div>
              ) : (
                <Image
                    src="https://images.unsplash.com/photo-1670796223293-b86095de8e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8bW90aXZhdGlvbmFsJTIwcXVvdGV8ZW58MHx8fHwxNzU0MzEzMTY0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Consistency is the key"
                    fill
                    className="object-cover animate-in fade-in duration-500"
                    data-ai-hint="motivational quote"
                 />
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full flex flex-col gap-2">
                <Button 
                    onClick={handleBack} 
                    className="w-full"
                    variant="outline"
                >
                  <ArrowLeft className="ml-2 h-4 w-4" /> Back
                </Button>
                <Button 
                    onClick={handleNext} 
                    className="w-full"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
            {isRevealed && (
                <p className="text-xs text-muted-foreground animate-in fade-in duration-500">
                    Let's set up your goals.
                </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
