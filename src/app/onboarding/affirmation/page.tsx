"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { InteractivePebble } from '@/components/icons/InteractivePebble';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

export default function OnboardingAffirmationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [revealed, setRevealed] = useState<string[]>([]);

  const pebbles = [
    { id: 'i', text: 'I' },
    { id: 'am', text: 'Am' },
    { id: 'amazing', text: 'Amazing!' },
  ];

  const handlePebbleClick = (id: string) => {
    if (!revealed.includes(id)) {
      setRevealed(prev => [...prev, id]);
    }
  };

  const allRevealed = revealed.length === pebbles.length;

  const handleNext = () => {
    router.push('/onboarding/yoga-goal');
  };

  if (authLoading) {
      return (
          <AppShell>
              <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                  <SmileyRockLoader text="Loading..." />
              </div>
          </AppShell>
      );
  }

  if (!user && !authLoading) {
      router.replace('/auth/signin');
      return null;
  }

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <Heart className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">A Quick Affirmation</CardTitle>
            <CardDescription>Tap the pebbles from top to bottom.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 py-8">
            <div className="flex flex-col items-center space-y-4">
              {pebbles.map(({ id, text }) => {
                  const isRevealed = revealed.includes(id);
                  return (
                      <div key={id} className="flex flex-col items-center w-full">
                           <button onClick={() => handlePebbleClick(id)} className="group focus:outline-none">
                              <InteractivePebble isRevealed={isRevealed} />
                           </button>
                           <p className={cn(
                               "text-3xl font-script font-bold text-primary mt-2 transition-all duration-500",
                               isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                           )}>
                               {text}
                           </p>
                      </div>
                  )
              })}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
                onClick={handleNext} 
                disabled={!allRevealed} 
                className="w-full"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              {allRevealed ? "You are amazing! Let's continue." : "Complete the affirmation to proceed."}
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
