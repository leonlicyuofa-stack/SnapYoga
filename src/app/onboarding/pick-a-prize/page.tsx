"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';

const prizes = {
  left: {
    name: "A shiny new Croissant!",
    image: "https://i.imgur.com/h5cANfR.png",
    imageHint: "a croissant"
  },
  right: {
    name: "A warm cup of Coffee!",
    image: "https://images.unsplash.com/photo-1615485736894-a2d2e6d4cd9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNnx8Y29mZmVlJTIwY3VwfGVufDB8fHx8MTc2NTg5NDg0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "coffee cup"
  }
};

const RightPattern = () => (
    <svg width="100%" height="100%" className="absolute inset-0 z-0" preserveAspectRatio="none">
        <defs>
            <filter id="brush-stroke" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.01 0.005" numOctaves="2" result="turbulence"/>
                <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="10" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
        </defs>
        <rect width="100%" height="100%" fill="#F8F3F1"/>
        <rect y="5%" width="100%" height="20%" fill="#EFE7E4" filter="url(#brush-stroke)" />
        <rect y="35%" width="100%" height="20%" fill="#D3C3BE" filter="url(#brush-stroke)" />
        <rect y="65%" width="100%" height="20%" fill="#D4B6C1" filter="url(#brush-stroke)" />
    </svg>
)

const LeftPattern = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 600" className="absolute inset-0 z-0" preserveAspectRatio="none">
        <g stroke="#FFFFFF" strokeWidth="2">
            <rect width="400" height="600" fill="#fbc4b8" />
            <rect x="0" y="0" width="220" height="150" fill="#f8a090" />
            <rect x="0" y="150" width="220" height="180" fill="#f9e79f" />
            <rect x="0" y="330" width="150" height="160" fill="#a2d9ce" />
            <rect x="150" y="330" width="70" height="90" fill="#c8e6c9" />
            <rect x="0" y="490" width="400" height="110" fill="#a9cce3" />
            <rect x="0" y="490" width="140" height="110" fill="#a2d9ce" />
            <rect x="140" y="490" width="110" height="110" fill="#f5b7b1" />
            <rect x="250" y="490" width="150" height="110" fill="#d7bde2" />
        </g>
    </svg>
);


export default function PickAPrizePage() {
  const router = useRouter();
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);

  const handlePrizeSelection = (prizeName: string) => {
    // Navigate to the result page with the chosen prize
    router.push(`/onboarding/draw-result?prize=${encodeURIComponent(prizeName)}`);
  };

  const handleLeftClick = () => {
    setSelectedSide('left');
    setTimeout(() => handlePrizeSelection(prizes.left.name), 500);
  };
  
  const handleRightClick = () => {
    setSelectedSide('right');
    setTimeout(() => handlePrizeSelection(prizes.right.name), 500);
  };

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-screen">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm">
            <OnboardingHeader />
          </div>
          <div className="flex-grow grid grid-cols-2">
            {/* Left Side */}
            <div
              className={cn(
                "relative flex flex-col items-center justify-center p-8 transition-all duration-500 cursor-pointer group overflow-hidden"
              )}
              onClick={handleLeftClick}
            >
              <LeftPattern />
              <div className={cn("absolute inset-0 bg-blue-400 transition-all duration-500",
                selectedSide === 'left' ? 'opacity-50 scale-150' : 'opacity-0'
              )}></div>

              <div className="relative z-10 text-center text-white transition-transform duration-300 group-hover:scale-105">
                <h2 className="mt-4 text-2xl font-bold">{prizes.left.name.split(' ')[4]}</h2>
              </div>
            </div>

            {/* Right Side */}
            <div
              className={cn(
                "relative flex flex-col items-center justify-center p-8 transition-all duration-500 cursor-pointer group overflow-hidden"
              )}
              onClick={handleRightClick}
            >
              <RightPattern />
              <div className={cn("absolute inset-0 bg-pink-300 transition-all duration-500",
                selectedSide === 'right' ? 'opacity-80 scale-150' : 'opacity-0'
              )}></div>
                
              <div className="relative z-10 text-center text-pink-800 transition-transform duration-300 group-hover:scale-105">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 drop-shadow-2xl">
                    <Image src={prizes.right.image} alt={prizes.right.name} fill className="object-contain" data-ai-hint={prizes.right.imageHint}/>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{prizes.right.name.split(' ')[4]}</h2>
              </div>
            </div>

            {/* "This or That" text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <div className="w-1 h-32 bg-white/50 rotate-12"></div>
              <div className="absolute text-center text-white font-extrabold tracking-widest uppercase">
                  <span className="text-4xl text-shadow-lg">This</span>
                  <span className="block text-2xl my-1">or</span>
                  <span className="text-4xl text-shadow-lg">That</span>
              </div>
            </div>
          </div>
      </div>
    </AppShell>
  );
}
