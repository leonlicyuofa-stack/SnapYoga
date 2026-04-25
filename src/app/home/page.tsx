
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
 * Sweeping B&W Circular Divider SVG
 * Replicates the anti-clockwise sweep that transforms into a button.
 */
const SweepingDivider = ({ phase }: { phase: LoadingPhase }) => {
    // We use a CSS-driven SVG path animation to handle the anti-clockwise circular sweep.
    // The "Black" segment starts at 70%, sweeps to 10%, then shrinks to a circle.
    return (
        <div className={cn(
            "fixed inset-0 w-full h-full z-[100] bg-white transition-opacity duration-1000",
            phase === 'content' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}>
            {/* The Black Segment */}
            <svg 
                viewBox="0 0 100 100" 
                className={cn(
                    "absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out",
                    phase === 'logo' ? "scale-[0.15] translate-y-[35%]" : "scale-100"
                )}
                preserveAspectRatio="xMidYMid slice"
            >
                <circle 
                    cx="50" 
                    cy="50" 
                    r="80" 
                    fill="black"
                    className={cn(
                        "transition-all duration-[3000ms] ease-in-out origin-center",
                        phase === 'splash' ? "[clip-path:polygon(50%_50%,_0_0,_100%_0,_100%_100%,_0_100%,_0_30%)]" : "[clip-path:circle(30%_at_50%_50%)]"
                    )}
                />
            </svg>

            {/* The Anti-Clockwise Sweep Overlay */}
            <div className={cn(
                "absolute inset-0 bg-black transition-all duration-[2500ms] ease-out",
                phase === 'splash' ? "clip-path-sweep-70" : "clip-path-sweep-10",
                phase === 'logo' && "opacity-0"
            )} style={{
                clipPath: phase === 'splash' 
                    ? 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 30%)' 
                    : 'polygon(50% 50%, 40% 100%, 60% 100%)'
            }} />
        </div>
    );
};

export default function HomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<LoadingPhase>('splash');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 1. Initial Sweep starts
    const sweepTimeout = setTimeout(() => {
      // Step 2 & 3: Border sweeps anti-clockwise
    }, 500);

    // 2. Transition to logo (shrink to button) starts after 3 seconds
    const logoTimeout = setTimeout(() => {
      setPhase('logo');
    }, 3000);

    // 3. Final Content reveal
    const contentTimeout = setTimeout(() => {
      setPhase('content');
    }, 4500);

    return () => {
      clearTimeout(sweepTimeout);
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
    <div className="relative min-h-screen font-serif text-white overflow-hidden bg-background">
      
      {/* ── SPLASH SCREEN SEQUENCE ── */}
      <SweepingDivider phase={phase} />

      {/* ── MAIN CONTENT ── */}
      <div className={cn(
          "absolute inset-0 w-full flex flex-col z-10 transition-all duration-1000",
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
                <div className="flex gap-2 mt-8 justify-center">
                  {animatedWords.map((word, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-500",
                        index === currentIndex ? 'opacity-100 scale-125' : 'bg-foreground/30 opacity-50'
                      )}
                      style={{ backgroundColor: index === currentIndex ? word.color : undefined }}
                    ></div>
                  ))}
                </div>
            </div>
        </main>
        
        {/* Footer with Action Button - This is where the black segment lands */}
        <footer className="relative flex flex-col items-center gap-6 pb-20 transition-all duration-1000 delay-700">
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
