"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MoveUpRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Inter, Great_Vibes as GreatVibes } from 'next/font/google';
import { PebbleStackMascot } from '@/components/icons/PebbleStackMascot';
import { AvocadoIcon } from '@/components/icons/avocado-icon';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const greatVibes = GreatVibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
});


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
  const { t, language, setLanguage } = useLanguage();
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
          router.push('/welcome'); 
        }
      } else {
        router.push('/auth/signup');
      }
    }, 150); 
  };

  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };

  const isLoading = authLoading || loadingProfile || isProcessingClick;

  return (
    <div className={cn(
        "relative flex flex-col min-h-screen items-center justify-center p-8 bg-[#C5E1A5] font-sans overflow-hidden",
        inter.variable,
        greatVibes.variable
    )}>
        
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#A8D8F0] to-[#C5E1A5]" />
        
        {/* Animated Clouds */}
        <div className="absolute top-10 w-[200%] h-48 opacity-70 animate-clouds" style={{ animationDuration: '80s' }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <path d="M 50 100 C 50 70, 80 70, 100 80 C 130 70, 150 70, 150 100 C 170 100, 170 130, 150 130 L 50 130 C 30 130, 30 100, 50 100 Z" fill="white" />
                <path d="M 250 80 C 250 50, 280 50, 300 60 C 330 50, 350 50, 350 80 C 370 80, 370 110, 350 110 L 250 110 C 230 110, 230 80, 250 80 Z" fill="white" transform="scale(1.2)" />
                <path d="M 450 120 C 450 90, 480 90, 500 100 C 530 90, 550 90, 550 120 C 570 120, 570 150, 550 150 L 450 150 C 430 150, 430 120, 450 120 Z" fill="white" transform="scale(0.9)" />
                <path d="M 650 90 C 650 60, 680 60, 700 70 C 730 60, 750 60, 750 90 C 770 90, 770 120, 750 120 L 650 120 C 630 120, 630 90, 650 90 Z" fill="white" />
                <path d="M 850 110 C 850 80, 880 80, 900 90 C 930 80, 950 80, 950 110 C 970 110, 970 140, 950 140 L 850 140 C 830 140, 830 110, 850 110 Z" fill="white" transform="scale(1.1)" />
            </svg>
        </div>
         <div className="absolute top-24 w-[200%] h-48 opacity-50 animate-clouds" style={{ animationDuration: '120s', animationDirection: 'reverse' }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <path d="M 50 130 C 50 100, 80 100, 100 110 C 130 100, 150 100, 150 130 C 170 130, 170 160, 150 160 L 50 160 C 30 160, 30 130, 50 130 Z" fill="white" transform="scale(0.8)" />
                <path d="M 250 110 C 250 80, 280 80, 300 90 C 330 80, 350 80, 350 110 C 370 110, 370 140, 350 140 L 250 140 C 230 140, 230 110, 250 110 Z" fill="white" />
                <path d="M 450 140 C 450 110, 480 110, 500 120 C 530 110, 550 110, 550 140 C 570 140, 570 170, 550 170 L 450 170 C 430 170, 430 140, 450 140 Z" fill="white" transform="scale(1.3)" />
                <path d="M 650 100 C 650 70, 680 70, 700 80 C 730 70, 750 70, 750 100 C 770 100, 770 130, 750 130 L 650 130 C 630 130, 630 100, 650 100 Z" fill="white" transform="scale(0.9)" />
                <path d="M 850 130 C 850 100, 880 100, 900 110 C 930 100, 950 100, 950 130 C 970 130, 970 160, 950 160 L 850 160 C 830 160, 830 130, 850 130 Z" fill="white" />
            </svg>
        </div>


        {/* Mountain */}
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-[#A5D6A7] rounded-t-[100%_80px]" />
        <div className="absolute bottom-0 left-0 w-full h-[35%] bg-[#81C784]/70 rounded-t-[100%_60px]" />
        
        {/* Mascots & Tree */}
        <PebbleStackMascot className="absolute bottom-4 left-4 sm:left-12 md:left-24 w-28 h-28 sm:w-32 sm:h-32 z-10" />

        <div className="absolute bottom-0 right-0 h-[60%] w-[35%] z-10">
            {/* Tree */}
            <svg viewBox="0 0 200 400" className="w-full h-full" preserveAspectRatio="xMaxYMax meet">
                {/* Trunk */}
                <path d="M 150 400 L 150 200 Q 140 150 100 150" stroke="#8D6E63" fill="#8D6E63" strokeWidth="10" />
                {/* Leaves */}
                <circle cx="100" cy="100" r="100" fill="#66BB6A" />
                <circle cx="150" cy="150" r="80" fill="#4CAF50" />
                <circle cx="50" cy="180" r="70" fill="#81C784" />
            </svg>
            {/* Hanging Avocado */}
            <AvocadoIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24" />
        </div>

        <header className="navbar w-full absolute top-0 left-0">
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

        <main className="relative z-20 flex flex-col items-center justify-center flex-grow text-center px-4 animate-in fade-in-0 slide-in-from-top-10 duration-1000 delay-200 pb-32">
            <svg viewBox="0 0 400 100" className="w-auto h-24 mb-4 drop-shadow-sm">
              <text 
                x="50%" 
                y="50%" 
                dy=".35em"
                textAnchor="middle"
                className="animate-handwriting text-8xl"
                style={{ fontFamily: 'var(--font-great-vibes), cursive', fill: '#263238' }}
              >
                Welcome
              </text>
            </svg>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#37474F] mb-2">{t('snapYogaTitle')}</h2>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#37474F]" dangerouslySetInnerHTML={{ __html: t('landingTitle').replace('Flow', '<b>Flow</b>').replace('Anytime', '<b>Anytime</b>') }}></h1>
            <p className="mt-4 text-xs text-[#455A64] max-w-md sm:text-sm">
            {t('landingSubtitle')}
            </p>
            <Button
            onClick={handleGetStarted}
            className="mt-8 rounded-full h-10 w-auto px-6 bg-white/30 hover:bg-white/50 text-[#263238] text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
            aria-label={t('getStarted')}
            disabled={isLoading}
            >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>{t('getStarted')}</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
            </Button>
        </main>
    </div>
  );
}
