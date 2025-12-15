
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
import { YogaMatMascot } from '@/components/icons/YogaMatMascot';

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
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    const animationTimer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 700); // Should match the animation duration in tailwind.config.ts

    return () => clearTimeout(animationTimer);
  }, []);

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
      router.push('/auth/signup');
    }, 150); 
  };

  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };

  const isLoading = authLoading || loadingProfile || isProcessingClick;

  return (
    <div className={cn(
        "relative flex flex-col min-h-screen items-center justify-center p-4 bg-splash-background font-sans overflow-hidden"
    )}>
        {/* Full-screen background illustration */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[hsl(var(--splash-blob-1))] via-background to-[hsl(var(--splash-blob-2))] animate-breathing-bg">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                    <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
                <path d="M 0,0 L 100,0 C 50,50 100,50 100,100 L 0,100 Z" fill="hsl(var(--splash-blob-1))" />
                <path d="M 0,100 C 50,50 0,50 0,0" fill="hsl(var(--splash-background))" />
                <path d="M 100,0 L 0,0 C 50,50 0,50 0,100 L 100,100 Z" fill="hsl(var(--splash-blob-2))" style={{ opacity: 0.5 }}/>
            </svg>
        </div>
        
         <div className="relative z-10 flex flex-col items-center justify-center text-center animate-zoom-in -translate-y-8">
            <YogaMatMascot className="h-24 w-24 text-primary mb-2" />
            <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-splash-foreground mb-3 font-script">{t('snapYogaTitle')}</h2>
        </div>

        <header className="navbar w-full absolute top-0 left-0 z-20">
            <div className="container mx-auto flex justify-between items-center px-4 sm:px-8">
            <div></div>
            
            </div>
        </header>

        {isAnimationComplete && (
            <Button
                onClick={handleGetStarted}
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 p-0 bg-white/30 hover:bg-white/50 text-splash-foreground shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40 animate-in fade-in duration-500"
                aria-label={t('getStarted')}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <MoveUpRight className="h-8 w-8" />}
            </Button>
        )}

    </div>
  );
}
