"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Image from 'next/image';

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
    <div className="relative flex flex-col min-h-screen items-center justify-center p-4 bg-black text-white overflow-hidden">
        <Image
            src="/images/background.png"
            alt="A tranquil, modern yoga space."
            fill
            className="object-cover"
            data-ai-hint="modern wellness room"
            priority
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative z-10">
            <SmileyRockLoader />
        </div>
    </div>
  );
}
