"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { OnboardingScaffold } from '@/components/onboarding/onboarding-scaffold';
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
      router.push('/onboarding/complete');
    } catch (e) {
      console.error("Error finalizing onboarding:", e);
      toast({
        title: "Finalization Error",
        description: "Could not complete your setup. Please try again or contact support.",
        variant: "destructive",
      });
      setIsFinalizing(false);
    }
  };
  
  const handleBackNavigation = () => {
    router.back();
  };

  return (
    <OnboardingScaffold
      title="Pick a prize!"
      subtitle="A special reward just for you."
      onBack={handleBackNavigation}
      outerClassName="[perspective:1000px]"
      cardClassName="text-center"
      next={selectedSide ? (
        <Button
          onClick={handleCompleteOnboarding}
          variant="ghost"
          className="rounded-full h-14 w-14 p-0 bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-[rgba(50,14,59,0.4)] dark:border-white/20 animate-in fade-in duration-500"
          aria-label="Next"
          disabled={isFinalizing || authLoading}
        >
          {isFinalizing || authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-7 w-7" />}
        </Button>
      ) : undefined}
    >
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
                            <div className="sy-option absolute inset-0 backdrop-blur-md rounded-2xl flex items-center justify-center cursor-pointer group [backface-visibility:hidden]">
                                <span className="sy-title text-4xl">This</span>
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
                            <div className="sy-option absolute inset-0 backdrop-blur-md rounded-2xl flex items-center justify-center cursor-pointer group [backface-visibility:hidden]">
                                <span className="sy-title text-4xl">That</span>
                            </div>
                            {/* Back */}
                            <div className="absolute inset-0 bg-amber-600/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                 <h3 className="text-xl sm:text-2xl font-bold text-white">{prizes.right.content}</h3>
                            </div>
                        </div>
                    </main>
    </OnboardingScaffold>
  );
}
