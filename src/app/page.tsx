
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
import { GeminiIcon } from '@/components/icons/GeminiIcon';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

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
  const [animationState, setAnimationState] = useState<'idle' | 'glowing' | 'streaking'>('idle');


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
    setAnimationState('glowing');
    
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('snapYogaPebbleIncoming', 'true');
    }
    
    // Animation timing
    setTimeout(() => {
        setAnimationState('streaking');
    }, 400); // Duration of glow/expand

    // Page navigation timing
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
    }, 900); // glowing (400) + streaking (500)
  };

  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };

  const isLoading = authLoading || loadingProfile;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Pink Section */}
      <div className="relative flex flex-col items-center justify-center p-4 bg-[hsl(var(--home-pink-bg))] text-[hsl(var(--home-pink-fg)] flex-grow-[2]">
        <header className="absolute top-0 left-0 w-full p-4">
           <div className="container mx-auto flex justify-between items-center px-4 sm:px-8">
            <div></div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleLanguageSwitch} className="h-9 px-3 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-black border-black/20" aria-label="Switch Language">
                <span className="mr-2">🇮🇩</span> Bahasa
                </Button>
                <Button variant="ghost" asChild className="h-9 text-black hover:text-black hover:bg-white/20 bg-black/10 backdrop-blur-sm">
                <Link href="/auth/signin">
                    {t('signIn')}
                </Link>
                </Button>
            </div>
            </div>
        </header>
        <div className="text-center">
            <SnapYogaLogo className="text-[hsl(var(--home-pink-fg))] h-16 w-auto mx-auto" />
            <p className={cn("mt-2 text-xl sm:text-2xl", shadowsIntoLight.className)}>your AI companion for mindfulness</p>
        </div>
      </div>
      
      {/* Curved Divider */}
      <div className="wave-divider"></div>

      {/* Bottom Dark Section */}
      <div className="relative flex flex-col items-center justify-center p-8 bg-[hsl(var(--home-dark-bg))] text-white flex-grow-[1]">
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white mb-3 font-script">
              <span className="animate-snap-flash inline-block">Snap</span>
              <span>Yoga</span>
            </h2>
            <div className={cn("mt-2 text-xl max-w-md sm:text-2xl opacity-80", shadowsIntoLight.className)}>
                <p>your AI companion for mindfulness</p>
            </div>

            <div className="mt-8" onClick={handleGetStarted} role="button" aria-label={t('getStarted')}>
                <GeminiIcon animationState={animationState} />
            </div>
        </div>
      </div>
    </div>
  );
}
