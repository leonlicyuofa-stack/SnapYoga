
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

function Ribbon({ id, d, text, delay = "0s" }: { id: string; d: string; text: string; delay?: string }) {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <svg 
                viewBox="0 0 1000 1000" 
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path 
                    id={id}
                    d={d}
                    stroke="white" 
                    strokeWidth="80" 
                    strokeLinecap="round" 
                    className="opacity-5 animate-line-draw"
                    style={{ strokeDasharray: 3000, strokeDashoffset: 3000, animationDelay: delay }}
                />
                <text 
                    className="fill-white/20 font-serif text-[28px] uppercase tracking-[12px] animate-in fade-in duration-1000"
                    style={{ animationDelay: `calc(${delay} + 1s)` }}
                >
                    <textPath href={`#${id}`} startOffset="0%">
                        {text}
                    </textPath>
                </text>
            </svg>
        </div>
    );
}

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
    <div className="relative min-h-screen font-serif text-white overflow-hidden bg-[#0D1821] animate-in fade-in duration-1000">
      
      {/* ── BACKGROUND RIBBONS ── */}
      <Ribbon 
        id="top-ribbon"
        d="M 200,-100 Q 500,400 800,-100"
        text="BREATHE • BALANCE • BECOME • BREATHE • BALANCE • BECOME"
        delay="0s"
      />
      <Ribbon 
        id="bottom-ribbon"
        d="M -100,900 Q 200,600 500,850 T 1100,1050"
        text="BREATHE • BALANCE • BECOME • BREATHE • BALANCE • BECOME"
        delay="0.5s"
      />

      {/* ── NOISE TEXTURE ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative w-full min-h-screen flex flex-col items-center z-10 px-6">
        
        {/* ── CENTER SECTION: LOGO & ESTD ── */}
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center gap-6 md:gap-12 animate-in fade-in zoom-in-95 duration-1000">
                <span className="text-[10px] md:text-xs tracking-[0.3em] opacity-40 uppercase font-light">ESTD</span>
                <SnapYogaLogo />
                <span className="text-[10px] md:text-xs tracking-[0.3em] opacity-40 uppercase font-light">2024</span>
            </div>
            <p className="mt-4 text-[10px] md:text-xs tracking-[0.5em] uppercase opacity-60 font-light animate-in fade-in slide-in-from-top-2 duration-1000 delay-300">
                Breathe Balance Become
            </p>
        </div>

        {/* ── BOTTOM SECTION: HEADLINE & CTA ── */}
        <footer className="pb-20 flex flex-col items-center text-center">
            
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight flex flex-col items-center">
                    <span className="text-white/80 font-light">Master your</span>
                    <div className="relative h-[60px] md:h-[70px] w-full max-w-[280px] mt-2 font-script" style={{ perspective: '400px' }}>
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
              
                <div className="flex gap-2 mt-8 justify-center">
                  {animatedWords.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                        index === currentIndex ? 'bg-[#F4743B] scale-125' : 'bg-white/20'
                      )}
                    ></div>
                  ))}
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                <Button
                    asChild
                    variant="ghost"
                    className="rounded-full h-16 w-16 p-0 bg-white/5 hover:bg-white/10 text-white shadow-2xl transition-all hover:scale-110 border border-white/10"
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
