
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
import { Inter, Playfair_Display as PlayfairDisplay } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = PlayfairDisplay({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
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
        "flex flex-col min-h-screen items-center justify-center p-8 bg-splash-background font-sans overflow-hidden",
        inter.variable,
        playfair.variable
    )}>
        
        <header className="navbar w-full absolute top-0 left-0">
            <div className="container mx-auto flex justify-end items-center px-4 sm:px-8">
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleLanguageSwitch} className="h-9 px-3 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-splash-foreground border-splash-foreground/20" aria-label="Switch Language">
                <span className="mr-2">🇮🇩</span> Bahasa
                </Button>
                <Button variant="ghost" asChild className="h-9 text-splash-foreground hover:text-splash-foreground hover:bg-white/20 bg-black/10 backdrop-blur-sm">
                <Link href="/auth/signin">
                    {t('signIn')}
                </Link>
                </Button>
            </div>
            </div>
        </header>

        <main className="relative z-10 flex flex-col items-center justify-center flex-grow text-center px-4 animate-in fade-in-0 slide-in-from-top-10 duration-1000 delay-200">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-splash-foreground/90 mb-2 font-serif">{t('snapYogaTitle')}</h2>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-splash-foreground font-serif" dangerouslySetInnerHTML={{ __html: t('landingTitle').replace('Flow', '<b>Flow</b>').replace('Anytime', '<b>Anytime</b>') }}></h1>
            <p className="mt-4 text-lg text-splash-foreground/80 max-w-md sm:text-xl">
            {t('landingSubtitle')}
            </p>
            <Button
            onClick={handleGetStarted}
            className="mt-8 rounded-full h-14 w-auto px-8 bg-white hover:bg-gray-100 text-splash-foreground text-lg font-bold shadow-lg transition-transform hover:scale-105"
            aria-label={t('getStarted')}
            disabled={isLoading}
            >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>{t('getStarted')}</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
            </Button>
        </main>
        
        {/* Paper Cut Effect Divs */}
        <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
            <div className="paper-cut-layer paper-cut-layer-1 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-500"></div>
            <div className="paper-cut-layer paper-cut-layer-2 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-400"></div>
            <div className="paper-cut-layer paper-cut-layer-3 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-300"></div>
            <div className="paper-cut-layer paper-cut-layer-4 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-200"></div>
            <div className="paper-cut-layer paper-cut-layer-5 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-100"></div>
            <div className="paper-cut-layer paper-cut-layer-6 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-0"></div>
        </div>
    </div>
  );
}
