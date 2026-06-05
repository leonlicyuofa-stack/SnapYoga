
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

  return (
    <div className="relative min-h-screen font-serif text-white overflow-hidden bg-[#0D1821] animate-in fade-in duration-1000">
      
      {/* ── BACKGROUND RIBBONS ── */}
      <Ribbon 
        id="top-ribbon"
        d="M 200,-100 Q 500,400 800,-100"
        text="LISTEN • GUIDE • ACTIVATE • LISTEN • GUIDE • ACTIVATE"
        delay="0s"
      />
      <Ribbon 
        id="bottom-ribbon"
        d="M -100,900 Q 200,600 500,850 T 1100,1050"
        text="LISTEN • GUIDE • ACTIVATE • LISTEN • GUIDE • ACTIVATE"
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
                <span className="text-[10px] md:text-xs tracking-[0.3em] opacity-40 uppercase font-light">2026</span>
            </div>
            <p className="mt-4 text-[10px] md:text-xs tracking-[0.5em] uppercase opacity-60 font-light animate-in fade-in slide-in-from-top-2 duration-1000 delay-300">
                Breathe Balance Become
            </p>

            {/* Pagination Dots moved under mantra */}
            <div className="flex gap-2 mt-12 justify-center animate-in fade-in duration-1000 delay-500">
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

        {/* ── BOTTOM SECTION: ARROW CTA ── */}
        <footer className="pb-20 w-full flex justify-end px-4 md:px-20">
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
