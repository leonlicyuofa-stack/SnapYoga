
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MoveUpRight } from 'lucide-react';
import Image from 'next/image';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { WelcomeRock } from '@/components/icons/rocks/welcome-rock';

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
    
    // Set a flag that can be used by the destination page for animations
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('snapYogaPebbleIncoming', 'true');
    }

    setTimeout(() => {
      if (user) {
        if (userProfile && userProfile.onboardingCompleted) {
          router.push('/dashboard');
        } else {
          router.push('/welcome'); 
        }
      } else {
        router.push('/auth/signup');
      }
    }, 150); 
  };

  const isLoading = authLoading || loadingProfile || isProcessingClick;

  return (
    <div className="relative flex min-h-screen flex-col items-stretch justify-between overflow-hidden">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-orange-500/20 to-green-500/20 opacity-30"></div>
       <Image
        src="https://i.imgur.com/ncJiSEV.png"
        alt="Woman doing yoga in a brightly lit room with tropical plants"
        data-ai-hint="yoga pose room plants"
        fill
        className="-z-10 object-cover opacity-80"
        priority
      />
      <div className="absolute inset-0 bg-background/50 -z-10" />

      {/* Top Left Content */}
      <header className="relative z-10 p-6 sm:p-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <WelcomeRock className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-extrabold text-foreground leading-tight">
                SnapYoga
            </h1>
        </div>
        <Button variant="ghost" asChild>
            <Link href="/auth/signin">
                Sign In
            </Link>
        </Button>
      </header>

      {/* Bottom Left Content */}
      <main className="relative z-10 p-6 sm:p-10">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground max-w-lg leading-tight">
          Find Your Flow,<br />Perfect Your Form.
        </h2>
        <p className="mt-4 text-lg text-foreground/80 max-w-md sm:text-xl">
          Your AI companion for personalized yoga feedback, progress tracking, and mindful practice.
        </p>
        <Button
          onClick={handleGetStarted}
          className="mt-8 rounded-full h-16 w-auto px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold shadow-lg transition-transform hover:scale-105"
          aria-label="Get Started"
          disabled={isLoading}
        >
          {isLoading ? <SmileyRockLoader /> : <><span>Get Started</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
        </Button>
      </main>
    </div>
  );
}
