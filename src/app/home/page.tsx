
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
        "relative flex flex-col min-h-screen items-center justify-center p-4 bg-splash-background font-sans overflow-hidden",
        inter.variable,
        greatVibes.variable
    )}>
        {/* Full-screen background illustration */}
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                    <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--splash-cat-pink))', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--splash-cat-pink))', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>

                {/* Yin-Yang Style Background */}
                <path d="M 0,0 L 100,0 C 50,50 100,50 100,100 L 0,100 Z" fill="hsl(var(--splash-cat-pink))" />
                <path d="M 0,100 C 50,50 0,50 0,0" fill="hsl(var(--splash-background))" />

                {/* Light Blue Cat with Smiley Face and Blush */}
                <g transform="translate(-10, 10)">
                    <path d="M 5,65 C 15,40 40,30 65,55 C 80,70 70,95 45,98 C 20,101 0,80 5,65 Z" fill="hsl(var(--splash-cat-blue-light))" />
                    {/* Airbrushed Blush */}
                    <ellipse cx="38" cy="78" rx="10" ry="7" fill="url(#blushGradient)" />
                    <ellipse cx="62" cy="78" rx="10" ry="7" fill="url(#blushGradient)" />
                    {/* Smiley Face */}
                    <ellipse cx="45" cy="72" rx="3" ry="4" fill="#2C3E50" />
                    <ellipse cx="58" cy="72" rx="3" ry="4" fill="#2C3E50" />
                    <path d="M 48,80 Q 52,85 56,80" stroke="#2C3E50" fill="none" strokeWidth="1" strokeLinecap="round" />
                </g>
                
                {/* Pastel Green Cat */}
                 <g transform="translate(-10, -5) scale(0.7)">
                    <path d="M 5,65 C 15,40 40,30 65,55 C 80,70 70,95 45,98 C 20,101 0,80 5,65 Z" fill="hsl(var(--splash-cat-green))" />
                </g>

                {/* Pastel Grey Cat */}
                <g transform="translate(5, -20) scale(0.5)">
                    <path d="M 5,65 C 15,40 40,30 65,55 C 80,70 70,95 45,98 C 20,101 0,80 5,65 Z" fill="hsl(var(--splash-cat-grey))" />
                </g>
            </svg>
        
         <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-splash-foreground mb-3">{t('snapYogaTitle')}</h2>
            <p className="mt-2 text-sm text-splash-foreground/80 max-w-xs sm:text-base">
                {t('landingSubtitle')}
            </p>
            <Button
                onClick={handleGetStarted}
                className="mt-8 rounded-full h-10 w-auto px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                aria-label={t('getStarted')}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>{t('getStarted')}</span><MoveUpRight className="h-5 w-5 ml-2" /></>}
            </Button>
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

    </div>
  );
}
