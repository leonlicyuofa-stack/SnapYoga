
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MoveUpRight, Loader2 } from 'lucide-react';
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
  const [activeCard, setActiveCard] = useState<string | null>('pebble');

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
  
  const handleCardClick = (cardName: string) => {
    setActiveCard(cardName);
  };


  const isLoading = authLoading || loadingProfile || isProcessingClick;

  return (
    <div className="main-container flex flex-col justify-between">
      <header className="navbar w-full">
        <div className="container mx-auto flex justify-end items-center p-6 sm:p-10">
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
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90 mb-2">SnapYoga</h2>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white" dangerouslySetInnerHTML={{ __html: t('landingTitle').replace('Flow', '<b>Flow</b>').replace('Anytime', '<b>Anytime</b>') }}></h1>
        <p className="mt-4 text-lg text-pink-100/90 max-w-md sm:text-xl">
          {t('landingSubtitle')}
        </p>
        <Button
          onClick={handleGetStarted}
          className="mt-8 rounded-full h-14 w-auto px-8 bg-white hover:bg-gray-100 text-pink-600 text-lg font-bold shadow-lg transition-transform hover:scale-105"
          aria-label={t('getStarted')}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>{t('getStarted')}</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
        </Button>
      </main>

      {/* Character Containers */}
      <div className="w-full relative pb-8 px-4">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
            <div 
              className={cn("character-card", {'active': activeCard === 'pebble'})}
              onClick={() => handleCardClick('pebble')}
            >
              <div className="character-emoji pebble-emoji"><SmileyPebbleIcon className="w-24 h-24 sm:w-32 sm:h-32 text-gray-600" /></div>
              <div className="character-name">Zen Master</div>
            </div>
            <div 
              className={cn("character-card", {'active': activeCard === 'penguin'})}
              onClick={() => handleCardClick('penguin')}
            >
              <div className="character-emoji penguin-emoji"><PenguinIcon className="w-24 h-24 sm:w-32 sm:h-32 text-pink-300" /></div>
              <div className="character-name">Pose Perfector</div>
            </div>
            <div 
              className={cn("character-card", {'active': activeCard === 'avocado'})}
              onClick={() => handleCardClick('avocado')}
            >
              <div className="character-emoji avocado-emoji"><AvocadoIcon className="w-24 h-24 sm:w-32 sm:h-32" /></div>
              <div className="character-name">Tree Pose Master</div>
            </div>
        </div>
      </div>
    </div>
  );
}
