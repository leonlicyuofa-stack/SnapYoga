
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';

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
        router.push('/auth/onboarding/details');
      }
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-stretch justify-end overflow-hidden bg-background text-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://placehold.co/1200x800.png"
          alt="Abstract background"
          layout="fill"
          objectFit="cover"
          className="animate-bg-abstract opacity-30"
          data-ai-hint="abstract organic waves light"
          priority
        />
      </div>

      {/* Illustration Area */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center pt-10 sm:pt-16 md:pt-20 px-4">
        <Image
          src="https://placehold.co/300x280.png"
          alt="Woman in yoga pose with foliage"
          width={300}
          height={280}
          className="object-contain max-w-[70vw] sm:max-w-[50vw] md:max-w-[300px]"
          data-ai-hint="woman meditating yoga foliage"
        />
      </div>

      {/* Text and Button Overlay Area */}
      <div className="relative z-20 mt-[-60px] sm:mt-[-80px] md:mt-[-100px] flex justify-center px-4 pb-8 sm:pb-12 md:pb-16">
        <div className="bg-secondary/20 dark:bg-secondary/30 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg text-center">
          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-primary dark:text-primary-foreground leading-tight mb-6 sm:mb-8">
            Let the <span className="font-semibold">threads of</span>
            <br className="xs:hidden sm:inline-block" /> life get connected
            <br />
            with <Sparkles className="inline-block h-5 w-5 sm:h-6 sm:w-6 text-accent mx-1" />
            <span className="font-semibold">yoga</span>
          </h1>

          {/* Get Started Button */}
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-accent hover:bg-accent/80 text-accent-foreground rounded-xl py-3 px-6 sm:px-8 text-base sm:text-lg shadow-xl transition-transform transform hover:scale-105 w-full max-w-[280px] sm:max-w-xs mx-auto"
            disabled={authLoading || loadingProfile}
            aria-label="Get Started"
          >
            {authLoading || loadingProfile ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
