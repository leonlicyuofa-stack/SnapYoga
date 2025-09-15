
import type { SVGProps } from 'react';

export function WavingMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Waving Mascot</title>
        {/* Body */}
        <circle cx="105" cy="95" r="50" fill="#FFB6C1" />

        {/* Waving Arm */}
        <path d="M65 85 C 55 75, 45 85, 55 95" fill="#FFB6C1" stroke="black" strokeWidth="2" strokeLinecap="round" />

        {/* Face */}
        <g stroke="black" strokeWidth="2" fill="black" strokeLinecap="round">
            {/* Eyes */}
            <circle cx="100" cy="75" r="4" />
            <circle cx="120" cy="75" r="4" />
        </g>
      </g>
    </svg>
  );
}
