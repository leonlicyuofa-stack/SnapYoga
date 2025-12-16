
import type { SVGProps } from 'react';

export function Avatar3Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a cute blue blob</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <path d="M 20,60 C 10,40 25,25 50,25 C 75,25 90,40 80,60 C 90,80 70,95 50,95 C 30,95 10,80 20,60 Z" fill="transparent" />

        {/* Eyes */}
        <circle cx="38" cy="48" r="5" fill="#000000" />
        <circle cx="62" cy="48" r="5" fill="#000000" />
        
        {/* Blush */}
        <ellipse cx="28" cy="55" rx="4" ry="2" fill="#FFC0CB" opacity="0.8" />
        <ellipse cx="72" cy="55" rx="4" ry="2" fill="#FFC0CB" opacity="0.8" />

        {/* Mouth */}
        <path d="M 35,65 Q 50,70 65,65" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      </g>
    </svg>
  );
}
