
"use client";

import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext'; // Adjusted import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Sparkles, Users, ArrowRight, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { useState, useEffect } from 'react';

export default function OnboardingAppInfoPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if user is not logged in and auth is not loading
    // This prevents direct access if the onboarding flow wasn't started correctly
    if (!authLoading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);


  const handleCompleteSetup = async () => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Mark onboarding as complete in Firestore
      await createUserProfileDocument(user, { onboardingCompleted: true });
      
      toast({
        title: "🎉 Setup Complete! Welcome to SnapYoga! 🎉",
        description: "You're all set to start your yoga journey with us. Let's get started!",
        duration: 5000,
      });
      router.push('/');
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
      toast({
        title: "Error",
        description: "Could not finalize setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }
  if (!user && !authLoading) {
     return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting...</p></div></AppShell>;
  }


  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">You're Almost There!</CardTitle>
            <CardDescription>Discover what SnapYoga offers and how we can help you.</CardDescription>
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
                <li>Expert Guidance (coming soon): Access tips and video tutorials.</li>
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
            
            <Button 
              onClick={handleCompleteSetup} 
              className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" /> }
              Complete Setup & Go to Homepage
            </Button>
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

