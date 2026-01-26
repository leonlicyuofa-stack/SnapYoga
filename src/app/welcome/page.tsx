
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--welcome-cream))] text-[hsl(var(--welcome-dark-brown))] overflow-hidden">
      
      {/* Top curved section */}
      <header className="relative w-full bg-[hsl(var(--welcome-pastel-brown))] text-center pt-16 pb-32">
        <div className="flex justify-center">
            <SnapYogaLogo />
        </div>
        <p className="mt-2 text-lg opacity-80">your AI companion for mindfulness</p>
        <div 
          className="absolute bottom-0 left-0 w-full h-24 bg-transparent"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, hsl(var(--welcome-cream)) 50%, transparent 50.5%)',
            backgroundSize: '100% 50px',
            backgroundRepeat: 'no-repeat',
            transform: 'translateY(25px)'
          }}
        />
      </header>

      {/* Main content with illustration */}
      <main className="flex-grow flex flex-col items-center justify-center -mt-24 px-4 relative z-10">
        <div className="w-full max-w-sm h-64 relative">
          <Image
            src="https://picsum.photos/seed/yogapose/600/400"
            alt="Serene yoga meditation"
            width={600}
            height={400}
            data-ai-hint="serene yoga meditation"
            className="w-full h-full object-contain rounded-lg drop-shadow-2xl"
          />
        </div>
      </main>

      {/* Bottom curved section */}
      <footer className="relative w-full bg-[hsl(var(--welcome-pastel-brown))] text-center pb-12 pt-24 mt-8">
         <div 
          className="absolute top-0 left-0 w-full h-24 bg-transparent"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--welcome-cream)) 50%, transparent 50.5%)',
            backgroundSize: '100% 50px',
            backgroundRepeat: 'no-repeat',
            transform: 'translateY(-25px)'
          }}
        />
        <div className="flex flex-col items-center gap-4">
            <Link href="/auth/signin" className="text-base font-medium opacity-80 hover:opacity-100 transition-opacity">
                Log in
            </Link>
            <Button 
                size="lg" 
                className="w-64 h-14 text-lg rounded-full font-bold bg-[hsl(var(--welcome-button-yellow))] text-[hsl(var(--welcome-dark-brown))] hover:bg-[hsl(var(--welcome-button-yellow-darker))] shadow-lg transform hover:scale-105 transition-transform"
                asChild
            >
                <Link href="/auth/signup">
                Create an account
                <ChevronRight className="ml-2 h-6 w-6" />
                </Link>
            </Button>
        </div>
      </footer>
    </div>
  );
}
