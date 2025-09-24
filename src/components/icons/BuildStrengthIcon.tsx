import type { SVGProps } from 'react';

export function BuildStrengthIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* Head and Body */}
        <circle cx="50" cy="40" r="10" />
        <path d="M50 50 v 25" />
        
        {/* Barbell */}
        <path d="M20 55 H 80" />
        <rect x="15" y="50" width="10" height="10" rx="2" />
        <rect x="75" y="50" width="10" height="10" rx="2" />

        {/* Arms */}
        <path d="M50 60 L 35 55" />
        <path d="M50 60 L 65 55" />

        {/* Legs */}
        <path d="M50 75 L 35 90" />
        <path d="M50 75 L 65 90" />

      </g>
    </svg>
  );
}
