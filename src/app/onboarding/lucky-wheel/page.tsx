
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { LuckyWheelDialog } from '@/components/features/homepage/lucky-wheel-dialog'; 
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { OnboardingBackground } from '@/components/layout/OnboardingBackground';

export default function OnboardingLuckyWheelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showWheelDialog, setShowWheelDialog] = useState(false);

  useEffect(() => {
    // Automatically open the dialog as soon as we know the user is logged in.
    if (!authLoading && user) {
      const timer = setTimeout(() => setShowWheelDialog(true), 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user]);

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><SmileyRockLoader text="Redirecting..." /></div></AppShell>;
  }
  
  const handleWheelCloseAndSaveResult = async (prizeName?: string) => {
    setShowWheelDialog(false);
    // Add a slight delay to allow the dialog to close before navigating
    setTimeout(() => {
        if (prizeName) {
            router.push(`/onboarding/draw-result?prize=${encodeURIComponent(prizeName)}`);
        } else {
            router.push('/onboarding/draw-result');
        }
    }, 300);
  };


  return (
    // The AppShell now just provides the background. The dialog is the main content.
    <AppShell>
      <div className="relative flex flex-col min-h-screen items-center justify-center py-12 px-4 bg-black/50">
          <SmileyRockLoader text="Loading your surprise..."/>
      </div>
      {user && <LuckyWheelDialog isOpen={showWheelDialog} onClose={handleWheelCloseAndSaveResult} />}
    </AppShell>
  );
}
