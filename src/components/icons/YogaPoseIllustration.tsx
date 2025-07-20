import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function YogaPoseIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 300 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="yogaPoseTitle"
      {...props}
    >
      <title id="yogaPoseTitle">Illustration of a person in a yoga pose</title>
      <defs>
        <filter id="grainy" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComposite operator="in" in2="SourceGraphic"/>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      
      {/* Apply grainy filter to a rectangle behind everything */}
      <rect width="100%" height="100%" fill="hsl(var(--splash-blob-2))" opacity="0.3" filter="url(#grainy)" />

      <g transform="translate(10, 10)">
        {/* Person's Body */}
        <path 
          d="M 100,160 
             L 110,90 
             C 115,70 140,60 160,70 
             L 240,100 
             C 260,105 270,120 265,135 
             L 250,170 Z"
          fill="hsl(var(--splash-background))"
          stroke="hsl(var(--splash-foreground))"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Person's Leggings */}
        <path 
          d="M 100,160 
             L 110,90 
             C 112,80 125,75 135,80 
             L 140,82 
             C 145,85 140,100 135,110 
             L 115,165 Z"
          fill="hsl(var(--splash-foreground))"
          stroke="hsl(var(--splash-foreground))"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Head and Hair */}
        <circle cx="260" cy="138" r="15" fill="hsl(var(--splash-background))" stroke="hsl(var(--splash-foreground))" strokeWidth="2" />
        <path d="M 255,123 
                 C 240,115 245,100 260,105 
                 C 275,100 280,115 265,123 Z" fill="hsl(var(--splash-foreground))" />
        
        {/* Supporting Leg and Arm */}
        <path 
          d="M 100,160 
             C 80,165 70,180 75,190 
             L 20,195 
             C 10,195 5,185 10,175 
             L 60,120 
             C 70,110 90,120 95,130 Z"
          fill="hsl(var(--splash-background))"
          stroke="hsl(var(--splash-foreground))"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Floor Line */}
        <line x1="10" y1="195" x2="280" y2="195" stroke="hsl(var(--splash-foreground))" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
