
import type { SVGProps } from 'react';

export function YogaPoseIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="hsl(var(--foreground))" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <circle cx="100" cy="40" r="15" />
        
        {/* Torso */}
        <path d="M 100 55 V 100" />
        
        {/* Arms */}
        <path d="M 100 70 L 150 50" />
        <path d="M 100 70 L 50 50" />

        {/* Legs */}
        <path d="M 100 100 L 130 150" />
        <path d="M 100 100 L 70 150" />

        {/* Feet */}
        <path d="M 130 150 L 140 145" />
        <path d="M 70 150 L 60 145" />
      </g>
    </svg>
  );
}
