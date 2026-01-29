"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Data for the animated headline
const animatedWords = [
    { text: 'Pose.', color: '#fb7185' }, // text-rose-400
    { text: 'Flow.', color: '#38bdf8' }, // text-sky-400
    { text: 'Balance.', color: '#facc15' }, // text-amber-400
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
        
        <header className="flex justify-between items-center p-6 md:p-8">
          <SnapYogaLogo />
          {/* Sign In button removed as requested */}
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-start justify-center text-left px-6 md:px-12">
            <h1 className="text-4xl md:text-5xl font-medium leading-tight">
                Master your
                <div className="relative inline-block h-[48px] md:h-[60px] w-[200px] ml-3 align-bottom" style={{ perspective: '400px' }}>
                    {/* Previous Word (animating out) */}
                    <span
                        key={prevIndex}
                        className="absolute inset-0 flex items-center justify-start [transform-style:preserve-3d] animate-flip-up-out"
                        style={{
                            transformOrigin: 'bottom center',
                            color: animatedWords[prevIndex].color,
                        }}
                    >
                        {animatedWords[prevIndex].text}
                    </span>
                    {/* Current Word (animating in) */}
                    <span
                        key={currentIndex}
                        className="absolute inset-0 flex items-center justify-start [transform-style:preserve-3d] animate-flip-up-in"
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

            <Button size="lg" className="mt-12 w-full max-w-xs text-lg py-7 bg-white/90 text-black hover:bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform" asChild>
                <Link href="/auth/signup">
                    Get Started
                    <ChevronRight className="ml-2 h-6 w-6" />
                </Link>
            </Button>
        </main>
        
        {/* Footer */}
        <footer className="p-6 md:p-8">
            <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
            </div>
        </footer>

      </div>
    </div>
  );
}
