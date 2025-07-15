
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SmileyRockLoaderProps {
  className?: string;
  text?: string;
}

export function SmileyRockLoader({ className, text }: SmileyRockLoaderProps) {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const animationDuration = 4000; // Based on the --duration in CSS
    const timer = setTimeout(() => {
      setIsFinished(true);
    }, animationDuration - 1000); // Start wave/breath animation slightly before the end

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <svg
        width="80"
        height="100"
        viewBox="0 0 80 100"
        className={cn("pebble-stack-loader", isFinished && "finished")}
      >
        <title>Pebble Stacking Animation</title>
        <g id="stack">
          {/* Largest pebble at the bottom */}
          <path 
            id="pebble-bottom" 
            d="M 10,95 C -10,80 10,65 40,65 C 70,65 90,80 70,95 Z" 
            fill="#D2B48C" 
            stroke="#3a2e20" 
            strokeWidth="2" 
          />
          {/* Middle pebble */}
          <path 
            id="pebble-middle" 
            d="M 18,70 C 8,60 20,45 40,45 C 60,45 72,60 62,70 Z" 
            fill="#B0B0B0" 
            stroke="#3a2e20" 
            strokeWidth="2" 
          />
          {/* Top pebble with smiley face */}
          <g id="pebble-top">
            <path 
              d="M 25,50 C 18,42 28,30 40,30 C 52,30 62,42 55,50 Z" 
              fill="#E0E0E0" 
              stroke="#3a2e20" 
              strokeWidth="2" 
            />
            <g id="smiley-face" transform="translate(0, 1)">
              <circle cx="35" cy="40" r="1.5" fill="#3a2e20" />
              <circle cx="45" cy="40" r="1.5" fill="#3a2e20" />
              <path d="M 36,46 Q 40,49 44,46" stroke="#3a2e20" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </svg>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
