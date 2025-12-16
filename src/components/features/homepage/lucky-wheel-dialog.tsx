
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
  { name: "PRIME SET", type: 'win' },
  { name: "20% OFF", type: 'win' },
  { name: "TRY AGAIN", type: 'lose' },
  { name: "LIP SET", type: 'win' },
  { name: "EYE SET", type: 'win' },
  { name: "PRIME SET", type: 'win' },
  { name: "20% OFF", type: 'win' },
  { name: "TRY AGAIN", type: 'lose' },
  { name: "LIP SET", type: 'win' },
  { name: "EYE SET", type: 'win' },
];

const segmentColors = [
    '#FFFFFF', // white
    '#FDEEF2', // light pink
    '#000000', // black
    '#FDEEF2', // light pink
    '#FFFFFF', // white
    '#000000', // black
    '#FDEEF2', // light pink
    '#FFFFFF', // white
    '#000000', // black
    '#FDEEF2', // light pink
];

export function LuckyWheelDialog({ isOpen, onClose }: LuckyWheelDialogProps) {
  const [isClient, setIsClient] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<(typeof prizes[number]) | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setIsClient(true);
    if (isOpen) {
        setResult(null);
        setHasSpun(false);
        setRotation(0);
    }
  }, [isOpen]);

  const handleSpin = () => {
    if (!isClient || hasSpun || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    const totalSpins = 5;
    const winningSegment = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length;
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const finalRotation = (totalSpins * 360) - (winningSegment * segmentAngle) - randomOffset;
    
    setRotation(finalRotation);

    setTimeout(() => {
      const wonPrize = prizes[winningSegment];
      setResult(wonPrize);
      setIsSpinning(false);
      setHasSpun(true);
    }, 5500); // This should match the animation duration
  };

  const handleDialogClose = () => {
    let prizeToReport = result?.name;
    if (result?.type === 'lose') {
        prizeToReport = undefined; 
    }
    onClose(prizeToReport);
  };
  
  const handleProceed = () => {
    handleDialogClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
       <DialogOverlay className="bg-black/80" />
      <DialogContent className="sm:max-w-lg bg-[#EEDFE3] p-0 border-0 shadow-2xl rounded-lg overflow-hidden">
        
        <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDialogClose} 
            className="absolute top-2 right-2 text-black/50 hover:text-black z-20"
            aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="relative pt-12 pb-8">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto flex items-center justify-center">
                {/* Pointer */}
                <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-8 h-10 bg-black rounded-b-full z-10" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}/>
                
                {/* Wheel */}
                <div className="relative w-full h-full rounded-full border-[10px] border-[#E0B4C0] shadow-lg">
                    <div
                        className="w-full h-full rounded-full flex items-center justify-center transition-transform duration-[5000ms] ease-out"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        {prizes.map((prize, index, arr) => {
                            const angle = (360 / arr.length) * index;
                            const segmentColor = segmentColors[index % segmentColors.length];
                            const textColor = segmentColor === '#000000' ? '#FFFFFF' : '#000000';
                            
                            return (
                                <div 
                                  key={`${prize.name}-${index}`} 
                                  className="absolute w-full h-full" 
                                  style={{ 
                                    transform: `rotate(${angle}deg)`,
                                    clipPath: `polygon(50% 50%, 0% 0%, 100% 0%)`,
                                  }}
                                >
                                  <div 
                                    className="absolute w-1/2 h-1/2 top-0 left-0 origin-bottom-right"
                                    style={{
                                      backgroundColor: segmentColor,
                                      transform: `rotate(${360/arr.length}deg) skewX(${90 - (360/arr.length)}deg)`
                                    }}
                                  ></div>
                                  <div 
                                      className="absolute top-[10%] left-1/2 -translate-x-1/2 text-center font-bold text-sm uppercase tracking-widest"
                                      style={{ transform: `rotate(${-angle - (360/arr.length/2)}deg) scale(0.9)`, color: textColor }}
                                  >
                                      {prize.name.split(' ').map(word => <div key={word}>{word}</div>)}
                                  </div>
                                </div>
                            )
                        })}
                    </div>
                     {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-black rounded-full flex flex-col items-center justify-center text-white font-sans tracking-[0.2em] text-lg">
                        <div>BOBBI</div>
                        <div>BROWN</div>
                    </div>
                     {/* White dots on border */}
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full"
                            style={{ transform: `rotate(${i * 36}deg) translate(0, -145px) sm:translate(0, -180px)` }}
                        />
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-black text-white text-center py-10 px-6">
            <h2 className="text-3xl font-sans tracking-widest font-light mb-2">SPIN TO WIN</h2>
            <p className="text-sm text-white/80 font-sans">Treat yourself to a beauty surprise—on us.</p>
            <Button
                onClick={handleSpin}
                disabled={isSpinning || hasSpun}
                size="lg"
                className="mt-8 bg-white text-black hover:bg-white/80 font-bold rounded-none w-full max-w-xs text-base py-6 tracking-widest"
            >
                {isSpinning ? "SPINNING..." : (hasSpun ? (result?.type === 'win' ? `YOU WON ${result.name}!` : "TRY AGAIN!") : "SPIN")}
            </Button>
            <p className="mt-12 text-2xl font-sans tracking-[0.2em]">BOBBI BROWN</p>
        </div>
        
        {result && hasSpun && (
             <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
                <div className="p-4 bg-white/90 backdrop-blur-sm border border-black/10 rounded-lg text-center shadow-2xl animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
                    <h3 className="text-lg font-bold text-black">
                        {result.type === 'win' ? `Congratulations! You won ${result.name}.` : "Better luck next time!"}
                    </h3>
                    <Button onClick={handleProceed} className="mt-4 w-full bg-black text-white hover:bg-black/80 rounded-sm">
                        Continue
                    </Button>
                </div>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
