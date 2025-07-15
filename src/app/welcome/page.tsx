
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';
import { ArrowRight, PartyPopper } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/onboarding/gender-profile');
  };

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-xl text-center overflow-hidden">
          <CardHeader className="bg-muted/30 p-8">
            <div className="mb-4">
              <SmileyPebbleIcon className="mx-auto h-20 w-20 text-primary drop-shadow-lg" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-2">
              <PartyPopper className="h-8 w-8" />
              Welcome to SnapYoga!
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-muted-foreground mt-3">
              Embark on a journey to perfect your poses and deepen your practice.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <p className="text-foreground/80 leading-relaxed">
              We're thrilled to have you join our community! To get started, we'll ask a few quick questions to personalize your experience.
            </p>
            <Button
              onClick={handleGetStarted}
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              size="lg"
            >
              Let's Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
          <CardFooter className="bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground w-full">
                You're one step closer to a more mindful yoga experience.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
