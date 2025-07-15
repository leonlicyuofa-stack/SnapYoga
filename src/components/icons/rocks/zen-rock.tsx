"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface ZenRockProps extends SVGProps<SVGSVGElement> {
  progress: number;
  isSuccess: boolean;
}

export function ZenRock({ progress, isSuccess, className, ...props }: ZenRockProps) {
  const isAwake = progress >= 100;

  return (
    <svg 
      width="150" 
      height="120" 
      viewBox="0 0 150 120" 
      className={cn("mx-auto", className)}
      {...props}
    >
      <title>Zen Rock Mascot</title>
      <g className="animate-rock-float">
        {/* Shadow */}
        <ellipse cx="75" cy="110" rx="30" ry="5" fill="black" opacity="0.1" className="animate-shadow-pulse" />

        {/* Main Rock Body */}
        <path d="M 30,100 C 10,80 20,50 50,45 C 80,40 110,50 120,70 C 130,90 100,110 75,105 C 50,110 40,105 30,100 Z" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        
        {/* Eyes */}
        <g className="transition-opacity duration-700" style={{ opacity: isAwake ? 1 : 0 }}>
            <ellipse cx="65" cy="75" rx="5" ry="7" fill="white" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <circle cx="65" cy="75" r="2" fill="hsl(var(--foreground))" className="animate-eye-sparkle" />
            <ellipse cx="85" cy="75" rx="5" ry="7" fill="white" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <circle cx="85" cy="75" r="2" fill="hsl(var(--foreground))" className="animate-eye-sparkle" style={{ animationDelay: '100ms' }} />
        </g>

        {/* Sleeping Eyes */}
        <g className="transition-opacity duration-700" style={{ opacity: isAwake ? 0 : 1 }}>
            <path d="M 62,78 Q 65,75 68,78" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 82,78 Q 85,75 88,78" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
        
        {/* Mouth */}
        <path d="M 72,88 Q 75,93 78,88" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" className={cn("transition-transform duration-500", isSuccess ? "scale-y-125" : "scale-y-100" )} style={{transformOrigin: "center"}} />

      </g>
    </svg>
  );
}
