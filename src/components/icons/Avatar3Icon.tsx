
import type { SVGProps } from 'react';

export function Avatar3Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a cute whale</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <path d="M 0,100 H 100 V 50 C 100,80 80,100 50,100 C 20,100 0,80 0,50 Z" fill="transparent" />

        {/* Eyes */}
        <circle cx="38" cy="68" r="5" fill="#000000" />
        <circle cx="62" cy="68" r="5" fill="#000000" />
        
        {/* Blush */}
        <ellipse cx="32" cy="75" rx="3" ry="2" fill="#FFC0CB" opacity="0.8" />
        <ellipse cx="68" cy="75" rx="3" ry="2" fill="#FFC0CB" opacity="0.8" />

        {/* Mouth */}
        <path d="M 32,78 Q 50,85 68,78" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Water Spout */}
        <path d="M 48,50 C 45,40 55,40 52,50" stroke="#87CEEB" strokeWidth="2.5" strokeDasharray="1 3" fill="none" strokeLinecap="round" />
        <path d="M 49,38 L 53,34 L 51,30 L 49,34 Z" fill="#FF7F7F" />
        <path d="M 49,38 C 47,32 53,32 51,38" fill="#FF7F7F" stroke="#FF7F7F" strokeWidth="1" strokeLinecap="round" />

      </g>
    </svg>
  );
}
