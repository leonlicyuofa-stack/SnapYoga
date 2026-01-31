
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, RotateCw, X } from 'lucide-react';
import { allCollectibles, type Collectible } from './rock-data';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Image from 'next/image';

interface YogaWheelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (collectible: Collectible) => void;
}

export function RockWheelDialog({ isOpen, onClose, onReward }: YogaWheelDialogProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState<Collectible | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setHasSpun(false);
    }
  }, [isOpen]);

  const handleSpin = () => {
    if (hasSpun || isSpinning) return;
    setIsSpinning(true);

    const totalSpins = 4 + Math.random() * 3;
    const finalRotation = rotation + totalSpins * 360;
    setRotation(finalRotation);

    setTimeout(() => {
      // Exclude already collected items for this demo
      const uncollectedItems = allCollectibles.filter(r => !['welcome_mat', 'first_analysis_block', 'join_challenge_strap'].includes(r.id));
      const prizeIndex = Math.floor(Math.random() * uncollectedItems.length);
      const wonPrize = uncollectedItems[prizeIndex];
      
      setResult(wonPrize);
      setIsSpinning(false);
      setHasSpun(true);
    }, 4500); // Animation duration
  };

  const handleCloseAndReward = () => {
    if (result) {
      onReward(result);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-card shadow-xl rounded-lg p-0">
        <DialogHeader className="text-center pt-6 px-6">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary">Challenge Reward!</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm sm:text-base">
            Spin the wheel to discover which item you've earned!
          </DialogDescription>
        </DialogHeader>
        
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
        >
            <X className="h-5 w-5" />
        </Button>

        <div className="py-6 sm:py-8 px-4 sm:px-6 flex flex-col items-center justify-center space-y-6 sm:space-y-8">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                <div
                    className="w-full h-full rounded-full border-4 border-primary shadow-lg flex items-center justify-center transition-transform duration-[4s] ease-out relative"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {allCollectibles.map((item, index, arr) => {
                        const angle = (360 / arr.length) * index;
                        return (
                            <div key={item.id} className="absolute w-full h-full" style={{ transform: `rotate(${angle}deg)`}}>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 p-1 bg-card rounded-full">
                                    <Image src={item.imageUrl} alt={item.name} width={32} height={32} className="rounded-full" style={{transform: `rotate(${-rotation - angle}deg)`}}/>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 
                    border-l-[12px] border-l-transparent
                    border-r-[12px] border-r-transparent
                    border-t-[18px] border-t-destructive drop-shadow-md z-10">
                </div>
                 <div className="absolute w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary shadow-inner top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Gift className="w-8 h-8" />
                </div>
            </div>

             <Button
                onClick={handleSpin}
                disabled={isSpinning || hasSpun}
                size="lg"
                className="px-8 py-6 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md w-full max-w-xs rounded-md"
            >
                {isSpinning && <SmileyRockLoader />}
                {hasSpun ? 'Spun!' : isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
            </Button>
        </div>

        {result && hasSpun && (
          <div className="px-6 pb-2">
            <div className="p-4 sm:p-6 bg-primary/10 border border-primary/20 rounded-lg text-center space-y-2 sm:space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-primary">
                You won a...
              </h3>
              <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-medium text-foreground">
                <Image src={result.imageUrl} alt={result.name} width={32} height={32} className="rounded-full" />
                <span style={{color: result.color}}>{result.name}!</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="px-6 pb-6 pt-4 sm:pt-2">
            <Button onClick={handleCloseAndReward} className="w-full" variant={result && hasSpun ? "default" : "outline"} disabled={isSpinning}>
                {hasSpun ? "Awesome! Add to Collection" : "Skip For Now"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
