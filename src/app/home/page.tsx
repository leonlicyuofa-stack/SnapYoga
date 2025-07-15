
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
import { useLanguage } from '@/contexts/LanguageContext';

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
    <div className="flex min-h-screen flex-row items-stretch bg-background overflow-hidden">
      {/* Left Pane (70%) */}
      <div className="w-[70%] bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col justify-between p-6 sm:p-10">
        <header className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <SmileyRockLoader />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleLanguageSwitch} className="h-9 px-3" aria-label="Switch Language">
                <span className="mr-2">🇮🇩</span> Bahasa
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/auth/signin">
                        {t('signIn')}
                    </Link>
                </Button>
            </div>
        </header>

        <main className="relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground max-w-lg leading-tight" dangerouslySetInnerHTML={{ __html: t('landingTitle') }}>
            </h2>
            <p className="mt-4 text-lg text-foreground/80 max-w-md sm:text-xl">
            {t('landingSubtitle')}
            </p>
            <Button
            onClick={handleGetStarted}
            className="mt-8 rounded-full h-16 w-auto px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold shadow-lg transition-transform hover:scale-105"
            aria-label={t('getStarted')}
            disabled={isLoading}
            >
            {isLoading ? <SmileyRockLoader /> : <><span>{t('getStarted')}</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
            </Button>
        </main>

        {/* This empty div helps with the flex layout for vertical positioning */}
        <div></div>
      </div>
      
      {/* Right Pane (30%) with masked frame */}
      <div className="w-[30%] h-screen relative">
        <div className="absolute inset-0"
             style={{ 
                maskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
             }}
        >
          <Image
            src="/images/headstand.png"
            alt="Person doing yoga in a serene landscape"
            fill
            className="object-cover"
            priority
            data-ai-hint="yoga serene landscape"
          />
        </div>
      </div>

    </div>
  );
}
