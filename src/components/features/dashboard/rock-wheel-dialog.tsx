
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, X } from 'lucide-react';
import { allCollectibles, type Collectible } from './rock-data';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface YogaWheelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (collectible: Collectible) => void;
}

export function RockWheelDialog({ isOpen, onClose, onReward }: YogaWheelDialogProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState<Collectible | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setHasSpun(false);
    }
  }, [isOpen]);

  const handlePull = () => {
    if (hasSpun || isSpinning) return;
    setIsSpinning(true);

    // Reel spin animation duration ~1.5s
    setTimeout(() => {
      // Logic: Pick a random item from allCollectibles for this demo pull
      const prizeIndex = Math.floor(Math.random() * allCollectibles.length);
      const wonPrize = allCollectibles[prizeIndex];
      
      setResult(wonPrize);
      setIsSpinning(false);
      setHasSpun(true);
    }, 1800);
  };

  const handleCloseAndReward = () => {
    if (result) {
      onReward(result);
    }
    onClose();
  };

  const Reel = ({ spinning }: { spinning: boolean }) => (
    <div className={cn(
      "w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-3xl rounded-lg border transition-all duration-300",
      "bg-[rgba(255,240,215,0.05)] border-[rgba(193,154,107,0.18)]",
      spinning && "animate-pulse scale-95"
    )}>
      {spinning ? (
        <div className="animate-bounce">❓</div>
      ) : (
        <span>{result ? "✨" : "❔"}</span>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-card shadow-xl rounded-2xl p-0 overflow-hidden border-[rgba(193,154,107,0.25)]">
        <style>{`
          @keyframes reel-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-reel { animation: reel-bounce 0.2s infinite; }
        `}</style>
        
        <DialogHeader className="text-center pt-8 px-6">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary font-serif">Monthly Reward!</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm sm:text-base italic">
            Pull the lever to reveal your monthly collectible.
          </DialogDescription>
        </DialogHeader>
        
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-20"
            aria-label="Close"
        >
            <X className="h-5 w-5" />
        </Button>

        <div className="py-8 px-6 flex flex-col items-center">
            {/* Slot Machine Body */}
            <div 
              className="relative p-6 sm:p-8 w-full max-w-[300px] flex flex-col items-center gap-6"
              style={{
                background: 'linear-gradient(180deg, rgba(193,154,107,0.18) 0%, rgba(193,154,107,0.08) 100%)',
                border: '1px solid rgba(193,154,107,0.35)',
                borderRadius: '24px 24px 18px 18px',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
                {/* Reels Container */}
                <div className="flex gap-2 sm:gap-4">
                  <Reel spinning={isSpinning} />
                  <Reel spinning={isSpinning} />
                  <Reel spinning={isSpinning} />
                </div>

                {/* Decorative Lever (Visual only) */}
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
                   <div className="w-2 h-16 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full" />
                   <div className={cn(
                     "w-6 h-6 rounded-full bg-red-600 shadow-lg -mt-1 transition-transform duration-300",
                     isSpinning && "translate-y-12 scale-90"
                   )} />
                </div>

                <Button
                  onClick={handlePull}
                  disabled={isSpinning || hasSpun}
                  className="w-full h-12 rounded-full font-bold tracking-widest text-xs uppercase shadow-xl transition-all active:scale-95 bg-[rgba(193,154,107,0.85)] text-[rgba(25,16,8,0.95)]"
                >
                  {isSpinning ? "Revealing..." : hasSpun ? "Setted" : "Pull the Lever"}
                </Button>
            </div>

            {/* Result Area */}
            {result && hasSpun && (
              <div className="mt-8 text-center animate-in zoom-in-95 fade-in duration-500 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                   <span className="text-sm font-bold text-primary uppercase tracking-widest">You Won!</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center border-2" 
                      style={{ borderColor: result.color, background: `${result.color}15` }}
                    >
                        <Image src={result.imageUrl} alt={result.name} width={70} height={70} className="rounded-full" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white" style={{ color: result.color }}>{result.name}</h3>
                      <p className="text-xs text-white/50 max-w-[200px] mx-auto mt-1 italic">"{result.story}"</p>
                    </div>
                </div>
              </div>
            )}
        </div>

        <DialogFooter className="px-6 pb-8 pt-2">
            {hasSpun ? (
               <Button onClick={handleCloseAndReward} className="w-full h-12 rounded-full font-bold bg-white/90 text-black hover:bg-white">
                  Add to Collection
               </Button>
            ) : (
              <p className="text-[10px] uppercase tracking-widest text-white/30 text-center w-full">One pull per calendar month</p>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
