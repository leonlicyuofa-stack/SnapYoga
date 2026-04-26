
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
            isExiting ? "scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}>
            <svg 
                viewBox="0 0 800 400" 
                className="w-full max-w-[500px] h-auto text-[#F4743B]"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Namaste Text Path - Single Line Drawing */}
                <path 
                    d="M150,250 C180,180 210,180 230,220 C250,260 220,300 200,280 C180,260 210,200 240,180 C270,160 300,280 320,280 C340,280 360,200 380,200 C400,200 420,280 440,280 C460,280 480,200 500,200 C520,200 540,280 560,280 C580,280 600,200 620,200 C640,200 650,250 640,280"
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="animate-line-draw"
                    style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
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
    // 1. Initial drawing phase (0 - 2.5s)
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
