
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
                className="w-full max-w-[700px] h-auto text-[#F4743B]"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Namaste Pen Drawing</title>
                {/* 
                  Elegant Cursive Namaste - Hand-crafted single stroke path
                  N: Starts low, goes high, loops back down.
                  a: connects to m
                  m: three elegant loops
                  a: connects to s
                  s: loops up to t
                  t: stem
                  e: final flourish
                */}
                <path 
                    d="M100,260 
                       C120,100 180,80 200,200 
                       C210,260 180,300 160,280 
                       C130,240 180,120 240,140 
                       C280,150 280,240 310,240 
                       C340,240 340,140 370,140 
                       C400,140 400,240 430,240 
                       C460,240 460,140 490,140 
                       C530,140 520,240 560,240 
                       C600,240 590,140 620,140 
                       C660,140 650,240 690,240 
                       C740,240 760,180 730,140 
                       C710,120 680,160 690,200 
                       C700,240 780,240 820,180 
                       C840,150 820,100 820,60 
                       L820,280 
                       M780,120 H860 
                       M860,220 
                       C860,280 940,280 960,200"
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="animate-line-draw"
                    style={{ strokeDasharray: 3000, strokeDashoffset: 3000 }}
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
    // 1. Drawing phase (0 - 2.5s)
    // 2. Zoom-out fade phase (2.5s - 3.5s)
    // 3. Reveal home (3.5s+)
    
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
                        index === currentIndex ? 'bg-[#F4743B] opacity-100 scale-125' : 'bg-foreground/20 opacity-30'
                      )}
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
