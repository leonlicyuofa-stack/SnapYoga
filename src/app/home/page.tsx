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
 * High-end Metallic Monogram SVG component
 */
const MetallicMonogram = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
        <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="25%" stopColor="#F5E0A3" />
                <stop offset="50%" stopColor="#B8860B" />
                <stop offset="75%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
            <filter id="rim-light">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="1" k3="-1" />
            </filter>
        </defs>
        {/* Abstract Monogram Shape: A stylized 'S' + 'Y' intersection */}
        <path 
            d="M60 20C37.9086 20 20 37.9086 20 60C20 82.0914 37.9086 100 60 100C82.0914 100 100 82.0914 100 60C100 37.9086 82.0914 20 60 20ZM60 90C43.4315 90 30 76.5685 30 60C30 43.4315 43.4315 30 60 30C76.5685 30 90 43.4315 90 60C90 76.5685 76.5685 90 60 90Z" 
            fill="url(#gold-gradient)" 
            className="animate-pulse"
        />
        <path 
            d="M50 45C50 45 40 50 40 60C40 70 50 75 60 75C70 75 80 70 80 60C80 50 70 45 60 45L60 35C80 35 95 50 95 65C95 80 80 95 60 95C40 95 25 80 25 65C25 50 40 35 50 35L50 45Z" 
            fill="url(#gold-gradient)"
            filter="url(#rim-light)"
        />
        <rect x="55" y="40" width="10" height="40" rx="5" fill="url(#gold-gradient)" transform="rotate(-15 60 60)" />
    </svg>
);

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<LoadingPhase>('splash');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 1. Splash Screen for 2.5 seconds
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
      
      {/* ── PHASE 1: SPLASH SCREEN ── */}
      <div 
        className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1B] transition-opacity duration-1000",
            phase === 'splash' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='800' viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 200 50 400 100 T 800 100' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 200 Q 200 150 400 200 T 800 200' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 300 Q 200 250 400 300 T 800 300' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 400 Q 200 350 400 400 T 800 400' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 500 Q 200 450 400 500 T 800 500' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 600 Q 200 550 400 600 T 800 600' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3Cpath d='M0 700 Q 200 650 400 700 T 800 700' stroke='%23ffffff' stroke-width='0.5' fill='none' opacity='0.03'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover'
        }}
      >
        <div className="relative animate-in fade-in zoom-in duration-1000">
            <div className="absolute inset-0 blur-[60px] bg-[#D4AF37] opacity-20 rounded-full scale-150" />
            <MetallicMonogram />
        </div>
      </div>

      {/* ── PHASE 2 & 3: CONTENT ── */}
      <div className={cn(
          "absolute inset-0 w-full flex flex-col bg-black/40 backdrop-blur-3xl z-10 transition-all duration-1000",
          phase === 'splash' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      )}>
        
        {/* Main Content Panel */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-6 mt-12">
            
            {/* Logo positioned directly above headline */}
            <div className={cn(
                "mb-8 transition-all duration-1000 transform",
                phase === 'logo' ? 'opacity-100 translate-y-0 scale-110' : phase === 'content' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10'
            )}>
                <SnapYogaLogo />
            </div>

            <div className={cn(
                "transition-all duration-1000 delay-300",
                phase === 'content' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}>
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
        <footer className={cn(
            "relative flex flex-col items-center gap-6 pb-20 transition-all duration-1000 delay-700",
            phase === 'content' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        )}>
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
