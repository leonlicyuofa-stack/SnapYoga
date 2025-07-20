
import type { SVGProps } from 'react';

export function BunnyMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Bunny Mascot</title>

        {/* Bush */}
        <path d="M 50,150 C -20,150 0,80 60,90 C 120,100 170,150 100,150 Z" fill="#A8D5BA" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 70,150 C 20,150 40,90 90,100 C 140,110 150,150 120,150 Z" fill="#88C0A4" stroke="currentColor" strokeWidth="1.5" />

        {/* Bunny Character */}
        <g transform="translate(40, 20) rotate(-10 50 50)">
          {/* Bunny Hood */}
          <path d="M 50,30 C 20,30 15,60 25,80 C 35,100 65,100 75,80 C 85,60 80,30 50,30 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Bunny Ears */}
          <path d="M 35,10 C 25,-10 40,-15 45,10 C 50,35 45,30 35,10 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 65,10 C 75,-10 60,-15 55,10 C 50,35 55,30 65,10 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 38,15 C 35,5 40,2 43,15 C 46,28 42,25 38,15 Z" fill="#FFD1DC" />

          {/* Chick Face */}
          <circle cx="50" cy="65" r="20" fill="#FFD966" />
          <ellipse cx="45" cy="62" rx="3" ry="4" fill="#2C3E50" />
          <ellipse cx="55" cy="62" rx="3" ry="4" fill="#2C3E50" />
          <path d="M 48,70 L 52,70 L 50,75 Z" fill="#F4A261" />

          {/* Chick Hair */}
          <path d="M 50,45 Q 45,40 48,45" stroke="#F4A261" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 50,45 Q 55,40 52,45" stroke="#F4A261" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Blush */}
          <circle cx="40" cy="70" r="4" fill="#FFC0CB" opacity="0.7" />
          <circle cx="60" cy="70" r="4" fill="#FFC0CB" opacity="0.7" />

          {/* Wing */}
          <path d="M 72,70 C 85,65 90,80 80,85 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" transform="rotate(15 72 70)" />
        </g>
      </g>
    </svg>
  );
}

    