
"use client";

import { useRouter } from 'next/navigation';
// Removed Button import as it's no longer used directly for the main action
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 overflow-hidden">
        {/* Background Yoga Pose Shadow */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10">
          <Image
            src="https://placehold.co/800x600.png" 
            alt="Yoga pose shadow background"
            layout="fill"
            objectFit="contain" 
            className="transform scale-150" 
            data-ai-hint="yoga pose silhouette"
            priority
          />
        </div>
        
        <Card className="w-full max-w-lg shadow-xl text-center overflow-hidden z-10 bg-transparent backdrop-blur-sm">
          <CardHeader className="bg-transparent p-6">
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-2">
              Welcome to SnapYoga!
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-3 px-2">
               We're thrilled to have you join our community! SnapYoga uses AI to help you analyze your yoga poses, track your progress, and achieve your wellness goals. Let's get you set up.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0"> {/* Further reduced padding */}
            <div
              onClick={!(authLoading || loadingProfile) ? handleGetStarted : undefined}
              role={!(authLoading || loadingProfile) ? "button" : undefined}
              tabIndex={!(authLoading || loadingProfile) ? 0 : undefined}
              onKeyDown={(e) => {
                if (!(authLoading || loadingProfile) && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault(); 
                  handleGetStarted();
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center text-center py-2 rounded-lg transition-colors",
                (authLoading || loadingProfile) ? "cursor-default" : "cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-black/5 dark:hover:bg-white/5"
              )}
              aria-label="Get Started"
            >
              {(authLoading || loadingProfile) ? (
                <Loader2 className="h-20 w-20 animate-spin text-primary my-4" />
              ) : (
                <>
                  <SmileyPebbleIcon className="h-32 w-32 animate-pebble-pulse text-primary group-hover:scale-105 transition-transform" />
                  <p className="mt-2 text-base text-muted-foreground group-hover:text-foreground transition-colors">
                    click to enter
                  </p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-transparent p-4">
            <p className="text-xs text-muted-foreground w-full">
                You're one step closer to a more mindful yoga experience.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
