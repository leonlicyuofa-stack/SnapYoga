
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';
import { ArrowRight, PartyPopper, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';

// Define UserProfileData interface, similar to what was in the old homepage
interface UserProfileData extends DocumentData {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  onboardingCompleted?: boolean;
  // Add other fields if they exist from onboarding like height, weight, etc.
}

export default function WelcomePageAsRoot() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      setLoadingProfile(true);
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfileData);
          } else {
            setUserProfile(null); 
          }
        })
        .catch(error => {
            console.error("Error fetching user profile on welcome page:", error);
            setUserProfile(null); // Ensure profile is null on error
        })
        .finally(() => setLoadingProfile(false));
    } else if (!user && !authLoading) {
      setUserProfile(null); // Clear profile if no user and auth isn't loading
      setLoadingProfile(false); // Ensure loading is false
    }
  }, [user, authLoading]);

  const handleGetStarted = () => {
    if (authLoading || loadingProfile) return;

    if (user) {
      if (userProfile && userProfile.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        // User exists but onboarding not complete, or profile still loading/not found
        router.push('/auth/onboarding/details');
      }
    } else {
      // No user, direct to sign up
      router.push('/auth/signup');
    }
  };

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-xl text-center overflow-hidden">
          <CardHeader className="bg-muted/30 p-8">
            <div className="mb-4">
              <SmileyPebbleIcon className="mx-auto h-20 w-20 text-primary drop-shadow-lg" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-2">
              <PartyPopper className="h-8 w-8" />
              Welcome to SnapYoga!
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-muted-foreground mt-3">
              {/* Removed sentence: "Embark on a journey to perfect your poses and deepen your practice." */}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <p className="text-foreground/80 leading-relaxed">
              We're thrilled to have you join our community! SnapYoga uses AI to help you
              analyze your yoga poses, track your progress, and achieve your wellness goals.
              Let's get you set up.
            </p>
            <Button
              onClick={handleGetStarted}
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              size="lg"
              disabled={authLoading || loadingProfile}
            >
              {(authLoading || loadingProfile) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Let's Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
          <CardFooter className="bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground w-full">
                You're one step closer to a more mindful yoga experience.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
