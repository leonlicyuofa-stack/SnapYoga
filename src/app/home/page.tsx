"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

// Data for the animated headline
const animatedWords = [
    { text: 'Pose.', color: '#fb7185' }, // text-rose-400
    { text: 'Flow.', color: '#38bdf8' }, // text-sky-400
    { text: 'Balance.', color: '#facc15' }, // text-amber-400
    { text: 'Strength.', color: '#a78bfa' }, // text-violet-400
    { text: 'Mobility.', color: '#34d399' }, // text-emerald-400
];

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % animatedWords.length);
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  const prevIndex = (currentIndex - 1 + animatedWords.length) % animatedWords.length;

  return (
    <div className="relative min-h-screen font-serif text-white overflow-hidden">
      {/* Main Content Panel - Centered and full width */}
      <div className="absolute inset-0 w-full flex flex-col bg-black/20 backdrop-blur-lg z-10">
        
        {/* Centered Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-6 mt-12">
            {/* Logo positioned directly above headline */}
            <div className="mb-8 animate-in fade-in zoom-in duration-1000">
                <SnapYogaLogo />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight flex flex-col items-center">
                <span>Master your</span>
                <div className="relative h-[60px] md:h-[80px] w-full max-w-[300px] mt-2 font-script" style={{ perspective: '400px' }}>
                    {/* Previous Word (animating out) */}
                    <span
                        key={`prev-${prevIndex}`}
                        className="font-script absolute inset-0 flex items-center justify-center [transform-style:preserve-3d] animate-flip-up-out"
                        style={{
                            transformOrigin: 'bottom center',
                            color: animatedWords[prevIndex].color,
                        }}
                    >
                        {animatedWords[prevIndex].text}
                    </span>
                    {/* Current Word (animating in) */}
                    <span
                        key={`curr-${currentIndex}`}
                        className="font-script absolute inset-0 flex items-center justify-center [transform-style:preserve-3d] animate-flip-up-in"
                        style={{
                            transformOrigin: 'bottom center',
                            color: animatedWords[currentIndex].color,
                        }}
                    >
                        {animatedWords[currentIndex].text}
                    </span>
                </div>
            </h1>
          
            {/* Pagination Dots */}
            <div className="flex gap-2 mt-8 justify-center">
              {animatedWords.map((word, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-500",
                    index === currentIndex ? 'opacity-100 scale-125' : 'bg-white/30 opacity-50'
                  )}
                  style={{ backgroundColor: index === currentIndex ? word.color : undefined }}
                ></div>
              ))}
            </div>
        </main>
        
        {/* Footer with Action Button */}
        <footer className="relative flex flex-col items-center gap-6 pb-12">
            <Button
                asChild
                variant="ghost"
                className="rounded-full h-16 w-16 p-0 bg-white/10 hover:bg-white/20 text-white shadow-2xl transition-all hover:scale-110 backdrop-blur-md border border-white/20"
            >
                <Link href="/auth/signup" aria-label="Get Started">
                    <ArrowRight className="h-8 w-8" />
                </Link>
            </Button>
        </footer>

      </div>
    </div>
  );
}
