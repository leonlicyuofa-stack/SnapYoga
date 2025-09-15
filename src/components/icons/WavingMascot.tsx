
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
        
        {/* Waving Arm */}
        <path d="M55 95 C 45 85, 40 70, 50 60" fill="none" stroke="#FFB6C1" strokeWidth="12" strokeLinecap="round" />
      </g>
    </svg>
  );
}
