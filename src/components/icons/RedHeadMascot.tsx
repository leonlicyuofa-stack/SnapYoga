
import type { SVGProps } from 'react';

export function RedHeadMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Red-haired Snowman Mascot</title>

        {/* Snowman Body */}
        <circle cx="70" cy="115" r="45" fill="#F0F8FF" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="70" cy="55" r="35" fill="#F0F8FF" stroke="currentColor" strokeWidth="1.5" />

        {/* Head */}
        <circle cx="70" cy="55" r="35" fill="transparent" /> 

        {/* Hair */}
        <g fill="#E63946">
            <circle cx="48" cy="30" r="15"/>
            <circle cx="70" cy="25" r="18"/>
            <circle cx="92" cy="30" r="15"/>
        </g>
        
        {/* Face */}
        <ellipse cx="60" cy="50" rx="4" ry="5" fill="#2C3E50" />
        <ellipse cx="80" cy="50" rx="4" ry="5" fill="#2C3E50" />
        <path d="M 68,60 Q 70,63 72,60" stroke="#2C3E50" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Blush */}
        <circle cx="50" cy="57" r="5" fill="#FFC0CB" opacity="0.6" />
        <circle cx="90" cy="57" r="5" fill="#FFC0CB" opacity="0.6" />

         {/* Buttons */}
        <circle cx="70" cy="95" r="5" fill="#2C3E50" />
        <circle cx="70" cy="115" r="5" fill="#2C3E50" />
        <circle cx="70" cy="135" r="5" fill="#2C3E50" />
      </g>
    </svg>
  );
}
