
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { LuckyWheelDialog } from '@/components/features/homepage/lucky-wheel-dialog'; // Re-using existing component
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingLuckyWheelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showWheelDialog, setShowWheelDialog] = useState(false);

  // Automatically open the dialog when the page loads
  useEffect(() => {
    if (!authLoading && user) {
      setShowWheelDialog(true);
    }
  }, [authLoading, user]);

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }
  
  const handleWheelCloseAndSaveResult = async (prizeName?: string) => {
    setShowWheelDialog(false);
    if (user && prizeName) {
      try {
        await createUserProfileDocument(user, { luckyDrawResult: prizeName });
        // Navigate to the result page, passing the prize name or fetching from profile
        router.push(`/onboarding/draw-result?prize=${encodeURIComponent(prizeName)}`);
      } catch (error) {
        console.error("Error saving lucky draw result:", error);
        router.push('/onboarding/draw-result?error=true'); // Navigate with error flag
      }
    } else {
      // If no prize or user, just go to next step (or show an error if appropriate)
       router.push('/onboarding/draw-result');
    }
  };


  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <Gift className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Lucky Draw!</CardTitle>
            <CardDescription>Step 13 of 14: Spin the wheel for a chance to win a discount or free trial extension!</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Click the button below or wait for the wheel to appear.
            </p>
             <Button onClick={() => setShowWheelDialog(true)} size="lg" className="bg-accent hover:bg-accent/80">
                Spin the Wheel!
             </Button>
             {/* The LuckyWheelDialog will be controlled by showWheelDialog */}
          </CardContent>
        </Card>
      </div>
      {/* 
        The LuckyWheelDialog itself has complex internal logic for spinning and displaying results.
        We'll need a way for IT to communicate its result back to THIS page,
        or for THIS page to pass a callback to save the result and navigate.
        For now, let's assume it calls onClose with a potential prize.
      */}
      {user && <LuckyWheelDialog isOpen={showWheelDialog} onClose={() => handleWheelCloseAndSaveResult(undefined /* Modify LuckyWheelDialog to pass prize */)} />}
    </AppShell>
  );
}

    