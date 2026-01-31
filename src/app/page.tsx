"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Image from 'next/image';
import { mainBackground } from '@/lib/placeholder-images.json';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        // Redirect to the new welcome page
        router.replace('/welcome');
      }
    }
  }, [user, authLoading, router]);

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-4 bg-home-dark-bg text-white overflow-hidden">
        <Image
            src={mainBackground.src}
            alt={mainBackground.alt}
            fill
            className="object-cover"
            data-ai-hint={mainBackground.hint}
            priority
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative z-10">
            <SmileyRockLoader />
        </div>
    </div>
  );
}
