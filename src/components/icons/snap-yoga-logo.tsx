"use client";

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function SnapYogaLogo() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center" aria-label={t('snapYogaTitle')}>
      <svg
        width="250"
        height="50"
        viewBox="0 0 250 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-auto"
      >
        <title>SnapYoga</title>
        <defs>
            <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B6D4F" />
                <stop offset="50%" stopColor="#C19A6B" />
                <stop offset="100%" stopColor="#8B6D4F" />
            </linearGradient>
        </defs>
        <text 
          x="50%" 
          y="38"
          textAnchor="middle"
          fontFamily="Didot, 'Bodoni MT', 'Century Schoolbook', 'Palatino Linotype', Georgia, serif"
          fontSize="42"
          letterSpacing="2.5"
          fill="url(#logo-gold)"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        >
          SnapYoga
        </text>
      </svg>
    </div>
  );
}
