
import type { SVGProps } from 'react';

export function PracticeMindfulnessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Person's body */}
        <path d="M35 70 C 25 50, 30 30, 50 30 C 70 30, 75 50, 65 70" fill="hsl(var(--secondary))" stroke="none" />
        
        {/* Head */}
        <path d="M50 25 a 10 10 0 1 0 0.001 0" fill="hsl(var(--secondary))" stroke="none"/>

        {/* Arms and Hands */}
        <path d="M45 45 L 38 55" />
        <path d="M55 45 L 62 55" />
        
        {/* Eyes (closed) */}
        <path d="M46 23 q2 -2 4 0" />
        <path d="M54 23 q-2 -2 -4 0" />

        {/* Legs crossed */}
        <path d="M35 70 C 45 60, 55 60, 65 70" />
        <path d="M38 70 C 45 65, 55 65, 62 70" />

        {/* Cloud */}
        <path d="M20 90 C10 90, 5 80, 20 75 C30 70, 40 70, 50 75 C60 70, 70 70, 80 75 C95 80, 90 90, 80 90 Z" fill="hsl(var(--muted) / 0.7)" stroke="none" />
      </g>
    </svg>
  );
}
