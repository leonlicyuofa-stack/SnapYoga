
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Lavishly_Yours as LavishlyYours } from 'next/font/google';

const lavishlyYours = LavishlyYours({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-lavishly-yours',
});

export function PebbleStackLoader() {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const animationDuration = 4000; // Corresponds to --duration in CSS
    const timer = setTimeout(() => {
      setIsFinished(true);
    }, animationDuration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <svg 
      viewBox="0 0 200 120"
      className={cn("w-auto h-full pebble-stack-loader", isFinished && "finished", lavishlyYours.variable)}
    >
      <title>Pebble Stack Mascot</title>
      <g id="stack" transform="translate(80, 20)">
        {/* Bottom Pebble */}
        <path
          id="pebble-bottom"
          d="M 20,80 C 5,70 5,50 25,45 C 45,40 65,45 75,60 C 85,75 65,90 45,85 C 25,90 25,85 20,80 Z"
          fill="hsl(var(--splash-blob-1))"
          stroke="hsl(var(--splash-foreground))"
          strokeWidth="0.5"
        />

        {/* Middle Pebble */}
        <path
          id="pebble-middle"
          d="M 22,50 C 10,45 15,25 30,22 C 45,19 60,28 65,38 C 70,48 55,58 40,55 C 25,58 28,52 22,50 Z"
          fill="hsl(var(--splash-blob-2))"
          stroke="hsl(var(--splash-foreground))"
          strokeWidth="0.5"
        />
        
        {/* Top Pebble Group */}
        <g id="pebble-top-group">
            <path
            id="pebble-top"
            d="M 30,25 C 20,22 25,10 35,8 C 45,6 55,12 58,20 C 61,28 50,32 40,29 C 30,32 35,27 30,25 Z"
            fill="hsl(var(--splash-blob-3))"
            stroke="hsl(var(--splash-foreground))"
            strokeWidth="0.5"
            />
            {/* Waving Arm */}
            <g id="waving-arm-group">
                <path d="M 58,20 Q 68,15 75,22" stroke="hsl(var(--splash-foreground))" strokeWidth="0.75" fill="none" strokeLinecap="round" />
            </g>
            {/* Face */}
            <g id="smiley-face">
                <circle cx="38" cy="18" r="1" fill="hsl(var(--splash-foreground))" />
                <circle cx="48" cy="18" r="1" fill="hsl(var(--splash-foreground))" />
                <path d="M 40,22 Q 43,26 46,22" stroke="hsl(var(--splash-foreground))" strokeWidth="0.75" fill="none" strokeLinecap="round" />
            </g>
        </g>
      </g>
      
      {/* "Welcome!" Text */}
      <text
        id="logo-text"
        x="125" 
        y="35"
        className={cn("text-2xl fill-current text-splash-foreground")}
        style={{ fontFamily: 'var(--font-lavishly-yours)' }}
        textAnchor="start"
      >
        Welcome!
      </text>
    </svg>
  );
}
