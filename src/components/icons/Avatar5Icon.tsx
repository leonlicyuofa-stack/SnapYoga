
import type { SVGProps } from 'react';

export function Avatar5Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of No-Face</title>
        
        {/* Main black body shape */}
        <path d="M 20,100 C 10,80 10,40 25,25 C 40,10 60,10 75,25 C 90,40 90,80 80,100 Z" fill="#202020" />
        
        {/* White face mask */}
        <path 
            d="M 50,22 C 70,22 82,40 82,60 C 82,80 70,95 50,95 C 30,95 18,80 18,60 C 18,40 30,22 50,22 Z"
            fill="#FDFDFD"
        />

        {/* Facial features */}
        <g fill="#202020">
            {/* Main eyes */}
            <ellipse cx="45" cy="45" rx="3.5" ry="6" />
            <ellipse cx="65" cy="45" rx="3.5" ry="6" />
            
            {/* Dots under eyes */}
            <circle cx="50" cy="58" r="3" />
            <circle cx="68" cy="62" r="3" />
        </g>

        {/* Blush */}
        <g fill="#F26D50">
            <circle cx="35" cy="68" r="10" />
            <circle cx="78" cy="72" r="10" />
        </g>
        
        {/* Mouth */}
        <path d="M 58,82 Q 62,85 66,82" stroke="#202020" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
      </g>
    </svg>
  );
}
