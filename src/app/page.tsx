
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
// AppShell import removed
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Define UserProfileData interface
interface UserProfileData extends DocumentData {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  onboardingCompleted?: boolean;
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
            setUserProfile(null);
        })
        .finally(() => setLoadingProfile(false));
    } else if (!user && !authLoading) {
      setUserProfile(null);
      setLoadingProfile(false);
    }
  }, [user, authLoading]);

  const handleGetStarted = () => {
    if (authLoading || loadingProfile) return;

    if (user) {
      if (userProfile && userProfile.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        // If profile is still loading but user exists, or if onboarding isn't complete
        router.push('/auth/onboarding/details');
      }
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center py-12 overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <Image
          src="https://placehold.co/800x600.png" 
          alt="Abstract background"
          layout="fill"
          objectFit="cover" 
          className="animate-bg-abstract"
          data-ai-hint="abstract lines icon"
          priority
        />
      </div>
      
      <Card className="w-full max-w-lg shadow-xl text-center overflow-hidden z-10 bg-transparent backdrop-blur-sm">
        <CardHeader className="bg-transparent p-6">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-2">
            Welcome to SnapYoga!
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-3 px-2">
             We're thrilled to have you join our community! SnapYoga uses AI to help you analyze your yoga poses, track your progress, and achieve your wellness goals. Let's get you set up.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
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
                <SmileyPebbleIcon className="h-24 w-24 animate-pebble-pulse text-primary group-hover:scale-105 transition-transform" />
                <p className="mt-1 text-base text-muted-foreground group-hover:text-foreground transition-colors">
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
  );
}
