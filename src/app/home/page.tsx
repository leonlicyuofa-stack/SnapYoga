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
 * High-end Metallic S Monogram SVG component
 * Focuses solely on the 'S' as requested.
 */
const MetallicMonogram = () => (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
        <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="25%" stopColor="#F5E0A3" />
                <stop offset="50%" stopColor="#B8860B" />
                <stop offset="75%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
            <filter id="rim-light">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="1" k3="-1" />
            </filter>
        </defs>
        {/* Letter 'S' - Flowing metallic curve */}
        <path 
            d="M100 45C100 31.7 86.6 22 70 22C53.4 22 40 31.7 40 45C40 58.3 53.4 62 70 68C86.6 74 100 77.7 100 91C100 104.3 86.6 114 70 114C53.4 114 40 104.3 40 91" 
            stroke="url(#gold-gradient)" 
            strokeWidth="12" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#rim-light)"
        />
    </svg>
);

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<LoadingPhase>('splash');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 1. Splash Screen 'S' zoom out for 2.5 seconds
    const splashTimeout = setTimeout(() => {
      setPhase('logo');
    }, 2500);

    // 2. Logo Reveal for 1.5 seconds
    const logoTimeout = setTimeout(() => {
      setPhase('content');
    }, 4000);

    return () => {
      clearTimeout(splashTimeout);
      logoTimeout && clearTimeout(logoTimeout);
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
      
      {/* ── PHASE 1: SPLASH SCREEN (S Zoom Out Landing) ── */}
      <div 
        className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1B] transition-opacity duration-1000",
            phase === 'splash' || phase === 'logo' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='800' viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 200 50 400 100 T 800 100' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 200 Q 200 150 400 200 T 800 200' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 300 Q 200 250 400 300 T 800 300' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 400 Q 200 350 400 400 T 800 400' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 500 Q 200 450 400 500 T 800 500' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 600 Q 200 550 400 600 T 800 600' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 700 Q 200 650 400 700 T 800 700' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover'
        }}
      >
        <div className="relative flex flex-col items-center">
            {/* The 'S' Monogram with Zoom Out Landing effect */}
            <div className={cn(
                "transition-all duration-1000 ease-out transform",
                phase === 'splash' ? 'scale-[3] opacity-0 blur-lg animate-in zoom-in-150' : 'scale-100 opacity-100 blur-0'
            )}>
                <div className="absolute inset-0 blur-[80px] bg-[#D4AF37] opacity-10 rounded-full scale-150" />
                <MetallicMonogram />
            </div>

            {/* Subtext reveal (Logo) beneath the S after it lands */}
            <div className={cn(
                "mt-8 transition-all duration-1000 delay-500 transform",
                phase === 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}>
                <SnapYogaLogo />
            </div>
        </div>
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
