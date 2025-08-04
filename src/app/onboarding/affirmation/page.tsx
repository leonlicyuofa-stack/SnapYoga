"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Image from 'next/image';

export default function OnboardingAffirmationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
            <CardTitle className="text-3xl font-bold">A Moment of Motivation</CardTitle>
            <CardDescription>Consistency is the key to progress in your yoga journey.</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="relative aspect-[9/16] w-full max-w-xs mx-auto rounded-lg overflow-hidden">
                <Image
                    src="https://storage.googleapis.com/project-1-426515-3999bb.appspot.com/revisions/2a4b8686-35ba-411a-8452-fefce0c5e7b5/image-1.jpeg"
                    alt="Consistency is the key"
                    fill
                    className="object-cover"
                    data-ai-hint="motivational quote"
                 />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
                onClick={handleNext} 
                className="w-full"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Let's set up your goals.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
