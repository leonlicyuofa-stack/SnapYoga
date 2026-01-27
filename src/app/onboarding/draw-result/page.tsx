"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight, Loader2, UserCircle, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

function DrawResultContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const prize = searchParams.get('prize');
  const error = searchParams.get('error');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleCompleteOnboarding = async () => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsFinalizing(true);
    try {
      let prizeToSave = 'No prize';
      if (prize) {
        try {
          prizeToSave = decodeURIComponent(prize);
        } catch (e) {
          console.warn("Failed to decode prize for saving, saving raw value:", prize, e);
          prizeToSave = prize; // Save raw prize if decoding fails
        }
      }
      await createUserProfileDocument(user, { onboardingCompleted: true, luckyDrawResult: prizeToSave });
      toast({
        title: "🎉 Onboarding Complete! Welcome to SnapYoga! 🎉",
        description: "You're all set to start your yoga journey. Let's explore your dashboard!",
        duration: 5000,
      });

      // Set a flag to trigger the reward dialog on the dashboard
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('justCompletedOnboarding', 'true');
      }

      router.push('/dashboard');
    } catch (e) {
      console.error("Error finalizing onboarding:", e);
      toast({
        title: "Finalization Error",
        description: "Could not complete your setup. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsFinalizing(false);
    }
  };
  
  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-white" /></div>;
  }

  return (
    <div className="relative min-h-screen font-serif text-white bg-home-dark-bg">
        <Image
            src="https://picsum.photos/seed/yogawellness/1920/1080"
            alt="A tranquil, modern space for practicing yoga."
            fill
            className="object-cover"
            data-ai-hint="modern wellness room"
            priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8 text-center">
                <header>
                    <div className="mx-auto mb-4 inline-block">
                        <SnapYogaLogo />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Congratulations!</h1>
                    <p className="text-sm text-white/80">Here's what you've got!</p>
                </header>
                
                <main className="flex flex-col items-center space-y-4">
                    {error ? (
                        <XCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
                    ) : prize ? (
                         <Gift className="mx-auto h-16 w-16 text-yellow-300 mb-4" />
                    ) : (
                        <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
                    )}
                    
                    <div className="space-y-2">
                        {error ? (
                            <p className="text-red-400">There was an issue with the lucky spin. Please try again later or proceed.</p>
                        ) : prize ? (
                            <p className="text-xl font-semibold text-yellow-300">You won: {prize}!</p>
                        ) : (
                            <p className="text-white/80">No prize this time, but you're ready to start!</p>
                        )}
                    </div>
                </main>

                <footer>
                    <Button onClick={handleCompleteOnboarding} className="w-full h-12 text-base rounded-full bg-white/90 text-black hover:bg-white" disabled={isFinalizing}>
                        {isFinalizing ? <Loader2 className="animate-spin" /> : <>Go to Dashboard <ArrowRight className="ml-2"/></>}
                    </Button>
                </footer>
            </div>
        </div>
    </div>
  );
}

export default function DrawResultPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="h-16 w-16 animate-spin text-white" /></div>}>
            <DrawResultContent />
        </Suspense>
    );
}
