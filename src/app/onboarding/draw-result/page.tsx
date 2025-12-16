
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { CheckCircle, XCircle, Gift, ArrowRight, MoveUpRight, Loader2, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div></AppShell>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
      <QuadrantBackground />
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 m-4">
        <OnboardingHeader />
        <div className="w-full text-center mt-8">
            <div className="mb-4">
                {error ? (
                <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
                ) : prize ? (
                 <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-primary/20 shadow-lg">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback>
                        <UserCircle className="h-full w-full text-muted-foreground" />
                    </AvatarFallback>
                 </Avatar>
                ) : (
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                )}
            </div>
            <div className="space-y-4">
                {error ? (
                <p className="text-destructive">There was an issue with the lucky spin. Please try again later or proceed.</p>
                ) : prize ? (
                <p className="text-xl font-semibold text-accent">You won: 3-month free trial!</p>
                ) : (
                <p className="text-muted-foreground">No prize from the lucky wheel this time, but you're ready to start!</p>
                )}
                
            </div>
            <div className="px-8 pt-8">
              <Button onClick={handleCompleteOnboarding} className="w-full h-12 text-base rounded-full" disabled={isFinalizing}>
                  {isFinalizing ? <Loader2 className="animate-spin" /> : 'Go to Dashboard'}
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
