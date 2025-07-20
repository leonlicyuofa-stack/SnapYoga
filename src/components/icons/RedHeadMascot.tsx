import type { SVGProps } from 'react';

export function RedHeadMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Red-Haired Mascot</title>
        
        {/* Head */}
        <circle cx="60" cy="70" r="40" fill="#FEEAE6" />
        
        {/* Hair */}
        <path d="M 30,70 Q 60,30 90,70 A 40,40 0 0,1 30,70 Z" fill="#FF6B6B" />
        
        {/* Eyes */}
        <circle cx="50" cy="70" r="5" fill="#2C3E50" />
        <circle cx="70" cy="70" r="5" fill="#2C3E50" />
        
        {/* Smile */}
        <path d="M 55,85 Q 60,95 65,85" stroke="#2C3E50" fill="none" strokeWidth="2" strokeLinecap="round" />
        
        {/* Blush */}
        <circle cx="40" cy="80" r="7" fill="#FFC0CB" opacity="0.6" />
        <circle cx="80" cy="80" r="7" fill="#FFC0CB" opacity="0.6" />
      </g>
    </svg>
  );
}
