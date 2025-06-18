
"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';
import { cn } from '@/lib/utils';
import { MoveUpRight, Loader2 } from 'lucide-react';

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
  const [isProcessingClick, setIsProcessingClick] = useState(false);

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
    if (authLoading || loadingProfile || isProcessingClick) return;

    setIsProcessingClick(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('snapYogaPebbleIncoming', 'true');
    }

    setTimeout(() => {
      if (user) {
        if (userProfile && userProfile.onboardingCompleted) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding/gender-profile');
        }
      } else {
        router.push('/auth/signup');
      }
    }, 300); 
  };

  const isLoading = authLoading || loadingProfile || isProcessingClick;

  return (
    <div className="relative flex min-h-screen flex-col items-stretch justify-between overflow-hidden bg-background">
      {/* Top Left Content */}
      <div className="relative z-10 p-8 sm:p-10 md:p-12 text-left">
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground uppercase tracking-wider font-medium">
          Welcome to
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold my-1 sm:my-2 text-primary leading-tight">
          SnapYoga
        </h1>
        <p className="text-xs sm:text-sm text-foreground/80 max-w-xs sm:max-w-sm md:max-w-md">
          Your AI companion for perfecting yoga poses and tracking progress.
        </p>
        <Button
          onClick={handleGetStarted}
          className="mt-6 sm:mt-8 rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-primary hover:bg-primary/90 text-primary-foreground p-0 shadow-lg"
          aria-label="Get Started"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin" /> : <MoveUpRight className="h-6 w-6 sm:h-7 sm:w-7" />}
        </Button>
      </div>

      {/* Bottom Center Pebble with Sunset Glow */}
      <div className="relative z-10 flex justify-center pb-6 sm:pb-8 mt-auto"> {/* Added mt-auto to push to bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
          {/* Sunset glow element */}
          <div
            className="absolute bottom-0 w-40 h-20 sm:w-48 sm:h-24 bg-radial-sunset-glow opacity-60 blur-xl"
            aria-hidden="true"
          ></div>
          <SmileyPebbleIcon
            className={cn(
              "h-16 w-16 sm:h-20 sm:w-20 text-accent relative z-20 drop-shadow-lg",
              isLoading ? "animate-pebble-hop" : "animate-pebble-pulse"
            )}
          />
        </div>
      </div>
    </div>
  );
}
