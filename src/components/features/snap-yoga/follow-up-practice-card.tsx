"use client";

import { Play, Clock, Sparkles } from 'lucide-react';

interface FollowUpPracticeCardProps {
  onTap: () => void;
}

export function FollowUpPracticeCard({ onTap }: FollowUpPracticeCardProps) {
  return (
    <div 
      onClick={onTap}
      className="w-full p-6 cursor-pointer transition-all hover:bg-white/5 active:scale-[0.98] group"
      style={{ 
        borderRadius: '24px 12px 24px 24px',
        border: '0.5px solid rgba(193,154,107,0.18)',
        background: 'rgba(13,20,30,0.50)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Play Preview / Thumbnail Placeholder */}
        <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
           <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(180,110,65,0.2)] to-transparent opacity-60" />
           <Play className="h-12 w-12 text-white/80 group-hover:scale-110 transition-transform" />
           
           {/* Tier Hint (optional visual flair) */}
           <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[rgba(193,154,107,0.80)]" />
           </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[rgba(193,154,107,0.80)]" />
            <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.55)', fontWeight: 600 }}>Suggested Practice</span>
          </div>
          
          <h3 
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'rgba(255,240,215,0.92)' }}
            className="text-2xl font-bold mb-2 leading-tight"
          >
            Recommended: Deep Hip Opening
          </h3>
          
          <p style={{ color: 'rgba(255,240,215,0.60)' }} className="text-sm leading-relaxed mb-4">
            A restorative flow designed to improve your alignment and release tension identified in your practice.
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock className="h-3.5 w-3.5" />
              <span>12 min</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-widest font-bold">
              <span>Intermediate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
