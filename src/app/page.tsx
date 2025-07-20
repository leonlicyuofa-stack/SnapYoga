"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { Sun, Smile } from 'lucide-react';
import { PebbleStackLoader } from '@/components/icons/pebble-stack-loader';

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

        <div className="relative z-10 flex flex-col items-center justify-center flex-grow animate-in fade-in zoom-in-95 duration-1000 delay-700">
            <h1 className="text-4xl font-bold text-splash-foreground font-serif leading-tight">
                SnapYoga
            </h1>
        </div>
        
    </div>
  );
}
