"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { YogaPoseIllustration } from '@/components/icons/YogaPoseIllustration';

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
        "flex flex-col min-h-screen items-center justify-center p-8 bg-splash-blob-2 font-sans overflow-hidden",
        inter.variable,
    )}>
      <div className="relative z-10 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
        <h1 className="text-6xl md:text-7xl font-bold text-white text-center mb-8 drop-shadow-md">
            SnapYoga
        </h1>
        <YogaPoseIllustration className="w-full max-w-lg h-auto" />
      </div>
    </div>
  );
}
