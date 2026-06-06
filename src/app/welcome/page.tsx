"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen font-serif text-white" style={{ background: 'linear-gradient(175deg, #B0B5C0 0%, #9DA4B0 35%, #A8A0BC 70%, #9B96B5 100%)' }}>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md backdrop-blur-lg rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.72)', border: '0.5px solid rgba(255,255,255,0.6)' }}>
            <header className="flex flex-col items-center justify-center">
              <SnapYogaLogo />
              <p className="mt-4 text-lg text-white/80">your AI companion for mindfulness</p>
            </header>

            <main className="my-12">
              <h1 className="text-4xl font-medium leading-tight">
                Find Your Flow, Anytime.
              </h1>
              <p className="mt-4 text-white/80">
                Personalized yoga feedback, progress tracking, and mindful practice.
              </p>
            </main>

            <footer className="flex flex-col items-center gap-4">
              <Button 
                  size="lg" 
                  className="w-full h-14 text-lg rounded-full font-bold bg-white/90 text-black hover:bg-white shadow-lg transform hover:scale-105 transition-transform"
                  asChild
              >
                  <Link href="/auth/signup">
                  Create an account
                  <ChevronRight className="ml-2 h-6 w-6" />
                  </Link>
              </Button>
              <Link href="/auth/signin" className="text-base font-medium text-white/80 hover:text-white transition-opacity">
                  Log in
              </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
