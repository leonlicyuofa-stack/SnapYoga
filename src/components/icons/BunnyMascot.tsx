
import type { SVGProps } from 'react';

export function BunnyMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="translate(10, 10)">
        <title>Bunny Mascot</title>

        {/* Body */}
        <path d="M 65,120 C 35,125 20,90 40,70 C 60,50 90,50 110,70 C 130,90 115,125 85,120 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />

        {/* Head */}
        <path d="M 75,40 C 50,40 45,60 55,80 C 65,100 85,100 95,80 C 105,60 100,40 75,40 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />
        
        {/* Ears */}
        <path d="M 65,20 C 55,0 70,-5 75,20 C 80,45 75,40 65,20 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 85,20 C 95,0 80,-5 75,20 C 70,45 75,40 85,20 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 68,25 C 65,15 70,12 73,25 C 76,38 72,35 68,25 Z" fill="#FFD1DC" />

        {/* Face */}
        <ellipse cx="70" cy="72" rx="3" ry="4" fill="#2C3E50" />
        <ellipse cx="80" cy="72" rx="3" ry="4" fill="#2C3E50" />
        <path d="M 73,78 Q 75,81 77,78" stroke="#F4A261" fill="none" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Blush */}
        <circle cx="63" cy="78" r="4" fill="#FFC0CB" opacity="0.7" />
        <circle cx="87" cy="78" r="4" fill="#FFC0CB" opacity="0.7" />
        
        {/* Paws/Arms */}
        <path d="M 50,90 C 40,95 40,105 50,105 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 100,90 C 110,95 110,105 100,105 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" />

      </g>
    </svg>
  );
}
