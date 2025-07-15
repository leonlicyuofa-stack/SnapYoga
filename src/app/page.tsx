
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { WelcomeRock } from '@/components/icons/rocks/welcome-rock';
import { cn } from '@/lib/utils';

export default function LogoSplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 2500); // 2.5 second delay for the splash screen

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AppShell>
      <div className="flex flex-col min-h-[calc(100vh-15rem)] items-center justify-center animate-in fade-in duration-1000">
        <div className="flex flex-col items-center justify-center gap-4">
          <WelcomeRock className="h-24 w-24 text-primary animate-pebble-pulse" />
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            SnapYoga
          </h1>
        </div>
      </div>
    </AppShell>
  );
}
