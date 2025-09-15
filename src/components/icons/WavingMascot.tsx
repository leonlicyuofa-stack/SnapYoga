
import type { SVGProps } from 'react';

export function WavingMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Waving Mascot</title>
        {/* Body */}
        <circle cx="105" cy="95" r="50" fill="#FFB6C1" />

        {/* New Smiley Face */}
        <g stroke="black" strokeWidth="2" fill="none" strokeLinecap="round">
            {/* Eyes */}
            <path d="M90 70 q 5 8 10 0" />
            <path d="M110 70 q 5 8 10 0" />
            {/* Smile */}
            <path d="M100 85 q 5 5 10 0" />
        </g>

        {/* Namaste Hands */}
        <g stroke="black" strokeWidth="2" fill="#FFD1DC" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 100 95 C 95 105, 95 115, 100 120 L 105 105 Z" />
            <path d="M 110 95 C 115 105, 115 115, 110 120 L 105 105 Z" />
        </g>
        

      </g>
    </svg>
  );
}
