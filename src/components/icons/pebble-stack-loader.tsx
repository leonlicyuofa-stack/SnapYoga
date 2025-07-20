
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function PebbleStackLoader() {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // This should match the total duration of the staggered animations
    const totalAnimationTime = 1500; // e.g., (duration/4 * 3) + (stagger * 2)
    const timer = setTimeout(() => {
      setIsFinished(true);
    }, totalAnimationTime);

    return () => clearTimeout(timer);
  }, []);

  return (
    <svg 
      viewBox="0 0 100 100"
      className={cn("w-auto h-full pebble-stack-loader", isFinished && "finished")}
    >
      <title>Animated Pebble Stack Mascot</title>
      <g id="stack" transform="translate(10, 5)">
        {/* Bottom Pebble */}
        <g id="pebble-bottom">
            <path
            d="M 20,80 C 5,70 5,50 25,45 C 45,40 65,45 75,60 C 85,75 65,90 45,85 C 25,90 25,85 20,80 Z"
            fill="hsl(var(--splash-blob-4))"
            stroke="hsl(var(--splash-foreground))"
            strokeWidth="0.5"
            />
            <circle cx="38" cy="68" r="3" fill="hsl(var(--splash-foreground))" />
            <circle cx="58" cy="68" r="3" fill="hsl(var(--splash-foreground))" />
        </g>
        
        {/* Middle Pebble */}
        <path
          id="pebble-middle"
          d="M 22,50 C 10,45 15,25 30,22 C 45,19 60,28 65,38 C 70,48 55,58 40,55 C 25,58 28,52 22,50 Z"
          fill="hsl(var(--splash-blob-5))"
          stroke="hsl(var(--splash-foreground))"
          strokeWidth="0.5"
        />
        
        {/* Top Pebble */}
        <path
          id="pebble-top"
          d="M 30,25 C 20,22 25,10 35,8 C 45,6 55,12 58,20 C 61,28 50,32 40,29 C 30,32 35,27 30,25 Z"
          fill="hsl(var(--splash-blob-6))"
          stroke="hsl(var(--splash-foreground))"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
}
