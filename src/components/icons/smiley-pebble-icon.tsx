
"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface SmileyPebbleIconProps extends SVGProps<SVGSVGElement> {
  mood: 'happy' | 'neutral' | 'sad';
}

export function SmileyPebbleIcon({ mood = 'happy', className, ...props }: SmileyPebbleIconProps) {
  return (
    <svg 
      width="100" 
      height="100" 
      viewBox="0 0 100 100" 
      className={cn("transition-all duration-300", className)}
      {...props}
    >
      <title>Smiley Pebble</title>
      <circle cx="50" cy="50" r="45" fill="currentColor" />
      
      {/* Eyes */}
      <circle cx="38" cy="45" r="5" fill="black" />
      <circle cx="62" cy="45" r="5" fill="black" />

      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M 35,60 Q 50,75 65,60" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
      {mood === 'neutral' && (
        <line x1="35" y1="65" x2="65" y2="65" stroke="black" strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === 'sad' && (
        <path d="M 35,70 Q 50,55 65,70" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
