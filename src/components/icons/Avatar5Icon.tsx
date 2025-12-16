
import type { SVGProps } from 'react';

export function Avatar5Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar with wobbly eyes</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <path d="M 20,60 C 10,40 25,25 50,25 C 75,25 90,40 80,60 C 90,80 70,95 50,95 C 30,95 10,80 20,60 Z" fill="transparent" />

        {/* Eyes */}
        <g>
          {/* Left Eye */}
          <circle cx="38" cy="48" r="14" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
          <circle cx="38" cy="48" r="6" fill="#000000" />
          <path d="M 28,64 Q 38,68 48,64" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 26,70 Q 38,74 50,70" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Right Eye */}
          <circle cx="72" cy="48" r="14" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
          <circle cx="72" cy="48" r="6" fill="#000000" />
          <path d="M 62,64 Q 72,68 82,64" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 60,70 Q 72,74 84,70" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
        
        {/* Mouth */}
        <path d="M 50,82 C 46,82 45,86 50,86 C 55,86 54,82 50,82 Z" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinejoin="round" />

      </g>
    </svg>
  );
}
