import type { SVGProps } from 'react';

export function Avatar5Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar with a big smile</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <path d="M 20,60 C 10,40 25,25 50,25 C 75,25 90,40 80,60 C 90,80 70,95 50,95 C 30,95 10,80 20,60 Z" fill="transparent" />

        {/* Eyes */}
        <circle cx="42" cy="48" r="7" fill="#000000" />
        <circle cx="68" cy="48" r="7" fill="#000000" />
        
        {/* Big Smile */}
        <path 
          d="M 28,62 C 25,75 75,75 72,62 C 70,55 30,55 28,62 Z" 
          fill="#FFFFFF" 
          stroke="#000000" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />
        
        {/* Smile lines */}
        <path d="M 32,62 C 35,65 35,65 32,68" stroke="#000000" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 68,62 C 65,65 65,65 68,68" stroke="#000000" fill="none" strokeWidth="2.5" strokeLinecap="round"/>

      </g>
    </svg>
  );
}
