
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
      {/* Left Pane (60%) */}
      <div className="w-[60%] bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col justify-between p-6 sm:p-10">
        <div></div> {/* Top spacer */}

        <main className="relative z-10">
            <h1 className="text-5xl font-bold tracking-tight text-primary mb-2 relative inline-block">
                SnapYoga
                <svg
                    className="absolute -bottom-2 -left-2 -right-2 h-[120%] w-[110%] text-accent/70 -z-10"
                    viewBox="0 0 300 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    >
                    <path
                        d="M3.5 31.9731C51.6667 12.3065 168 -15.0269 294.5 24.9731C229.5 35.4731 106.667 52.8065 53 58.9731C28.2 62.2731 11.5 54.9731 3.5 49.4731"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="animate-brush-stroke"
                    />
                </svg>
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground max-w-lg leading-tight" dangerouslySetInnerHTML={{ __html: t('landingTitle') }}>
            </h2>
            <p className="mt-4 text-lg text-foreground/80 max-w-md sm:text-xl">
            {t('landingSubtitle')}
            </p>
            <Button
            onClick={handleGetStarted}
            className="mt-8 rounded-full h-12 w-auto px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-lg transition-transform hover:scale-105"
            aria-label={t('getStarted')}
            disabled={isLoading}
            >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>{t('getStarted')}</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
            </Button>
        </main>

        <div></div> {/* Bottom spacer */}
      </div>
      
      {/* Right Pane (40%) with masked frame */}
      <div className="w-[40%] h-screen relative">
         <header className="absolute top-0 right-0 z-10 flex justify-end items-center p-6 sm:p-10">
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleLanguageSwitch} className="h-9 px-3 bg-background/50 backdrop-blur-sm hover:bg-background/80" aria-label="Switch Language">
                  <span className="mr-2">🇮🇩</span> Bahasa
                </Button>
                <Button variant="ghost" asChild className="h-9 text-white hover:text-white hover:bg-white/20 bg-black/20 backdrop-blur-sm">
                    <Link href="/auth/signin">
                        {t('signIn')}
                    </Link>
                </Button>
            </div>
        </header>

        <div className="absolute inset-0"
             style={{ 
                maskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
             }}
        >
          <Image
            src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHx5b2dhfGVufDB8fHx8MTc1MjU5Mzc5NXww&ixlib=rb-4.1.0&q=80&w=1080"
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
