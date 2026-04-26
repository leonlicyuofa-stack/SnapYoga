
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
            "fixed inset-0 z-50 flex items-center justify-center bg-background px-6 transition-all duration-1000 ease-in-out",
            isExiting ? "scale-75 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}>
            <svg 
                viewBox="0 0 1000 400" 
                className="w-full max-w-[800px] h-auto text-[#F4743B]"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Namaste Pen Drawing</title>
                <path 
                    d="M100,250 
                       C120,100 160,100 180,220 
                       C190,280 230,280 240,220 
                       C250,160 210,140 210,200 
                       C210,260 250,260 270,220 
                       C280,180 320,180 330,220 
                       C340,260 370,260 380,220 
                       C390,180 420,180 430,220 
                       C440,260 470,260 480,220 
                       C490,160 450,140 450,200 
                       C450,260 490,260 510,220 
                       C530,160 580,160 560,240 
                       C540,300 620,240 640,220 
                       L640,100 
                       M600,160 H680 
                       M640,220 
                       C640,260 680,260 700,200"
                    stroke="currentColor" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="animate-line-draw"
                    style={{ strokeDasharray: 4000, strokeDashoffset: 4000 }}
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
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

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
    <div className="relative min-h-screen font-serif text-white overflow-hidden bg-background animate-in fade-in zoom-in-95 duration-1000">
      
      {/* ── MAIN CONTENT ── */}
      <div className="absolute inset-0 w-full flex flex-col z-10 px-6">
        
        {/* Top Header: Logo */}
        <header className="pt-20 flex justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
            <SnapYogaLogo />
        </header>

        {/* Footer: All content positioned right above the arrow */}
        <footer className="mt-auto pb-20 flex flex-col items-center text-center">
            
            {/* Animated Headline and Dots */}
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight flex flex-col items-center">
                    <span className="text-foreground/90">Master your</span>
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
                        index === currentIndex ? 'bg-[#F4743B] opacity-100 scale-125' : 'bg-foreground/20 opacity-30'
                      )}
                    ></div>
                  ))}
                </div>
            </div>

            {/* Action Button at the very bottom */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <Button
                    asChild
                    variant="ghost"
                    className="rounded-full h-16 w-16 p-0 bg-black hover:bg-black/90 text-white shadow-2xl transition-all hover:scale-110 border border-white/20"
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
