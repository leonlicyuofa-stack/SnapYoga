
import type { SVGProps } from 'react';

export function Avatar5Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar with a wide toothy grin</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <path d="M 20,60 C 10,40 25,25 50,25 C 75,25 90,40 80,60 C 90,80 70,95 50,95 C 30,95 10,80 20,60 Z" fill="transparent" />

        {/* Eyes */}
        <circle cx="42" cy="50" r="4" fill="#000000" />
        <circle cx="58" cy="50" r="4" fill="#000000" />
        
        {/* Mouth with Teeth */}
        <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Mouth outline and fill */}
            <path d="M 30,65 C 35,85 65,85 70,65 Z" fill="#FFFFFF" />

            {/* Teeth */}
            <path d="M 40 65 L 40 78" />
            <path d="M 50 65 L 50 80" />
            <path d="M 60 65 L 60 78" />
        </g>
      </g>
    </svg>
  );
}
