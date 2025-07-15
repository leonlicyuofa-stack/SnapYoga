
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SmileyRockLoaderProps {
  className?: string;
  text?: string;
}

export function SmileyRockLoader({ className, text }: SmileyRockLoaderProps) {
  const [isFinished, setIsFinished] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const animationDuration = 4000; 
    const finishTimer = setTimeout(() => {
      setIsFinished(true);
    }, animationDuration - 1000); 

    const textTimer = setTimeout(() => {
        setShowText(true);
    }, animationDuration - 500);

    return () => {
        clearTimeout(finishTimer);
        clearTimeout(textTimer);
    };
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 120"
        className={cn("pebble-stack-loader", isFinished && "finished")}
      >
        <title>Pebble Stacking Animation</title>
        <g id="stack" transform="translate(10, 10)">
          <path 
            id="pebble-bottom" 
            d="M 10,95 C -10,80 10,65 40,65 C 70,65 90,80 70,95 Z" 
            fill="#B2DFDB"
          />
          <path 
            id="pebble-middle" 
            d="M 18,70 C 8,60 20,45 40,45 C 60,45 72,60 62,70 Z" 
            fill="#FFCCBC"
          />
          <g id="pebble-top">
            <path 
              d="M 25,50 C 18,42 28,30 40,30 C 52,30 62,42 55,50 Z" 
              fill="#F8BBD0"
            />
            <g id="smiley-face" transform="translate(0, 1)">
              <circle cx="35" cy="40" r="1.5" fill="#4E342E" />
              <circle cx="45" cy="40" r="1.5" fill="#4E342E" />
              <path d="M 36,46 Q 40,49 44,46" stroke="#4E342E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          </g>
           <g id="waving-arm-group">
                <path id="waving-arm" d="M55,45 C 65,40 75,50 70,55" fill="#F8BBD0" />
                <text id="wave-text" x="80" y="45" textAnchor="start" fill="#4E342E" fontSize="12" fontWeight="bold">SnapYoga</text>
            </g>
        </g>
      </svg>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
