
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, CheckCircle, XCircle, Gift, ArrowRight, MoveUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';

export default function DrawResultPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const prize = searchParams.get('prize');
  const error = searchParams.get('error');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleCompleteOnboarding = async () => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsFinalizing(true);
    try {
      let prizeToSave = 'No prize';
      if (prize) {
        try {
          prizeToSave = decodeURIComponent(prize);
        } catch (e) {
          console.warn("Failed to decode prize for saving, saving raw value:", prize, e);
          prizeToSave = prize; // Save raw prize if decoding fails
        }
      }
      await createUserProfileDocument(user, { onboardingCompleted: true, luckyDrawResult: prizeToSave });
      toast({
        title: "🎉 Onboarding Complete! Welcome to SnapYoga! 🎉",
        description: "You're all set to start your yoga journey. Let's explore your dashboard!",
        duration: 5000,
      });

      // Set a flag to trigger the reward dialog on the dashboard
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('justCompletedOnboarding', 'true');
      }

      router.push('/dashboard');
    } catch (e) {
      console.error("Error finalizing onboarding:", e);
      toast({
        title: "Finalization Error",
        description: "Could not complete your setup. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsFinalizing(false);
    }
  };
  
  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><SmileyRockLoader text="Loading..." /></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-md flex flex-col items-center">
            <OnboardingHeader />
            <Card className="w-full shadow-xl text-center z-10 bg-card/80 backdrop-blur-sm">
            <CardHeader>
                {error ? (
                <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
                ) : prize ? (
                <Gift className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
                ) : (
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                )}
                <CardTitle className="text-3xl font-bold">
                {error ? "Spin Error" : prize ? "Congratulations!" : "Onboarding Nearly Done!"}
                </CardTitle>
                <CardDescription>Your lucky draw result.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error ? (
                <p className="text-destructive">There was an issue with the lucky spin. Please try again later or proceed.</p>
                ) : prize ? (
                (() => {
                    let displayedPrize = prize;
                    try {
                    displayedPrize = decodeURIComponent(prize);
                    } catch (e) {
                    console.warn("Failed to decode prize from URL for display, showing raw value:", prize, e);
                    // Keep prize as is for display if decoding fails
                    }
                    return <p className="text-xl font-semibold text-accent">You won: {displayedPrize}!</p>;
                })()
                ) : (
                <p className="text-muted-foreground">No prize from the lucky wheel this time, but you're ready to start!</p>
                )}
                <p className="text-sm text-foreground/80">
                {prize ? `Your prize will be applied to your account (mock feature).` : `You've completed the main setup steps.`}
                </p>
                <Button 
                    onClick={handleCompleteOnboarding} 
                    className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                    disabled={isFinalizing}
                >
                    {isFinalizing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Go to Dashboard</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
            </CardContent>
            <CardFooter>
                
            </CardFooter>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}
