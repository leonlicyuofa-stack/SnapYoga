"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Loader2, Gift, RotateCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LuckyWheelDialogProps {
  isOpen: boolean;
  onClose: (prizeWon?: string) => void; 
}

const prizes = [
  { name: "3-Month Free Trial", icon: <Award className="h-6 w-6 text-yellow-500" /> },
  { name: "10% Off Subscription", icon: <Gift className="h-6 w-6 text-green-500" /> },
  { name: "20% Off Subscription", icon: <Gift className="h-6 w-6 text-blue-500" /> },
  { name: "50% Off Subscription", icon: <Award className="h-6 w-6 text-purple-500" /> },
  { name: "Good Vibes Only!", icon: <Gift className="h-6 w-6 text-pink-500" /> }, // Non-discount prize
  { name: "Better Luck Next Time!", icon: <RotateCw className="h-6 w-6 text-gray-500" /> }, // Non-prize
];

export function LuckyWheelDialog({ isOpen, onClose }: LuckyWheelDialogProps) {
  const [isClient, setIsClient] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ name: string; icon: JSX.Element } | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setIsClient(true);
    if (isOpen) {
        setResult(null);
        setHasSpun(false);
    }
  }, [isOpen]);

  const handleSpin = () => {
    if (!isClient || hasSpun || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    const totalSpins = 3 + Math.floor(Math.random() * 3); 
    const randomExtraRotation = Math.random() * 360;
    const finalRotation = rotation + (totalSpins * 360) + randomExtraRotation + 720; 
    
    setRotation(finalRotation);

    setTimeout(() => {
      const prizeIndex = Math.floor(Math.random() * prizes.length);
      const wonPrize = prizes[prizeIndex];
      setResult(wonPrize);
      setIsSpinning(false);
      setHasSpun(true);
    }, 3800); 
  };

  const handleDialogClose = () => {
    let prizeToReport = result?.name;
    if (result?.name === "Good Vibes Only!" || result?.name === "Better Luck Next Time!") {
        prizeToReport = undefined; 
    }
    onClose(prizeToReport);
  };
  
  const handleProceed = () => {
    handleDialogClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-card shadow-xl rounded-lg p-0 overflow-hidden">
        <DialogHeader className="text-center pt-6 px-6">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary">Spin the Lucky Wheel!</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm sm:text-base">
            Try your luck to win an exclusive SnapYoga prize.
          </DialogDescription>
        </DialogHeader>
        
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDialogClose} 
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
        >
            <X className="h-5 w-5" />
        </Button>

        <div className="py-6 sm:py-8 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex-shrink-0">
             {/* This container crops the wheel */}
            <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                <div
                className="w-[200%] h-full rounded-full border-4 border-primary shadow-lg flex items-center justify-center transition-transform duration-4000 ease-out origin-center"
                style={{ 
                    transform: `translateX(-25%) rotate(${rotation}deg)`,
                    background: `conic-gradient(
                        hsl(var(--splash-blob-1)/0.8) 0deg 60deg, 
                        hsl(var(--splash-blob-2)/0.8) 60deg 120deg, 
                        hsl(200 80% 85%) 120deg 180deg,
                        hsl(var(--splash-blob-1)/0.7) 180deg 240deg, 
                        hsl(var(--splash-blob-2)/0.7) 240deg 300deg, 
                        hsl(200 80% 80%) 300deg 360deg
                    )`
                }}
                >
                </div>
            </div>
             <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-0 h-0 
              border-t-[12px] sm:border-t-[14px] border-t-transparent
              border-b-[12px] sm:border-b-[14px] border-b-transparent
              border-l-[18px] sm:border-l-[22px] border-l-destructive drop-shadow-md z-10 -rotate-90">
            </div>
             <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary shadow-inner top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Gift className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <Button
                onClick={handleSpin}
                disabled={isSpinning || hasSpun || !isClient}
                size="lg"
                className="px-8 py-6 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md w-full max-w-xs rounded-md"
            >
                {isSpinning && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {hasSpun ? 'Spun!' : isSpinning ? 'Spinning...' : 'Spin Now!'}
            </Button>
            {result && hasSpun && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-2 w-full max-w-xs animate-in fade-in-50 duration-500">
                <h3 className="text-base font-semibold text-primary">
                    {result.name === "Better Luck Next Time!" || result.name === "Good Vibes Only!" ? "Result:" : "Congratulations!"}
                </h3>
                <div className="flex items-center justify-center gap-2 text-lg font-medium text-foreground">
                    {result.icon}
                    <span>{result.name}</span>
                </div>
                </div>
            )}
          </div>

        </div>


        <DialogFooter className="px-6 pb-6 pt-4 sm:pt-2">
            <Button onClick={handleProceed} className="w-full" variant={result && hasSpun ? "default" : "outline"}>
                {hasSpun ? "Continue to Next Step" : "Skip & Continue"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
