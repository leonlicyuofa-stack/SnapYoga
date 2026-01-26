"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function PickAPrizePage() {
  const router = useRouter();
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const handlePrizeSelection = (prizeName: string, side: 'left' | 'right') => {
    if (isRevealing) return;
    setIsRevealing(true);
    setSelectedSide(side);
    
    // Wait for animation before navigating
    setTimeout(() => {
      router.push(`/onboarding/draw-result?prize=${encodeURIComponent(prizeName)}`);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen font-serif text-white bg-home-dark-bg">
        <Image
            src="https://picsum.photos/seed/yogawellness/1920/1080"
            alt="A tranquil, modern space for practicing yoga."
            fill
            className="object-cover"
            data-ai-hint="modern wellness room"
            priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-lg text-center">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Pick a Prize!</h1>
                    <p className="text-lg text-white/80">A special reward just for you.</p>
                </header>

                <main className="grid grid-cols-2 gap-4 md:gap-8">
                    {/* Left Prize */}
                    <div 
                        className="relative aspect-square cursor-pointer group"
                        onClick={() => handlePrizeSelection("3-month free trial", 'left')}
                    >
                        <div className={cn(
                            "absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl transition-all duration-500 flex items-center justify-center",
                            selectedSide === 'left' ? 'scale-105 shadow-2xl' : 'group-hover:scale-105'
                        )}>
                            <span className="text-4xl font-bold">This</span>
                        </div>
                    </div>

                    {/* Right Prize */}
                    <div 
                        className="relative aspect-square cursor-pointer group"
                        onClick={() => handlePrizeSelection("A warm cup of Coffee!", 'right')}
                    >
                        <div className={cn(
                            "absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl transition-all duration-500 flex items-center justify-center",
                             selectedSide === 'right' ? 'scale-105 shadow-2xl' : 'group-hover:scale-105'
                        )}>
                             <span className="text-4xl font-bold">That</span>
                        </div>
                    </div>
                </main>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <div className={cn("relative text-center text-white font-extrabold tracking-widest uppercase transition-opacity duration-300", selectedSide ? 'opacity-0' : 'opacity-100')}>
                        <span className="relative block text-2xl my-1">or</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
