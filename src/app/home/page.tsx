
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

// Sequence phases: 'splash' -> 'logo' -> 'content'
type LoadingPhase = 'splash' | 'logo' | 'content';

const animatedWords = [
    { text: 'Pose.', color: '#fb7185' },
    { text: 'Flow.', color: '#38bdf8' },
    { text: 'Balance.', color: '#facc15' },
    { text: 'Strength.', color: '#a78bfa' },
    { text: 'Mobility.', color: '#34d399' },
];

/**
 * Sweeping B&W Divider SVG
 * Replicates the curved motion from the user provided image.
 */
const SweepingDivider = ({ phase }: { phase: LoadingPhase }) => (
    <div className={cn(
        "absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out",
        phase === 'logo' || phase === 'content' ? 'translate-y-[80%] scale-y-0 opacity-0' : 'translate-y-0 scale-y-100 opacity-100'
    )}>
        {/* White Side */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Black Side with Sweep Path */}
        <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className={cn(
                "absolute inset-0 w-full h-full transition-all duration-[2000ms] ease-out origin-center",
                phase === 'splash' ? "scale-[2.5] -rotate-180" : "scale-100 rotate-0"
            )}
        >
            <path 
                d="M 100,0 L 0,0 L 0,100 L 100,100 C 60,75 60,25 100,0 Z" 
                fill="#000000"
            />
        </svg>
    </div>
);

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<LoadingPhase>('splash');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 1. Initial Sweep starts immediately
    const startTimeout = setTimeout(() => {
        // Trigger the landing state within the splash phase
    }, 100);

    // 2. Shrink to arrow starts after 2.5 seconds
    const logoTimeout = setTimeout(() => {
      setPhase('logo');
    }, 2500);

    // 3. Final Content reveal
    const contentTimeout = setTimeout(() => {
      setPhase('content');
    }, 3500);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(logoTimeout);
      clearTimeout(contentTimeout);
    };
  }, []);

  useEffect(() => {
    if (phase === 'content') {
        const intervalId = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % animatedWords.length);
        }, 3000);
        return () => clearInterval(intervalId);
    }
  }, [phase]);

  const prevIndex = (currentIndex - 1 + animatedWords.length) % animatedWords.length;

  return (
    <div className="relative min-h-screen font-serif text-white overflow-hidden bg-[#1A1A1B]">
      
      {/* ── PHASE 1: SPLASH SCREEN (B&W Anti-Clockwise Sweep) ── */}
      <div 
        className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-1000",
            phase === 'splash' || phase === 'logo' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <SweepingDivider phase={phase} />
      </div>

      {/* ── PHASE 3: CONTENT (Landing at /home) ── */}
      <div className={cn(
          "absolute inset-0 w-full flex flex-col bg-black/40 backdrop-blur-3xl z-10 transition-all duration-1000",
          phase === 'content' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      )}>
        
        {/* Main Content Panel */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-6 mt-12">
            
            {/* Logo positioned directly above headline */}
            <div className="mb-8">
                <SnapYogaLogo />
            </div>

            <div className="transition-all duration-1000 delay-300">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight flex flex-col items-center">
                    <span className="text-white/90">Master your</span>
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
            </div>
        </main>
        
        {/* Footer with Action Button */}
        <footer className="relative flex flex-col items-center gap-6 pb-20 transition-all duration-1000 delay-700">
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
