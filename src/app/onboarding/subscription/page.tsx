
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, Check, Star, ArrowRight, ArrowLeft, MoveUpRight } from 'lucide-react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isNavigatingNext, setIsNavigatingNext] = useState(false);

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><SmileyRockLoader text="Loading..." /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const handleStartFreeTrial = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { 
        trialStatus: 'active', 
        trialStartDate: new Date().toISOString(), 
      });
      router.push('/onboarding/lucky-wheel'); 
    } catch (error) {
      console.error("Error activating free trial:", error);
      toast({
        title: "Error",
        description: "Could not activate free trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleProceedToLuckyWheel = () => {
      setIsNavigatingNext(true);
      setTimeout(() => {
        router.push('/onboarding/lucky-wheel');
      }, 500);
  }

  const handleBackNavigation = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 500);
  };

  const anyLoading = isSubmitting || isNavigatingBack || isNavigatingNext;

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4">
        
        <div className="w-full max-w-md flex flex-col items-center">
            <OnboardingHeader />
            <Card className="w-full shadow-xl z-10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
                <Star className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                <CardTitle className="text-3xl font-bold">Unlock SnapYoga Premium</CardTitle>
                <CardDescription>Choose your plan or try our lucky wheel!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-6 border rounded-lg bg-primary/5 text-center">
                <h3 className="text-2xl font-semibold text-primary">Monthly Subscription</h3>
                <p className="text-4xl font-bold my-2 text-accent">IDR 100,000</p>
                <p className="text-muted-foreground text-sm">per month</p>
                <ul className="text-left space-y-2 mt-4 text-sm text-foreground/80">
                    <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Unlimited Pose Analysis</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Advanced Feedback</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Progress Tracking & History</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Exclusive Challenges</li>
                </ul>
                </div>

                <Button 
                onClick={handleStartFreeTrial} 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                isLoadingWithBar={isSubmitting}
                disabled={anyLoading}
                >
                <Star className="mr-2 h-5 w-5" />
                Start 7-Day Free Trial (Mock)
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
                    
                    <Button 
                    onClick={handleProceedToLuckyWheel} 
                    className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                    disabled={anyLoading}
                    >
                    {isNavigatingNext ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Next: Try the Lucky Wheel!</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground text-center w-full">
                Cancel anytime. Payment will be processed after the trial if not cancelled (mock).
                </p>
            </CardFooter>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}
