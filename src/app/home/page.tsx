
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const dotCount = 5;

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
      setCurrentIndex(prevIndex => (prevIndex + 1) % dotCount);
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
        
        {/* ── CENTER SECTION ── */}
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000">
                <SnapYogaLogo />
            </div>
            <p className="mt-4 text-[10px] md:text-xs tracking-[0.5em] uppercase opacity-60 font-light animate-in fade-in slide-in-from-top-2 duration-1000 delay-300 text-center">
                Listen Guide Activate
            </p>

            {/* Pagination Dots as CTA Button */}
            <Link href="/auth/signup" className="group mt-12 focus:outline-none flex flex-col items-center">
                <div className="flex gap-2 justify-center animate-in fade-in duration-1000 delay-500 group-hover:scale-125 transition-all cursor-pointer">
                    {Array.from({ length: dotCount }).map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                index === currentIndex ? 'bg-[#F4743B] scale-125' : 'bg-white/20'
                            )}
                        ></div>
                    ))}
                </div>
                <p className="mt-4 text-[8px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-60 transition-opacity text-center font-light">
                    Start Your Flow
                </p>
            </Link>
        </div>

      </div>
    </div>
  );
}
