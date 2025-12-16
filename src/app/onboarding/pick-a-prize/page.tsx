"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';
import { YogaMatMascot } from '@/components/icons/YogaMatMascot';

const LeftPattern = () => (
    <svg width="100%" height="100%" className="absolute inset-0 z-0" preserveAspectRatio="none">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#fce3e1', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#fadbcc', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="#fdf6f2"/>

        <rect x="0%" y="0" width="10%" height="100%" fill="#fce3e1" />
        <rect x="10%" y="0" width="8%" height="100%" fill="#f7d9d5" />

        <rect x="18%" y="0" width="15%" height="40%" fill="#e6e6e6" />
        <rect x="18%" y="40%" width="15%" height="60%" fill="#f2dacc" />

        <rect x="33%" y="0" width="12%" height="100%" fill="#fce3e1" />

        <rect x="45%" y="0" width="5%" height="100%" fill="#ffffff" />
        <rect x="50%" y="0" width="2%" height="100%" fill="#f7d9d5" />
        <rect x="52%" y="0" width="3%" height="100%" fill="#ffffff" />

        <rect x="55%" y="0" width="18%" height="65%" fill="#d4dde6" />
        <rect x="55%" y="65%" width="18%" height="35%" fill="#ede4d6" />
        
        <rect x="73%" y="0" width="15%" height="100%" fill="#fcd9c9" />
        <rect x="88%" y="0" width="4%" height="100%" fill="#f7d9d5" />
        <rect x="92%" y="0" width="8%" height="100%" fill="#fde5e3" />
    </svg>
)

const RightPattern = () => (
    <svg width="100%" height="100%" className="absolute inset-0 z-0" preserveAspectRatio="none">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#fce3e1', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#fadbcc', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="#fdf6f2"/>

        <rect x="0%" y="0" width="10%" height="100%" fill="#fce3e1" />
        <rect x="10%" y="0" width="8%" height="100%" fill="#f7d9d5" />

        <rect x="18%" y="0" width="15%" height="40%" fill="#e6e6e6" />
        <rect x="18%" y="40%" width="15%" height="60%" fill="#f2dacc" />

        <rect x="33%" y="0" width="12%" height="100%" fill="#fce3e1" />

        <rect x="45%" y="0" width="5%" height="100%" fill="#ffffff" />
        <rect x="50%" y="0" width="2%" height="100%" fill="#f7d9d5" />
        <rect x="52%" y="0" width="3%" height="100%" fill="#ffffff" />

        <rect x="55%" y="0" width="18%" height="65%" fill="#d4dde6" />
        <rect x="55%" y="65%" width="18%" height="35%" fill="#ede4d6" />
        
        <rect x="73%" y="0" width="15%" height="100%" fill="#fcd9c9" />
        <rect x="88%" y="0" width="4%" height="100%" fill="#f7d9d5" />
        <rect x="92%" y="0" width="8%" height="100%" fill="#fde5e3" />
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
    setTimeout(() => handlePrizeSelection("A shiny new Croissant!"), 500);
  };
  
  const handleRightClick = () => {
    setSelectedSide('right');
    setTimeout(() => handlePrizeSelection("A warm cup of Coffee!"), 500);
  };

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-screen">
          <QuadrantBackground />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm">
            <OnboardingHeader />
          </div>
          <div className="flex-grow grid grid-cols-2 relative z-10">
            {/* Left Side */}
            <div
              className={cn(
                "relative flex flex-col items-center justify-center p-8 transition-all duration-500 cursor-pointer group"
              )}
              onClick={handleLeftClick}
            >
              <div className={cn("absolute inset-0 bg-blue-400 transition-all duration-500",
                selectedSide === 'left' ? 'opacity-50 scale-150' : 'opacity-0'
              )}></div>

              <div className="relative z-10 text-center text-white transition-transform duration-300 group-hover:scale-105">
                <YogaMatMascot className="h-48 w-48 text-primary" />
              </div>
            </div>

            {/* Right Side */}
            <div
              className={cn(
                "relative flex flex-col items-center justify-center p-8 transition-all duration-500 cursor-pointer group"
              )}
              onClick={handleRightClick}
            >
              <div className={cn("absolute inset-0 bg-pink-300 transition-all duration-500",
                selectedSide === 'right' ? 'opacity-80 scale-150' : 'opacity-0'
              )}></div>
                
              <div className="relative z-10 text-center text-white transition-transform duration-300 group-hover:scale-105">
                 <YogaMatMascot className="h-48 w-48 text-primary" />
              </div>
            </div>

            {/* "This or That" text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <div className="w-1 h-32 bg-white/50 rotate-12"></div>
              <div className="absolute text-center text-white font-extrabold tracking-widest uppercase">
                  
                  <span className="block text-2xl my-1">or</span>
                  
              </div>
            </div>
          </div>
      </div>
    </AppShell>
  );
}
