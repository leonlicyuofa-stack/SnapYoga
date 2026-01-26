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
        {/* Using a generic serif font-family. The browser will fall back. */}
        <text 
          x="0" 
          y="32" 
          fontFamily="Georgia, Times, serif" 
          fontSize="36" 
          letterSpacing="-1"
        >
          Snap
        </text>
        {/* Using the script font from the layout's imported variable */}
        <text 
          x="95"
          y="32"
          fontFamily="var(--font-shadows-into-light), cursive"
          fontSize="40"
        >
          Yoga
        </text>
      </svg>
    </div>
  );
}
