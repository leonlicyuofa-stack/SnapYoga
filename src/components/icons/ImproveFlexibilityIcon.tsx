
import type { SVGProps } from 'react';

export function ImproveFlexibilityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        {/* Main Body */}
        <path 
          d="M62.5,90.5 C60.5,95.5 40.5,95.5 38.5,90.5 C35.5,85.5 42.5,70.5 42.5,60.5 C42.5,45.5 35.5,35.5 45.5,25.5 C52.5,18.5 60.5,20.5 65.5,30.5 C72.5,45.5 70.5,50.5 65.5,60.5 C60.5,70.5 70.5,80.5 62.5,90.5Z"
          fill="#FDE68A"
          stroke="#27272A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Blushes */}
        <circle cx="50" cy="45" r="7" fill="#FCA5A5" opacity="0.6"/>
        <circle cx="65" cy="45" r="7" fill="#FCA5A5" opacity="0.6"/>

        {/* Face */}
        <circle cx="53" cy="43" r="2" fill="#27272A" />
        <circle cx="62" cy="43" r="2" fill="#27272A" />
        <path d="M 56,50 Q 58.5,54 61,50" stroke="#27272A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}
