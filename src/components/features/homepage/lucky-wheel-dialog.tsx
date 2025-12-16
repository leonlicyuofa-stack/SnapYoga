
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Gift, RotateCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

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
       <DialogOverlay className="bg-black/60" />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center pt-6 px-6">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary">Spin the Lucky Wheel!</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm sm:text-base">
            Try your luck to win an exclusive SnapYoga prize.
          </DialogDescription>
        </DialogHeader>
        
        <Button 
            variant="ghost" 
            onClick={handleDialogClose} 
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xs"
            aria-label="Skip and continue"
        >
            Skip & Continue
        </Button>

        <div className="py-6 sm:py-8 px-4 sm:px-6 flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex-shrink-0">
            <div
            className="w-full h-full rounded-full border-4 border-primary shadow-lg flex items-center justify-center transition-transform duration-[4000ms] ease-out relative"
            style={{ 
                transform: `rotate(${rotation}deg)`,
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
                {prizes.map((prize, index, arr) => {
                    const angle = (360 / arr.length) * index;
                    return (
                        <div key={prize.name} className="absolute w-full h-full" style={{ transform: `rotate(${angle}deg)`}}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 p-1 bg-card rounded-full flex items-center justify-center h-8 w-8" style={{transform: `rotate(${-rotation - angle}deg)`}}>
                                {React.cloneElement(prize.icon, { className: "h-5 w-5"})}
                            </div>
                        </div>
                    )
                })}
            </div>
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 
              border-l-[12px] sm:border-l-[14px] border-l-transparent
              border-r-[12px] sm:border-r-[14px] border-r-transparent
              border-b-[18px] sm:border-b-[22px] border-t-destructive drop-shadow-md z-10" style={{borderBottomColor: 'hsl(var(--destructive))', borderTop: 'none', transform: 'rotate(180deg) translateY(-10px)'}}>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Button
                    onClick={handleSpin}
                    disabled={isSpinning || hasSpun || !isClient}
                    size="lg"
                    className="w-32 h-32 rounded-full text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md flex flex-col"
                >
                    {isSpinning ? <SmileyRockLoader /> : (hasSpun ? "Spun!" : "Spin!")}
                </Button>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-grow text-center h-24">
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
            <Button onClick={handleProceed} className="w-full" disabled={!hasSpun}>
                Continue to Next Step
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
