
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { LuckyWheelDialog } from '@/components/features/homepage/lucky-wheel-dialog'; 
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingLuckyWheelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showWheelDialog, setShowWheelDialog] = useState(false);

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
        // The LuckyWheelDialog doesn't actually pass the prize currently, 
        // but if it did, this is where we'd save it.
        // For now, we'll just navigate, and the result page will read it from URL params (if set by dialog later)
        // or show a default.
        // await createUserProfileDocument(user, { luckyDrawResult: prizeName }); 
        router.push(`/onboarding/draw-result?prize=${encodeURIComponent(prizeName)}`);
      } catch (error) {
        console.error("Error saving lucky draw result (if prize was passed):", error);
        router.push('/onboarding/draw-result?error=true'); 
      }
    } else {
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
            <CardDescription>Spin the wheel for a chance to win a discount or free trial extension!</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Click the button below or wait for the wheel to appear.
            </p>
             <Button onClick={() => setShowWheelDialog(true)} size="lg" className="bg-accent hover:bg-accent/80">
                Spin the Wheel!
             </Button>
          </CardContent>
        </Card>
      </div>
      {user && <LuckyWheelDialog isOpen={showWheelDialog} onClose={handleWheelCloseAndSaveResult} />}
    </AppShell>
  );
}

    
