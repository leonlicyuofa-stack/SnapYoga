
import type { SVGProps } from 'react';

export function StressReliefIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        {/* Shadow */}
        <ellipse cx="50" cy="90" rx="25" ry="4" fill="rgba(0,0,0,0.1)" />

        {/* Body */}
        <path 
          d="M78.5,85.5 C92.5,75.5 95.5,50.5 85.5,35.5 C75.5,20.5 55.5,15.5 40.5,25.5 C25.5,35.5 14.5,55.5 25.5,70.5 C36.5,85.5 64.5,95.5 78.5,85.5Z" 
          fill="#FDE68A" // A nice yellow color
          stroke="#27272A" // A soft black for the outline
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Blushes */}
        <circle cx="38" cy="50" r="7" fill="#FCA5A5" opacity="0.6"/>
        <circle cx="62" cy="50" r="7" fill="#FCA5A5" opacity="0.6"/>

        {/* Face */}
        <circle cx="45" cy="48" r="2" fill="#27272A" />
        <circle cx="55" cy="48" r="2" fill="#27272A" />
        <path d="M 49,55 Q 52.5,59 56,55" stroke="#27272A" strokeWidth="2" strokeLinecap="round" fill="none"/>

      </g>
    </svg>
  );
}
