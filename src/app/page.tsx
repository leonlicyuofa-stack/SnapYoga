"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Inter, Great_Vibes as GreatVibes } from 'next/font/google';
import { PebbleStackMascot } from '@/components/icons/PebbleStackMascot';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const greatVibes = GreatVibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
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
        greatVibes.variable
    )}>
      <div className="relative z-10 animate-snapshot-in">
        <div className="bg-white p-4 shadow-2xl rounded-lg">
          <div className="bg-white p-2 border-2 border-gray-200 rounded-sm animate-snapshot-content-appear">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-800 text-center mb-4">
              SnapYoga
            </h1>
            <PebbleStackMascot className="w-full max-w-xs h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
