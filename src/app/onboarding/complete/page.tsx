"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

export default function OnboardingCompletePage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div 
      className="relative min-h-screen font-serif text-white bg-home-dark-bg flex flex-col items-center justify-center p-4 cursor-pointer"
      onClick={handleContinue}
    >
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

      <div className="relative z-10 text-center animate-in fade-in duration-1000">
        <header className="mb-8">
            <div className="mx-auto mb-4 inline-block">
                <SnapYogaLogo />
            </div>
          <h1 className="text-4xl font-bold">Welcome to SnapYoga</h1>
          <p className="text-lg text-white/80">Your journey begins now.</p>
        </header>
        
        <div className="mt-16 flex flex-col items-center gap-4">
            <div className="relative">
                <ArrowUp className="h-12 w-12 text-white/80 animate-bounce" />
            </div>
            <p className="text-lg font-medium">Tap or swipe up to enter</p>
        </div>
      </div>
    </div>
  );
}
