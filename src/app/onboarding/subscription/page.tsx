"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Star, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';


export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading && !user) {
    router.replace('/auth/signin');
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  const handleStartFreeTrial = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { 
        trialStatus: 'active', 
        trialStartDate: new Date().toISOString(), 
      });
      router.push('/onboarding/pick-a-prize'); 
    } catch (error) {
      console.error("Error activating free trial:", error);
      toast({
        title: "Error",
        description: "Could not activate free trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
                <header className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Unlock SnapYoga Premium</h1>
                    <p className="text-sm text-white/80">Choose your plan to continue.</p>
                </header>
                
                <main className="space-y-6">
                    <div className="p-6 border border-white/20 rounded-lg bg-white/10 text-center">
                        <h3 className="text-2xl font-semibold">Monthly Subscription</h3>
                        <p className="text-4xl font-bold my-2 text-white">IDR 100,000</p>
                        <p className="text-white/80 text-sm">per month</p>
                        <ul className="text-left space-y-2 mt-4 text-sm text-white/90">
                            <li className="flex items-center"><Check className="h-5 w-5 text-green-400 mr-2" /> Unlimited Pose Analysis</li>
                            <li className="flex items-center"><Check className="h-5 w-5 text-green-400 mr-2" /> Advanced Feedback</li>
                            <li className="flex items-center"><Check className="h-5 w-5 text-green-400 mr-2" /> Progress Tracking & History</li>
                            <li className="flex items-center"><Check className="h-5 w-5 text-green-400 mr-2" /> Exclusive Challenges</li>
                        </ul>
                    </div>

                    <Button 
                        onClick={handleStartFreeTrial} 
                        className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Star className="mr-2 h-5 w-5" /> Start 7-Day Free Trial (Mock)</>}
                    </Button>
                </main>
                
                <footer className="text-center">
                    <p className="text-xs text-white/60">
                    Cancel anytime. Payment will be processed after the trial if not cancelled (mock).
                    </p>
                </footer>
            </div>
        </div>
    </div>
  );
}
