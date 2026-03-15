"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
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

  // Memoize the background to prevent flickering during text animation re-renders
  const Background = useMemo(() => (
    <>
      <Image
        src="/images/background.png"
        alt="A tranquil, modern yoga space."
        fill
        className="object-cover"
        data-ai-hint="modern wellness room"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
    </>
  ), []);

  return (
    <div className="relative min-h-screen font-serif text-white bg-black overflow-hidden">
      {Background}

      {/* Main Content Panel */}
      <div className="absolute inset-y-0 left-0 w-full md:w-1/2 flex flex-col bg-black/20 backdrop-blur-lg z-10">
        
        <header className="flex justify-between items-center p-6 md:p-8">
          <SnapYogaLogo />
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-start justify-center text-left px-6 md:px-12">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Master your
                <div className="relative inline-block h-[48px] md:h-[60px] w-[240px] ml-2 align-bottom font-script" style={{ perspective: '400px' }}>
                    {/* Previous Word (animating out) */}
                    <span
                        key={`prev-${prevIndex}`}
                        className="font-script absolute inset-0 flex items-center justify-start [transform-style:preserve-3d] animate-flip-up-out"
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
                        className="font-script absolute inset-0 flex items-center justify-start [transform-style:preserve-3d] animate-flip-up-in"
                        style={{
                            transformOrigin: 'bottom center',
                            color: animatedWords[currentIndex].color,
                        }}
                    >
                        {animatedWords[currentIndex].text}
                    </span>
                </div>
            </h1>
          
            <div className="flex gap-2 mt-4">
              {animatedWords.map((word, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-500",
                    index === currentIndex ? 'opacity-100' : 'bg-white/50 opacity-50'
                  )}
                  style={{ backgroundColor: index === currentIndex ? word.color : undefined }}
                ></div>
              ))}
            </div>
        </main>
        
        {/* Footer */}
        <footer className="relative p-6 md:p-8">
            <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
            </div>
            <Button
                asChild
                variant="ghost"
                className="absolute bottom-6 right-6 md:bottom-8 md:right-8 rounded-full h-14 w-14 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20"
            >
                <Link href="/auth/signup" aria-label="Get Started">
                    <ArrowRight className="h-7 w-7" />
                </Link>
            </Button>
        </footer>

      </div>
    </div>
  );
}
