
"use client";

import { useRouter } from 'next/navigation';
// Card imports removed
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
      
      {/* Content Wrapper instead of Card */}
      <div className="w-full max-w-lg text-center z-10 p-6 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          Welcome to SnapYoga!
        </h1>
        <p className="text-xs text-muted-foreground">
          We're thrilled to have you join our community! SnapYoga uses AI to help you analyze your yoga poses, track your progress, and achieve your wellness goals. Let's get you set up.
        </p>
        
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
            (authLoading || loadingProfile) ? "cursor-default" : "cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-black/10 dark:hover:bg-white/10"
          )}
          aria-label="Get Started"
        >
          {(authLoading || loadingProfile) ? (
            <Loader2 className="h-24 w-24 animate-spin text-primary my-4" />
          ) : (
            <>
              <SmileyPebbleIcon className="h-24 w-24 animate-pebble-pulse text-primary group-hover:scale-105 transition-transform" />
              <p className="mt-1 text-base text-muted-foreground group-hover:text-foreground transition-colors">
                click to enter
              </p>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          You're one step closer to a more mindful yoga experience.
        </p>
      </div>
    </div>
  );
}
