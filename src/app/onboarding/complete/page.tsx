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
      className="relative min-h-screen font-serif text-white bg-black flex flex-col items-center justify-center p-4 cursor-pointer"
      onClick={handleContinue}
    >
      {/* Background Image */}
      <Image
        src="/images/background.png"
        alt="A tranquil, modern yoga space."
        fill
        className="object-cover"
        data-ai-hint="modern wellness room"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40" /> {/* Overlay for contrast */}

      <div className="relative z-10 w-full max-w-md animate-in fade-in duration-1000">
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 text-center">
            <header className="mb-8">
                <div className="mx-auto mb-4 inline-block">
                    <SnapYogaLogo />
                </div>
              <h1 className="text-4xl font-bold">Your journey begins now.</h1>
            </header>
            
            <div className="mt-16 flex flex-col items-center gap-4">
                <div className="relative">
                    <ArrowUp className="h-12 w-12 text-white/80 animate-bounce" />
                </div>
                <p className="text-lg font-medium">Tap or swipe up to enter</p>
            </div>
        </div>
      </div>
    </div>
  );
}
