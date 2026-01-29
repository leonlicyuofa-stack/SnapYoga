"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define the structure for prizes
const prizes = {
  left: { name: "3-month free trial", content: "3-Month Free Trial" },
  right: { name: "A warm cup of Coffee!", content: "A Warm Cup of Coffee" }
};

export default function PickAPrizePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handlePrizeSelection = (side: 'left' | 'right') => {
    if (isRevealing) return;
    setIsRevealing(true);
    setSelectedSide(side);
  };

  const handleCompleteOnboarding = async () => {
    if (!user || !selectedSide) {
      toast({ title: "Error", description: "No authenticated user or prize found.", variant: "destructive" });
      return;
    }
    setIsFinalizing(true);
    try {
      const prizeToSave = prizes[selectedSide].name;
      await createUserProfileDocument(user, { onboardingCompleted: true, luckyDrawResult: prizeToSave });
      toast({
        title: "🎉 Onboarding Complete! Welcome to SnapYoga! 🎉",
        description: "You're all set to start your yoga journey. Let's explore your dashboard!",
        duration: 5000,
      });

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
  
  const handleBackNavigation = () => {
    router.back();
  };

  return (
    <div className="relative min-h-screen font-serif text-white bg-home-dark-bg [perspective:1000px]">
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
            <div className="w-full max-w-lg relative">
                 <Button
                    onClick={handleBackNavigation}
                    variant="ghost"
                    className="absolute top-4 left-4 rounded-full h-12 w-12 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8 text-center">
                    <header className={cn("transition-opacity duration-500", isRevealing ? 'opacity-0' : 'opacity-100')}>
                         <div className="mx-auto mb-4 inline-block">
                            <SnapYogaLogo />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Pick a Prize!</h1>
                        <p className="text-lg text-white/80">A special reward just for you.</p>
                    </header>

                    <main className="grid grid-cols-2 gap-4 md:gap-8 h-48 sm:h-56">
                        {/* Left Prize */}
                        <div 
                            className={cn(
                                "relative [transform-style:preserve-3d] transition-all duration-700 w-full h-full",
                                selectedSide === 'left' && '[transform:rotateY(180deg)]',
                                selectedSide === 'right' && 'opacity-0'
                            )}
                            onClick={() => handlePrizeSelection('left')}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center cursor-pointer group [backface-visibility:hidden]">
                                <span className="text-4xl font-bold">This</span>
                            </div>
                            {/* Back */}
                            <div className="absolute inset-0 bg-yellow-400/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                <h3 className="text-xl sm:text-2xl font-bold text-black">{prizes.left.content}</h3>
                            </div>
                        </div>

                        {/* Right Prize */}
                         <div 
                            className={cn(
                                "relative [transform-style:preserve-3d] transition-all duration-700 w-full h-full",
                                selectedSide === 'right' && '[transform:rotateY(180deg)]',
                                selectedSide === 'left' && 'opacity-0'
                            )}
                            onClick={() => handlePrizeSelection('right')}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center cursor-pointer group [backface-visibility:hidden]">
                                <span className="text-4xl font-bold">That</span>
                            </div>
                            {/* Back */}
                            <div className="absolute inset-0 bg-amber-600/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                 <h3 className="text-xl sm:text-2xl font-bold text-white">{prizes.right.content}</h3>
                            </div>
                        </div>
                    </main>
                    <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-opacity duration-300", selectedSide ? 'opacity-0' : 'opacity-100')}>
                        <div className="relative text-center text-white font-extrabold tracking-widest uppercase">
                            <span className="relative block text-2xl my-1">or</span>
                        </div>
                    </div>
                </div>
                {selectedSide && (
                     <Button
                        onClick={handleCompleteOnboarding}
                        variant="ghost"
                        className="absolute bottom-4 right-4 rounded-full h-14 w-14 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20 animate-in fade-in duration-500"
                        aria-label="Next"
                        disabled={isFinalizing || authLoading}
                    >
                        {isFinalizing || authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-7 w-7" />}
                    </Button>
                )}
            </div>
        </div>
    </div>
  );
}
