
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Loader2, Gift, RotateCw, X } from 'lucide-react';

interface LuckyWheelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const prizes = [
  { name: "10% Off Next Analysis", icon: <Award className="h-6 w-6 text-yellow-500" /> },
  { name: "Free Pose Guide PDF", icon: <Gift className="h-6 w-6 text-green-500" /> },
  { name: "SnapYoga Sticker Pack", icon: <Gift className="h-6 w-6 text-blue-500" /> },
  { name: "1 Extra Free Analysis", icon: <Award className="h-6 w-6 text-purple-500" /> },
  { name: "Good Vibes Only!", icon: <Gift className="h-6 w-6 text-pink-500" /> },
  { name: "Better Luck Next Time!", icon: <RotateCw className="h-6 w-6 text-gray-500" /> },
];

export function LuckyWheelDialog({ isOpen, onClose }: LuckyWheelDialogProps) {
  const [isClient, setIsClient] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ name: string; icon: JSX.Element } | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSpin = () => {
    if (!isClient || hasSpun || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    const totalSpins = 3 + Math.floor(Math.random() * 3); // 3 to 5 full rotations
    const randomExtraRotation = Math.random() * 360;
    // Add a base rotation to ensure it always spins a noticeable amount from current position
    const finalRotation = rotation + (totalSpins * 360) + randomExtraRotation + 720; // Add 2 more full spins for visual
    
    setRotation(finalRotation);

    setTimeout(() => {
      const prizeIndex = Math.floor(Math.random() * prizes.length);
      setResult(prizes[prizeIndex]);
      setIsSpinning(false);
      setHasSpun(true);
    }, 3800); // Slightly less than CSS duration to show result before animation fully stops if any jitter
  };

  const handleDialogClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-card shadow-xl rounded-lg p-0">
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

        <div className="py-6 sm:py-8 px-4 sm:px-6 flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72">
            <div
              className="w-full h-full rounded-full border-4 border-primary shadow-lg flex items-center justify-center transition-transform duration-[4000ms] ease-out"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(
                  hsl(var(--accent) / 0.7) 0deg 60deg, 
                  hsl(var(--secondary) / 0.7) 60deg 120deg, 
                  hsl(var(--primary) / 0.7) 120deg 180deg,
                  hsl(var(--accent) / 0.6) 180deg 240deg, 
                  hsl(var(--secondary) / 0.6) 240deg 300deg, 
                  hsl(var(--primary) / 0.6) 300deg 360deg
                )`
              }}
            >
               <div className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary shadow-inner">
                <Gift className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 
              border-l-[10px] sm:border-l-[12px] border-l-transparent
              border-r-[10px] sm:border-r-[12px] border-r-transparent
              border-t-[15px] sm:border-t-[18px] border-t-destructive drop-shadow-md z-10">
            </div>
          </div>

          <Button
            onClick={handleSpin}
            disabled={isSpinning || hasSpun || !isClient}
            size="lg"
            className="px-8 py-6 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md w-full max-w-xs rounded-md"
          >
            {isSpinning && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {hasSpun ? 'Spun!' : isSpinning ? 'Spinning...' : 'Spin Now!'}
          </Button>
        </div>

        {result && hasSpun && (
          <div className="px-6 pb-6">
            <div className="p-4 sm:p-6 bg-primary/10 border border-primary/20 rounded-lg text-center space-y-2 sm:space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-primary">Congratulations!</h3>
              <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-medium text-foreground">
                {result.icon}
                <span>{result.name}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {result.name === "Better Luck Next Time!" ? "Don't worry, keep practicing and try again another day!" : "Your prize will be noted (mock feature for now)."}
              </p>
            </div>
          </div>
        )}

        {!result && !hasSpun && (
             <div className="px-6 pb-6 text-center">
                <p className="text-sm text-muted-foreground">Click "Spin Now!" to test your luck.</p>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

