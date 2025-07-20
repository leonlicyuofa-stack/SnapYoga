"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { PebbleStackMascot } from '@/components/icons/PebbleStackMascot';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});


export default function MatrixLifeSplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 4500); // Increased delay to allow animation to finish

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={cn(
        "flex flex-col min-h-screen items-center justify-center p-8 bg-splash-background font-sans overflow-hidden",
        inter.variable,
    )}>
        {/* Paper Cut Effect Divs */}
        <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
            <div className="paper-cut-layer paper-cut-layer-1 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-500"></div>
            <div className="paper-cut-layer paper-cut-layer-2 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-400"></div>
            <div className="paper-cut-layer paper-cut-layer-3 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-300"></div>
        </div>

        <div className="relative z-10 animate-snapshot-in">
          <div className="bg-white p-4 pt-4 pb-16 md:p-8 md:pt-8 md:pb-20 shadow-2xl rounded-lg transform -rotate-3">
              <div className="animate-snapshot-content-appear">
                  <h1 className="text-5xl md:text-6xl font-bold text-splash-foreground font-serif leading-tight text-center">
                      SnapYoga
                  </h1>
                  <PebbleStackMascot className="w-40 h-40 mx-auto mt-4" />
              </div>
          </div>
        </div>
        
    </div>
  );
}
