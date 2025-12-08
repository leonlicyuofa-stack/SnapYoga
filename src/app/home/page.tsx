
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
import { useLanguage } from '@/contexts/LanguageContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

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
          router.push('/onboarding/gender-profile'); 
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
        "relative flex flex-col min-h-screen bg-background overflow-hidden"
    )}>
        <div className="absolute inset-0 z-0 flex flex-col">
            <div className="h-2/3 w-full bg-[hsl(var(--home-pink-bg))]">
                {/* Topographic pattern could be a background image here */}
            </div>
            <div className="wave-divider -mt-px" />
            <div className="flex-grow bg-background"></div>
        </div>
        
        <header className="navbar w-full absolute top-0 left-0 z-20">
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
        
         <div className="relative z-10 flex flex-col flex-grow items-center justify-end text-center pb-20">
            <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-splash-foreground mb-3 font-script">{t('snapYogaTitle')}</h2>
            <div className="mt-2 text-sm text-splash-foreground/80 max-w-md sm:text-base">
                <p>your AI companion for mindfulness</p>
            </div>
            <Button
                onClick={handleGetStarted}
                className="mt-8 rounded-full h-10 w-auto px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                aria-label={t('getStarted')}
                disabled={isLoading}
            >
                {isLoading ? <SmileyRockLoader /> : <><span>{t('getStarted')}</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
            </Button>
        </div>
    </div>
  );
}
