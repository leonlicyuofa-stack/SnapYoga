
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

    // Short delay to allow UI to update if needed (e.g. show loader on button)
    setTimeout(() => {
      if (user) {
        if (userProfile && userProfile.onboardingCompleted) {
          router.push('/dashboard');
        } else {
          // User exists but hasn't completed onboarding
          router.push('/onboarding/gender-profile');
        }
      } else {
        // No user, direct to sign-up
        router.push('/auth/signup');
      }
      // setIsProcessingClick(false); // Reset if navigation fails or for SPA-like non-full reloads.
      // For full page navigations, this component unmounts, so resetting might not be strictly necessary.
    }, 300);
  };

  const isLoading = authLoading || loadingProfile || isProcessingClick;

  return (
    <div className="relative flex min-h-screen flex-col items-stretch justify-between overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://storage.googleapis.com/project-emblem-images/images/woman_meditating_framed_sunset_illustration.png"
          alt="Woman meditating in a framed sunset view"
          layout="fill"
          objectFit="cover"
          priority
          className="opacity-90"
        />
        {/* Dark overlay for better text contrast at the top */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent"></div>
      </div>

      {/* Top Left Content */}
      <div className="relative z-10 p-8 sm:p-10 md:p-12 text-left">
        <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80 uppercase tracking-wider font-medium">
          Welcome to
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold my-1 sm:my-2 text-primary-foreground leading-tight">
          SnapYoga
        </h1>
        <p className="text-xs sm:text-sm text-primary-foreground/70 max-w-xs sm:max-w-sm md:max-w-md">
          Your AI companion for perfecting yoga poses and tracking progress.
        </p>
        <Button
          onClick={handleGetStarted}
          className="mt-6 sm:mt-8 rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-primary-foreground/20 hover:bg-primary-foreground/30 backdrop-blur-sm text-primary-foreground p-0 shadow-lg"
          aria-label="Get Started"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin" /> : <MoveUpRight className="h-6 w-6 sm:h-7 sm:w-7" />}
        </Button>
      </div>

      {/* Bottom Center Pebble with Sunset Glow */}
      <div className="relative z-10 flex justify-center pb-6 sm:pb-8">
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
