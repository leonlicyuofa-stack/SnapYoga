"use client";

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function SnapYogaLogo() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center" aria-label={t('snapYogaTitle')}>
      <svg
        width="180" 
        height="40"
        viewBox="0 0 180 40"
        fill="hsl(var(--primary))"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto"
      >
        <title>SnapYoga</title>
        {/* Using a font stack that mimics high-contrast serif fonts like Didot or Bodoni to replicate the desired style. */}
        <text 
          x="50%" 
          y="32"
          textAnchor="middle"
          fontFamily="Didot, 'Bodoni MT', 'Century Schoolbook', 'Palatino Linotype', Georgia, serif"
          fontSize="36"
          letterSpacing="-1"
        >
          SnapYoga
        </text>
      </svg>
    </div>
  );
}
