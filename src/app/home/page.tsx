
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
        <div className="absolute inset-0 z-0 opacity-70">
            <svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <g transform="translate(-50, 0)">
                    <path d="M 50,20 C 20,20 20,35 50,35 H 150 C 180,35 180,20 150,20 Z" fill="#F0D9E7" opacity="0.8" />
                    <path d="M 55,40 C 25,40 25,55 55,55 H 145 C 175,55 175,40 145,40 Z" fill="#E1D9F0" opacity="0.8" />
                    <path d="M 60,60 C 30,60 30,75 60,75 H 140 C 170,75 170,60 140,60 Z" fill="#D9E7F0" opacity="0.8" />
                    <path d="M 50,80 C 20,80 20,95 50,95 H 150 C 180,95 180,80 150,80 Z" fill="#D9F0E1" opacity="0.8" />
                    <path d="M 65,100 C 35,100 35,115 65,115 H 135 C 165,115 165,100 135,100 Z" fill="#F0EFD9" opacity="0.8" />
                    <path d="M 45,120 C 15,120 15,135 45,135 H 155 C 185,135 185,120 155,120 Z" fill="#F0D9D9" opacity="0.8" />
                    <path d="M 55,140 C 25,140 25,155 55,155 H 145 C 175,155 175,140 145,140 Z" fill="#F0D9E7" opacity="0.8" />
                    <path d="M 60,160 C 30,160 30,175 60,175 H 140 C 170,175 170,160 140,160 Z" fill="#D9F0E1" opacity="0.8" />
                    <path d="M 50,180 C 20,180 20,195 50,195 H 150 C 180,195 180,180 150,180 Z" fill="#D9E7F0" opacity="0.8" />
                </g>
            </svg>
        </div>
        
         <div className="relative z-10 flex flex-col items-center justify-center text-center -translate-y-8">
            <YogaMatMascot className="h-24 w-24 text-primary mb-2 animate-zoom-in" />
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-splash-foreground mb-1 font-script">{t('snapYogaTitle')}</h2>
            <p className="text-md sm:text-lg text-splash-foreground/80">Master Your Pose. Instantly.</p>
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
