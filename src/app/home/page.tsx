
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const animatedWords = [
    { text: 'Pose.', color: '#fb7185' },
    { text: 'Flow.', color: '#38bdf8' },
    { text: 'Balance.', color: '#facc15' },
    { text: 'Strength.', color: '#a78bfa' },
    { text: 'Mobility.', color: '#34d399' },
];

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const prevIndex = (currentIndex - 1 + animatedWords.length) % animatedWords.length;

  return (
    <div className="relative min-h-screen font-serif text-white overflow-hidden bg-background">
      
      {/* ── MAIN CONTENT ── */}
      <div className="absolute inset-0 w-full flex flex-col z-10 px-6">
        
        {/* Main Content Panel */}
        <main className="flex-grow flex flex-col items-center justify-center text-center">
            
            {/* Logo centered above headline */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <SnapYogaLogo />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight flex flex-col items-center">
                    <span className="text-foreground/90">Master your</span>
                    <div className="relative h-[60px] md:h-[80px] w-full max-w-[300px] mt-2 font-script" style={{ perspective: '400px' }}>
                        {/* Previous Word */}
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
                        {/* Current Word */}
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
                <div className="flex gap-2 mt-12 justify-center">
                  {animatedWords.map((word, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-500",
                        index === currentIndex ? 'opacity-100 scale-125' : 'bg-foreground/20 opacity-30'
                      )}
                      style={{ backgroundColor: index === currentIndex ? word.color : undefined }}
                    ></div>
                  ))}
                </div>
            </div>
        </main>
        
        {/* Footer with Action Button */}
        <footer className="relative flex flex-col items-center pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button
                asChild
                variant="ghost"
                className="rounded-full h-16 w-16 p-0 bg-black hover:bg-black/90 text-white shadow-2xl transition-all hover:scale-110 border border-white/20"
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
