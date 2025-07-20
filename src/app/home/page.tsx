
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
                <circle cx="100" cy="100" r="50" fill="white" />
                <circle cx="200" cy="80" r="70" fill="white" />
                <circle cx="350" cy="120" r="80" fill="white" />
                <circle cx="550" cy="90" r="60" fill="white" />
                <circle cx="700" cy="110" r="75" fill="white" />
                <circle cx="850" cy="80" r="50" fill="white" />
            </svg>
        </div>
         <div className="absolute top-24 w-[200%] h-48 opacity-50 animate-clouds" style={{ animationDuration: '120s', animationDirection: 'reverse' }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <circle cx="50" cy="130" r="40" fill="white" />
                <circle cx="250" cy="110" r="60" fill="white" />
                <circle cx="450" cy="140" r="70" fill="white" />
                <circle cx="650" cy="100" r="50" fill="white" />
                <circle cx="800" cy="130" r="80" fill="white" />
                <circle cx="950" cy="110" r="40" fill="white" />
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
