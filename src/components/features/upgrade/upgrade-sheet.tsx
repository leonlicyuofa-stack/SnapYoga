"use client";

import { useEffect, useState } from 'react';
import { Crown, PlayCircle, Infinity, BarChart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UpgradeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function UpgradeSheet({ isOpen, onClose, onUpgrade }: UpgradeSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      
      {/* Scrim */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/45 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )} 
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "relative w-full max-w-lg transition-transform duration-500 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ 
          background: 'linear-gradient(175deg, #20180e 0%, #14110c 100%)',
          borderTop: '0.5px solid rgba(193,154,107,0.35)',
          borderRadius: '24px 24px 0 0',
          padding: '14px 16px 18px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)'
        }}
      >
        {/* Grabber */}
        <div className="w-10 h-1 rounded-full bg-white/10 mx-auto mb-6" />

        {/* Crown Badge */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(193,154,107,0.15)] flex items-center justify-center border border-[rgba(193,154,107,0.30)] shadow-lg">
            <Crown className="w-8 h-8 text-[rgba(193,154,107,0.92)]" />
          </div>
        </div>

        <div className="text-center space-y-1 mb-8">
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-bold text-[rgba(255,240,215,0.92)]">
            Unlock SnapYoga Gold
          </h2>
          <p className="text-sm italic text-[rgba(255,240,215,0.45)] leading-tight">
            Go deeper with guided follow-up practices
          </p>
        </div>

        {/* Features */}
        <div className="space-y-5 mb-10 px-2">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(193,154,107,0.08)] flex items-center justify-center shrink-0 border border-white/5">
              <PlayCircle className="w-5 h-5 text-[rgba(193,154,107,0.85)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[rgba(255,240,215,0.85)]">Follow-up practices</p>
              <p className="text-xs italic text-[rgba(255,240,215,0.38)]">Guided videos tailored to your pose</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(193,154,107,0.08)] flex items-center justify-center shrink-0 border border-white/5">
              <Infinity className="w-5 h-5 text-[rgba(193,154,107,0.85)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[rgba(255,240,215,0.85)]">Unlimited analyses</p>
              <p className="text-xs italic text-[rgba(255,240,215,0.38)]">Analyze as many poses as you like</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(193,154,107,0.08)] flex items-center justify-center shrink-0 border border-white/5">
              <BarChart className="w-5 h-5 text-[rgba(193,154,107,0.85)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[rgba(255,240,215,0.85)]">Advanced feedback</p>
              <p className="text-xs italic text-[rgba(255,240,215,0.38)]">Deeper alignment insights</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={onUpgrade}
            className="w-full h-14 rounded-full text-base font-bold tracking-widest bg-[rgba(193,154,107,0.85)] hover:bg-[rgba(193,154,107,0.95)] text-[rgba(25,16,8,0.95)] shadow-xl transition-all active:scale-95"
          >
            UPGRADE TO GOLD ♛
          </Button>
          <button 
            onClick={onClose}
            className="w-full text-center text-xs font-semibold uppercase tracking-widest text-[rgba(255,240,215,0.30)] hover:text-[rgba(255,240,215,0.50)] transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
