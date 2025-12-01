
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shadows_Into_Light } from 'next/font/google';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { RightArrowIcon } from '@/components/icons/RightArrowIcon';

const shadowsIntoLight = Shadows_Into_Light({
  subsets: ['latin'],
  weight: '400',
});

interface UserProfileData extends DocumentData {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  onboardingCompleted?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'clicked'>('idle');


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
    setAnimationState('clicked');
    
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('snapYogaPebbleIncoming', 'true');
    }
    
    // Page navigation timing
    setTimeout(() => {
      router.push('/auth/signup');
    }, 600); // Duration of the click animation
  };

  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };

  const isLoading = authLoading || loadingProfile;

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Top Right Shapes */}
            <div className="absolute top-0 right-0 w-[80%] h-[40%]">
                <div className="absolute top-0 right-0 w-full h-full bg-secondary/80 rounded-bl-full" style={{transform: 'translate(20%, -20%) scale(1.2)'}}></div>
                <div className="absolute top-0 right-0 w-full h-full bg-primary/70 rounded-bl-full" style={{transform: 'translate(40%, -40%) scale(1.3)'}}></div>
            </div>
            {/* Bottom Left Shapes */}
            <div className="absolute bottom-0 left-0 w-[80%] h-[40%]">
                 <div className="absolute bottom-0 left-0 w-full h-full bg-secondary/80 rounded-tr-full" style={{transform: 'translate(-20%, 20%) scale(1.2)'}}></div>
                 <div className="absolute bottom-0 left-0 w-full h-full bg-primary/70 rounded-tr-full" style={{transform: 'translate(-40%, 40%) scale(1.3)'}}></div>
            </div>
        </div>

      <header className="absolute top-0 left-0 w-full p-4 z-10">
        <div className="container mx-auto flex justify-end items-center px-4 sm:px-8">
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleLanguageSwitch} className="h-9 px-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-foreground border-border/20" aria-label="Switch Language">
                <span className="mr-2">🇮🇩</span> Bahasa
                </Button>
            </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-col items-center justify-center text-center flex-grow">
        <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-3 font-script">
            <span className="animate-snap-flash inline-block">Snap</span>
            <span>Yoga</span>
        </h2>
        <div className={cn("mt-2 text-xl max-w-md sm:text-2xl opacity-80", shadowsIntoLight.className)}>
            <p>your AI companion for mindfulness</p>
        </div>

        <div className="mt-8" onClick={handleGetStarted} role="button" aria-label={t('getStarted')}>
            <RightArrowIcon animationState={animationState} className="text-foreground" />
        </div>
      </div>
    </div>
  );
}
