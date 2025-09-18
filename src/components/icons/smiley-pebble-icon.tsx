
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function SmileyPebbleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <path 
            d="M 20,65 C 10,50 20,30 50,30 C 80,30 90,50 80,65 C 70,80 30,80 20,65 Z" 
            fill="#D1CFCB"
            stroke="#A3A3A3"
            strokeWidth="1.5"
        />

        {/* Left Foot */}
        <g transform="rotate(-15 40 80)">
          <ellipse cx="35" cy="85" rx="12" ry="8" fill="#5A5A5A" stroke="#404040" strokeWidth="1" />
          <path d="M 27 82 L 28 88 M 31 81 L 32 89 M 35 81 L 36 89 M 39 81 L 40 89 M 43 82 L 44 88" stroke="#4A4A4A" strokeWidth="0.8" strokeLinecap="round" />
        </g>
        
        {/* Right Foot */}
        <g transform="rotate(15 60 80)">
          <ellipse cx="65" cy="85" rx="12" ry="8" fill="#5A5A5A" stroke="#404040" strokeWidth="1" />
           <path d="M 57 82 L 58 88 M 61 81 L 62 89 M 65 81 L 66 89 M 69 81 L 70 89 M 73 82 L 74 88" stroke="#4A4A4A" strokeWidth="0.8" strokeLinecap="round" />
        </g>
        
        <circle cx="45" cy="50" r="3" fill="black" />
        <circle cx="55" cy="50" r="3" fill="black" />
        <path d="M 48,58 C 50,62 53,62 55,58" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
