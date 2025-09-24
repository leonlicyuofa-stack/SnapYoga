import type { SVGProps } from 'react';

export function PracticeMindfulnessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Person */}
        <path d="M35 90 C 25 70, 30 50, 50 50 C 70 50, 75 70, 65 90" fill="hsl(var(--secondary))" stroke="none" />
        <path d="M50 45 a 10 10 0 1 0 0.001 0" fill="hsl(var(--secondary))" stroke="none"/>
        <path d="M45 65 L 55 65" />
        
        {/* Eyes */}
        <path d="M46 43 q2 -2 4 0" />
        <path d="M54 43 q-2 -2 -4 0" />

        {/* Legs */}
        <path d="M35 90 C 45 80, 55 80, 65 90" />
        <path d="M38 90 C 45 85, 55 85, 62 90" />
      </g>
    </svg>
  );
}
