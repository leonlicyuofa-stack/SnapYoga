
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, PartyPopper, X } from 'lucide-react';
import { Collectible } from './rock-data';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface RewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rock: Collectible | null;
}

export function RewardDialog({ isOpen, onClose, rock: item }: RewardDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowConfetti(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-card shadow-xl rounded-lg p-0 overflow-hidden">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} gravity={0.1} />}
        <DialogHeader className="text-center pt-8 px-6 bg-primary/5 relative">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
        >
            <X className="h-5 w-5" />
        </Button>
          <div className="relative mx-auto mb-4">
             <PartyPopper className="h-16 w-16 text-primary" />
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary">You've Earned an Item!</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm sm:text-base">
            Your collection is growing. Keep up the great work!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 sm:py-8 px-4 sm:px-6 flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col items-center gap-2">
                <div
                    className="p-3 rounded-full transition-all duration-300 animate-in zoom-in-50"
                    style={{
                    backgroundColor: `${item.color}33`,
                    border: `3px solid ${item.color}`
                    }}
                >
                    <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-full" />
                </div>
                <p className="text-2xl font-semibold" style={{ color: item.color }}>
                    {item.name}
                </p>
                <p className="text-md text-muted-foreground text-center max-w-xs">
                    {item.description}
                </p>
            </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2">
            <Button onClick={onClose} className="w-full" variant="default">
                <CheckCircle className="mr-2 h-5 w-5"/>
                Got it!
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
