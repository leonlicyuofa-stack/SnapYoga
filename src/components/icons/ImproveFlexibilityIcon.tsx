
import type { SVGProps } from 'react';

export function ImproveFlexibilityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        {/* Sparkles */}
        <path d="M75 15 L 78 12 L 81 15 L 78 18 Z" fill="#FDE047" />
        <path d="M25 25 L 28 22 L 31 25 L 28 28 Z" fill="#C4B5FD" />
        <path d="M85 30 L 87 28 L 89 30 L 87 32 Z" fill="#C4B5FD" />
        <path d="M20 45 L 22 43 L 24 45 L 22 47 Z" fill="#FDE047" />
        <path d="M30 15 Q 50 10, 70 15" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 25 Q 50 20, 65 25" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />

        {/* Mat */}
        <ellipse cx="50" cy="80" rx="35" ry="8" fill="#6EE7B7" />
        
        {/* Body */}
        <path 
          d="M78.5,75.5 C92.5,65.5 90.5,40.5 75.5,30.5 C60.5,20.5 40.5,25.5 30.5,40.5 C20.5,55.5 31.5,75.5 45.5,78.5 C59.5,81.5 64.5,85.5 78.5,75.5Z" 
          fill="#FDE68A"
          stroke="#27272A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Blush */}
        <circle cx="48" cy="58" r="7" fill="#FCA5A5" opacity="0.8"/>
        
        {/* Face */}
        <path d="M48 50 C 47 49, 46 50, 45 50" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
        <path d="M55 52 C 54 51, 53 52, 52 52" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
        <path d="M48,60 Q 51.5,62 55,59" stroke="#27272A" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Arm */}
        <path d="M 60 68 C 50 72, 45 65, 48 60" stroke="#27272A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
