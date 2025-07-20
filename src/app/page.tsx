
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Inter, Playfair_Display as PlayfairDisplay } from 'next/font/google';
import { Sun, Smile } from 'lucide-react';
import { PebbleStackLoader } from '@/components/icons/pebble-stack-loader';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = PlayfairDisplay({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-playfair',
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
        "flex flex-col min-h-screen items-center justify-between p-8 bg-splash-background font-sans overflow-hidden",
        inter.variable,
        playfair.variable
    )}>
        {/* Paper Cut Effect Divs */}
        <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
            <div className="paper-cut-layer paper-cut-layer-1 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-500"></div>
            <div className="paper-cut-layer paper-cut-layer-2 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-400"></div>
            <div className="paper-cut-layer paper-cut-layer-3 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-300"></div>
            <div className="paper-cut-layer paper-cut-layer-4 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-200"></div>
            <div className="paper-cut-layer paper-cut-layer-5 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-100"></div>
            <div className="paper-cut-layer paper-cut-layer-6 animate-in fade-in-0 slide-in-from-bottom-20 duration-1000 delay-0"></div>
        </div>

        <div className="relative z-10 w-full flex justify-between items-center animate-in fade-in slide-in-from-top-5 duration-1000 delay-500">
            <div className="flex items-center gap-2">
                <Smile className="h-6 w-6 text-splash-foreground/80" />
                <p className="text-2xl text-splash-foreground/80 font-serif italic">Welcome!</p>
            </div>
            <Sun className="h-8 w-8 text-yellow-400 animate-pulse-gentle" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-grow animate-in fade-in zoom-in-95 duration-1000 delay-700">
            <h1 className="text-7xl font-bold text-splash-foreground font-serif leading-tight">
                SnapYoga
            </h1>
        </div>
        
        <div className="relative z-10 w-full h-24 flex justify-center items-center">
            <PebbleStackLoader />
        </div>
    </div>
  );
}
