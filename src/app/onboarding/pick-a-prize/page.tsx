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
    image: "/images/croissant.png",
    imageHint: "a croissant"
  },
  right: {
    name: "Some delicious Toast!",
    image: "/images/toast.png",
    imageHint: "toast with butter"
  }
};

const Pattern = () => (
    <svg width="100%" height="100%" className="absolute inset-0 z-0">
        <defs>
            <pattern id="pastel-squares" patternUnits="userSpaceOnUse" width="100" height="100">
                <rect width="100" height="100" fill="hsl(340, 50%, 96%)"/>
                <rect x="0" y="0" width="50" height="50" fill="hsl(240, 60%, 95%)" fillOpacity="0.5"/>
                <rect x="50" y="0" width="50" height="50" fill="hsl(40, 60%, 95%)" fillOpacity="0.5"/>
                <rect x="0" y="50" width="50" height="50" fill="hsl(120, 60%, 95%)" fillOpacity="0.5"/>
                <rect x="50" y="50" width="50" height="50" fill="hsl(0, 60%, 95%)" fillOpacity="0.5"/>
                <rect x="25" y="25" width="50" height="50" fill="hsl(200, 60%, 95%)" fillOpacity="0.4"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pastel-squares)" />
    </svg>
)

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
                "relative flex flex-col items-center justify-center p-8 transition-all duration-500 cursor-pointer group",
                selectedSide === 'left' ? 'bg-purple-300' : 'bg-purple-200 hover:bg-purple-300/80'
              )}
              onClick={handleLeftClick}
            >
              <div className={cn("absolute inset-0 bg-purple-300 transition-all duration-500",
                selectedSide === 'left' ? 'opacity-100 scale-150' : 'opacity-0'
              )}></div>

              <div className="relative z-10 text-center text-purple-800 transition-transform duration-300 group-hover:scale-105">
                 <div className="relative w-48 h-48 sm:w-64 sm:h-64 drop-shadow-2xl">
                    <Image src={prizes.left.image} alt={prizes.left.name} fill className="object-contain" data-ai-hint={prizes.left.imageHint} />
                 </div>
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
              <Pattern />
              <div className={cn("absolute inset-0 bg-pink-300 transition-all duration-500",
                selectedSide === 'right' ? 'opacity-80 scale-150' : 'opacity-0'
              )}></div>
                
              <div className="relative z-10 text-center text-pink-800 transition-transform duration-300 group-hover:scale-105">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 drop-shadow-2xl">
                    <Image src={prizes.right.image} alt={prizes.right.name} fill className="object-contain" data-ai-hint={prizes.right.imageHint}/>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{prizes.right.name.split(' ')[3]}</h2>
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
