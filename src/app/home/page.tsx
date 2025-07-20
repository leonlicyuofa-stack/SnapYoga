
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
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { PenguinIcon } from '@/components/icons/penguin-icon';
import { LadybirdIcon } from '@/components/icons/ladybird-icon';
import { AvocadoIcon } from '@/components/icons/avocado-icon';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';

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
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#a2d2ff] text-blue-900 overflow-hidden">
      <header className="w-full absolute top-0 right-0 z-20 flex justify-end items-center p-6 sm:p-10">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleLanguageSwitch} className="h-9 px-3 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-blue-800 border-blue-200" aria-label="Switch Language">
            <span className="mr-2">🇮🇩</span> Bahasa
          </Button>
          <Button variant="ghost" asChild className="h-9 text-white hover:text-white hover:bg-white/20 bg-black/20 backdrop-blur-sm">
            <Link href="/auth/signin">
              {t('signIn')}
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center text-center pt-24 sm:pt-32 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-blue-900" dangerouslySetInnerHTML={{ __html: t('landingTitle').replace('Flow', '<b>Flow</b>').replace('Anytime', '<b>Anytime</b>') }}></h1>
        <p className="mt-4 text-lg text-blue-800/90 max-w-md sm:text-xl">
          {t('landingSubtitle')}
        </p>
        <Button
          onClick={handleGetStarted}
          className="mt-8 rounded-full h-14 w-auto px-8 bg-[#ffafcc] hover:bg-[#ffc8dd] text-pink-900 text-lg font-bold shadow-lg transition-transform hover:scale-105"
          aria-label={t('getStarted')}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>{t('getStarted')}</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
        </Button>
      </main>

      {/* Landscape and Characters */}
      <div className="w-full h-[50vh] relative mt-auto">
        {/* Ground */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[#bde0fe]"></div>
        
        {/* Hills */}
        <div className="absolute bottom-1/3 left-0 w-full h-2/3">
           <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
             <path fill="#a9d6a9" d="M0,192L60,176C120,160,240,128,360,138.7C480,149,600,203,720,224C840,245,960,235,1080,208C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
           </svg>
        </div>
        
        {/* Characters */}
        <div className="absolute inset-0">
          <div className="absolute bottom-[20%] left-[10%] sm:left-[15%] w-24 h-24 sm:w-32 sm:h-32 animate-character-appear" style={{ animationDelay: '200ms'}}>
            <PenguinIcon className="w-full h-full text-pink-300 animate-character-wave" />
          </div>
          <div className="absolute bottom-[10%] left-[40%] sm:left-[45%] w-20 h-20 sm:w-28 sm:h-28 animate-character-appear" style={{ animationDelay: '600ms'}}>
            <SmileyPebbleIcon className="w-full h-full animate-pebble-pulse" />
          </div>
          <div className="absolute bottom-[25%] right-[12%] sm:right-[18%] w-20 h-20 sm:w-24 sm:h-24 animate-character-appear" style={{ animationDelay: '400ms'}}>
            <AvocadoIcon className="w-full h-full animate-character-wave" style={{ animationDelay: '1s' }} />
          </div>
           <div className="absolute bottom-[5%] right-[35%] sm:right-[40%] w-16 h-16 sm:w-20 sm:h-20 animate-character-appear" style={{ animationDelay: '800ms'}}>
            <LadybirdIcon className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
