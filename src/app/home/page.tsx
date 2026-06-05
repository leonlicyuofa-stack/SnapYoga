
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const animatedWords = [
    { text: 'Pose.', color: '#F4743B' },
    { text: 'Flow.', color: '#F4743B' },
    { text: 'Balance.', color: '#F4743B' },
    { text: 'Strength.', color: '#F4743B' },
    { text: 'Mobility.', color: '#F4743B' },
];

function NamasteSplash({ isExiting }: { isExiting: boolean }) {
    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-[#0D1821] px-6 transition-all duration-1000 ease-in-out",
            isExiting ? "scale-75 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}>
            <svg 
                viewBox="0 0 1000 400" 
                className="w-full max-w-[800px] h-auto text-[#F4743B]"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Namaste Cursive Pen Drawing</title>
                {/* Refined single-line cursive path for "namaste" */}
                {/* This path traces: n -> a -> m -> a -> s -> t -> e in one continuous stroke */}
                <path 
                    d="M100,250 
                       C110,180 140,180 150,250 
                       C160,180 190,180 200,250 
                       C210,250 220,250 230,220 
                       C220,180 180,180 180,220 
                       C180,260 220,260 240,250 
                       C250,180 280,180 290,250 
                       C300,180 330,180 340,250 
                       C350,180 380,180 390,250 
                       C400,250 410,250 420,220 
                       C410,180 370,180 370,220 
                       C370,260 410,260 430,250 
                       C440,250 450,230 460,200 
                       C470,180 440,180 430,220 
                       C420,260 460,260 480,250 
                       C490,200 500,100 510,100 
                       C520,100 500,200 490,250 
                       C480,250 450,160 550,160 
                       C520,160 500,250 510,250 
                       C520,250 540,230 550,210 
                       C540,180 500,180 500,220 
                       C500,260 540,260 580,250"
                    stroke="currentColor" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="animate-line-draw"
                    style={{ strokeDasharray: 5000, strokeDashoffset: 5000 }}
                />
            </svg>
        </div>
    );
}

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Stage 1: Trigger the "Zoom Out" transition
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3200);

    // Stage 2: Completely unmount the splash screen
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 4200);

    // Word carousel interval
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % animatedWords.length);
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
      clearInterval(intervalId);
    };
  }, []);

  const prevIndex = (currentIndex - 1 + animatedWords.length) % animatedWords.length;

  if (showSplash) {
    return <NamasteSplash isExiting={isExiting} />;
  }

  return (
    <div className="relative min-h-screen font-serif text-white overflow-hidden bg-[#0D1821] animate-in fade-in zoom-in-95 duration-1000">
      
      {/* ── MAIN CONTENT ── */}
      <div className="absolute inset-0 w-full flex flex-col z-10 px-6">
        
        {/* Top Header: Logo */}
        <header className="pt-20 flex justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
            <SnapYogaLogo />
        </header>

        {/* Bottom Section: Headline, Dots, and CTA */}
        <footer className="mt-auto pb-20 flex flex-col items-center text-center">
            
            {/* Animated Headline and Dots */}
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight flex flex-col items-center">
                    <span className="text-white/90">Master your</span>
                    <div className="relative h-[60px] md:h-[70px] w-full max-w-[280px] mt-2 font-script" style={{ perspective: '400px' }}>
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
                        "w-2 h-2 rounded-full transition-all duration-500",
                        index === currentIndex ? 'bg-[#F4743B] opacity-100 scale-125' : 'bg-white/20 opacity-30'
                      )}
                    ></div>
                  ))}
                </div>
            </div>

            {/* Action Button */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <Button
                    asChild
                    variant="ghost"
                    className="rounded-full h-16 w-16 p-0 bg-white/10 hover:bg-white/20 text-white shadow-2xl transition-all hover:scale-110 border border-white/20"
                >
                    <Link href="/auth/signup" aria-label="Get Started">
                        <ArrowRight className="h-8 w-8" />
                    </Link>
                </Button>
            </div>
        </footer>

      </div>
    </div>
  );
}
