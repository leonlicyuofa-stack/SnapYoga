"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MoveUpRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

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
    }, 150); 
  };

  const isLoading = authLoading || loadingProfile || isProcessingClick;

  return (
    <div className="relative flex min-h-screen flex-col items-stretch justify-start overflow-hidden">
      {/* Background Image and Overlay */}
      <Image
        src="https://i.imgur.com/ncJiSEV.png"
        alt="Woman doing yoga in a brightly lit room"
        data-ai-hint="yoga pose room"
        fill
        className="-z-10 object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* Top Left Content */}
      <div className="relative z-10 p-8 sm:p-10 md:p-12 text-left">
        <p className="text-2xl text-stone-200 uppercase tracking-wider font-medium sm:text-3xl md:text-4xl">
          Welcome to
        </p>
        <div className="flex items-center my-1 sm:my-2">
          <h1 className="text-5xl font-extrabold text-white leading-tight sm:text-6xl md:text-7xl">
            SnapYoga
          </h1>
        </div>
        <p className="text-lg text-stone-300 max-w-xs sm:max-w-sm md:max-w-md sm:text-xl md:text-2xl">
          Your AI companion<br />for perfecting yoga poses<br />and tracking progress.
        </p>
        <Button
          onClick={handleGetStarted}
          className="mt-6 rounded-full w-14 h-14 bg-white/90 hover:bg-white text-primary p-0 shadow-lg sm:mt-8 sm:w-16 sm:h-16"
          aria-label="Get Started"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin sm:h-7 sm:w-7" /> : <MoveUpRight className="h-6 w-6 sm:h-7 sm:w-7" />}
        </Button>
      </div>
    </div>
  );
}
