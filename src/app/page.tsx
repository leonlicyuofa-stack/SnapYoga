
"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';
import { cn } from '@/lib/utils';

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
  const [isNavigatingWithPebble, setIsNavigatingWithPebble] = useState(false);

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
    if (authLoading || loadingProfile || isNavigatingWithPebble) return;

    setIsNavigatingWithPebble(true);
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
    }, 700); // Duration matches pebble-run-right animation
  };

  const isLoading = authLoading || loadingProfile;

  return (
    <div className="relative flex min-h-screen flex-col items-stretch justify-end overflow-hidden text-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://storage.googleapis.com/project-emblem-images/images/woman_meditating_framed_sunset_illustration.png"
          alt="Woman meditating in a framed sunset view"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      {/* Content Card Area */}
      <div className="relative z-20 flex justify-center px-4 pb-8 sm:pb-12 md:pb-16">
        <div className="bg-primary/80 dark:bg-primary/70 text-primary-foreground backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg text-center">
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Welcome to SnapYoga!
          </h1>

          <p className="text-xs sm:text-sm text-primary-foreground/90 mb-6">
            We&apos;re thrilled to have you join our community! SnapYoga uses AI to help you
            analyze your yoga poses, track your progress, and achieve your wellness goals.
            Let&apos;s get you set up.
          </p>

          <div
            onClick={handleGetStarted}
            className={cn(
              "group cursor-pointer rounded-full p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
              !isNavigatingWithPebble && "hover:bg-black/10 dark:hover:bg-white/5"
            )}
            role="button"
            tabIndex={isNavigatingWithPebble ? -1 : 0}
            onKeyDown={(e) => { if (!isNavigatingWithPebble && (e.key === 'Enter' || e.key === ' ')) handleGetStarted(); }}
            aria-label="Get Started / Click to enter"
          >
            <SmileyPebbleIcon 
              className={cn(
                "h-20 w-20 sm:h-24 sm:w-24 text-accent mx-auto",
                isNavigatingWithPebble ? "animate-pebble-run-right" : 
                isLoading ? "animate-pebble-hop" : "animate-pebble-pulse"
              )} 
            />
          </div>

          <p className="text-xs sm:text-sm text-primary-foreground/80 group-hover:text-primary-foreground transition-colors mt-2">
            {isNavigatingWithPebble ? "Let's Go!" : "click to enter"}
          </p>
        </div>
      </div>
    </div>
  );
}
