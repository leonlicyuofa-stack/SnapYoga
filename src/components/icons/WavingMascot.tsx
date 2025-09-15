
import type { SVGProps } from 'react';

export function WavingMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Waving Mascot</title>
        {/* Body */}
        <circle cx="105" cy="95" r="50" fill="#FFB6C1" />

        {/* Glasses */}
        <g stroke="white" strokeWidth="3" fill="none">
          <circle cx="85" cy="70" r="12" />
          <circle cx="120" cy="70" r="12" />
          <line x1="97" y1="70" x2="108" y2="70" />
        </g>
        
        {/* Eyes */}
        <circle cx="85" cy="70" r="2" fill="black" />
        <circle cx="120" cy="70" r="2" fill="black" />

        {/* Smile */}
        <path d="M 98 85 Q 102 90 106 85" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Namaste Hands */}
        <g stroke="black" strokeWidth="2" fill="#FFD1DC" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 100 95 C 95 105, 95 115, 100 120 L 105 105 Z" />
            <path d="M 110 95 C 115 105, 115 115, 110 120 L 105 105 Z" />
        </g>
        

      </g>
    </svg>
  );
}
