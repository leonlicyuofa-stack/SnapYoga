
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gem, BarChart3, Sparkles, Trophy, Share2, Lightbulb, CheckCircle, X } from 'lucide-react';

interface HowToGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const guideItems = [
    { icon: Gem, text: "Claim your rocks by completing challenges." },
    { icon: BarChart3, text: "Check your progress and past analyses." },
    { icon: Sparkles, text: "Analyze your pose with AI feedback." },
    { icon: Trophy, text: "Challenge a friend to a yoga pose." },
    { icon: Share2, text: "Share your journey with your friends!" },
];

export function HowToGuideDialog({ isOpen, onClose }: HowToGuideDialogProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-card shadow-xl rounded-lg p-0 overflow-hidden">
        <DialogHeader className="text-center pt-8 px-6 bg-primary/5">
           <Lightbulb className="mx-auto h-16 w-16 text-primary mb-4" />
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-primary">How to Get Started</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm sm:text-base">
            Here are a few things you can do to begin your journey.
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

        <div className="py-6 sm:py-8 px-4 sm:px-6">
            <ul className="space-y-4">
                {guideItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <li key={index} className="flex items-center gap-4 animate-feature-item" style={{ animationDelay: `${index * 150}ms`}}>
                            <div className="flex-shrink-0 bg-accent/10 text-accent p-3 rounded-full">
                                <Icon className="h-6 w-6" />
                            </div>
                            <p className="text-md text-foreground">{item.text}</p>
                        </li>
                    )
                })}
            </ul>
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

    