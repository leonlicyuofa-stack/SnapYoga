
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        // If not logged in, maybe go to a sign-in page
        router.replace('/auth/signin');
      }
    }
  }, [user, authLoading, router]);

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-4 bg-background text-foreground overflow-hidden">
        <SmileyRockLoader />
        <p className="mt-4 text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  );
}
