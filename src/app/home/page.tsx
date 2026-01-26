"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { RightArrowIcon } from '@/components/icons/RightArrowIcon';

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [arrowAnimationState, setArrowAnimationState] = useState<'idle' | 'clicked'>('idle');


  const handleGetStarted = () => {
    if (isProcessingClick) return;

    setIsProcessingClick(true);
    setArrowAnimationState('clicked');
    
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('snapYogaPebbleIncoming', 'true');
    }

    setTimeout(() => {
      router.push('/auth/signup');
    }, 600); // Wait for the arrow animation to complete before navigating
  };

  return (
    <div className="relative min-h-screen font-serif text-white bg-home-dark-bg">
      {/* Background Image */}
      <Image
        src="https://picsum.photos/seed/yogawellness/1920/1080"
        alt="A tranquil, modern space for practicing yoga."
        fill
        className="object-cover"
        data-ai-hint="modern wellness room"
        priority
      />
      <div className="absolute inset-0 bg-black/40" /> {/* Overlay for contrast */}

      {/* Main Content Panel */}
      <div className="absolute inset-y-0 left-0 w-full md:w-1/2 flex flex-col bg-black/20 backdrop-blur-lg">
        
        {/* Header */}
        <header className="flex justify-between items-center p-6 md:p-8">
          <SnapYogaLogo />
          <Button asChild variant="link" className="text-white hover:text-white/80">
            <Link href="/auth/signin">{t('signIn')}</Link>
          </Button>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-5xl font-medium leading-tight max-w-md">
            Master Your Pose. Instantly.
          </h1>
          <div className="mt-8">
            <button
              onClick={handleGetStarted}
              disabled={isProcessingClick}
              aria-label="Get started"
              className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
            >
              <RightArrowIcon animationState={arrowAnimationState} className="text-white h-16 w-16" />
            </button>
          </div>
        </main>
        
        {/* Footer with dots */}
        <footer className="p-6 md:p-8">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
          </div>
        </footer>

      </div>
    </div>
  );
}
