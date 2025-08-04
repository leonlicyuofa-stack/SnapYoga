
"use client";

import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Sparkles, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { useState, useEffect } from 'react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

export default function OnboardingAppFeaturesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleNextStep = async () => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    // This step doesn't collect new data, just progresses with a visual delay.
    setTimeout(() => {
        router.push('/onboarding/profile-summary');
    }, 500); 
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
     return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting...</p></div></AppShell>;
  }

  const handleBackNavigation = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 500); 
  };

  return (
    <AppShell>
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4">
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
        <Card className="w-full max-w-lg shadow-xl z-10 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Discover SnapYoga</CardTitle>
            <CardDescription>Learn about what SnapYoga offers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-xl font-semibold text-primary mb-2 flex items-center">
                <Sparkles className="mr-2 h-6 w-6 text-primary" />
                SnapYoga Features
              </h3>
              <ul className="list-disc list-inside space-y-1 text-foreground/80 text-sm">
                <li>AI-Powered Pose Analysis: Get instant feedback on your yoga poses.</li>
                <li>Personalized Scoring: Track your improvement with scores out of 100.</li>
                <li>Progress Tracking: See your analysis history and watch yourself grow.</li>
                <li>Friend Challenges: Engage in fun challenges with friends.</li>
                <li>Expert Guidance: Access tips and video tutorials.</li>
                <li>Personalized Onboarding: Tailor the app to your needs!</li>
              </ul>
            </div>

            <div className="p-6 bg-accent/10 rounded-lg border border-accent/20 text-center">
              <Users className="mx-auto h-10 w-10 text-accent mb-3" />
              <h3 className="text-xl font-semibold text-accent mb-1">
                Join Our Growing Community!
              </h3>
              <p className="text-2xl font-bold">1,000+</p>
              <p className="text-sm text-muted-foreground">
                yogis have improved their practice with SnapYoga!
              </p>
            </div>
             <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackNavigation} 
                  className="w-full"
                  isLoadingWithBar={isNavigatingBack}
                  loadingBarDirection="rtl"
                  disabled={isSubmitting || authLoading || isNavigatingBack}
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                </Button>
                <Button 
                  onClick={handleNextStep} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  isLoadingWithBar={isSubmitting}
                  disabled={isSubmitting || authLoading || isNavigatingBack}
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Next: View Profile Summary
                </Button>
              </div>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              We're excited to have you on board!
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
