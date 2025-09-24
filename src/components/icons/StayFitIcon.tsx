
import type { SVGProps } from 'react';

export function StayFitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Main cloud body */}
        <path d="M75,40 C85,40 90,50 90,60 C90,70 85,80 75,80 L25,80 C15,80 10,70 10,60 C10,50 15,40 25,40 C25,30 35,25 45,25 C55,25 65,30 75,40 Z" fill="hsl(var(--muted))" stroke="none"/>
        
        {/* Eyes */}
        <path d="M40 55 q5 -5 5 0" />
        <path d="M50 55 q5 -5 5 0" />

        {/* Arms */}
        <path d="M90 60 C 95 55, 100 65, 95 70" />
        <path d="M10 60 C 5 55, 0 65, 5 70" />

        {/* Legs */}
        <path d="M30 80 C 40 90, 60 90, 70 80" />
        <path d="M35 80 C 45 95, 55 95, 65 80" />

        {/* Sparkles */}
        <path d="M15 30 L 25 35 L 15 40 L 5 35 Z" />
        <path d="M85 30 L 95 35 L 85 40 L 75 35 Z" />
      </g>
    </svg>
  );
}
