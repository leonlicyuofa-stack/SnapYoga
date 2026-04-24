"use client";

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function SnapYogaLogo() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center" aria-label={t('snapYogaTitle')}>
      <svg
        width="220" 
        height="50"
        viewBox="0 0 220 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-auto"
      >
        <title>SnapYoga</title>
        <defs>
            <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#F5E0A3" />
                <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
        </defs>
        <text 
          x="50%" 
          y="38"
          textAnchor="middle"
          fontFamily="Didot, 'Bodoni MT', 'Century Schoolbook', 'Palatino Linotype', Georgia, serif"
          fontSize="42"
          letterSpacing="-1.5"
          fill="url(#logo-gold)"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          SnapYoga
        </text>
      </svg>
    </div>
  );
}
