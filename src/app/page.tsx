
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
import { MoveUpRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
          router.push('/home'); 
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
        "relative flex flex-col min-h-screen items-center justify-center p-4 text-white overflow-hidden"
    )}>
        {/* Background Image and Overlay */}
        <Image
            src="https://picsum.photos/seed/yogapose/1920/1080"
            alt="Person doing yoga outdoors"
            fill
            className="object-cover -z-10"
            data-ai-hint="yoga nature"
            priority
        />
        <div className="absolute inset-0 bg-black/60 -z-10" />
        
         <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-3 font-script">{t('snapYogaTitle')}</h2>
            <div className="mt-2 text-sm text-white/80 max-w-md sm:text-base">
                <p>yoga feedback • progress tracking • mindful practice</p>
                <p>Your AI companion</p>
            </div>
            <Button
                onClick={handleGetStarted}
                className="mt-8 rounded-full h-10 w-auto px-6 bg-white/30 hover:bg-white/50 text-white text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
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
                <Button variant="outline" onClick={handleLanguageSwitch} className="h-9 px-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/40" aria-label="Switch Language">
                <span className="mr-2">🇮🇩</span> Bahasa
                </Button>
                <Button variant="ghost" asChild className="h-9 text-white hover:text-white hover:bg-white/20 bg-black/10 backdrop-blur-sm">
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
