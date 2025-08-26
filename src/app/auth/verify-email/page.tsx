
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This page is no longer needed. Redirect user immediately.
    if (!authLoading) {
      if (user) {
        // If user is logged in, send them to the next step of onboarding.
        router.replace('/onboarding/gender-profile');
      } else {
        // If no user, send them back to sign up.
        router.replace('/auth/signup');
      }
    }
  }, [user, authLoading, router]);

  // Display a loader while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <SmileyRockLoader text="Redirecting..." />
    </div>
  );
}
