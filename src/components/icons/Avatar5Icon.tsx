
import type { SVGProps } from 'react';

export function Avatar5Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a rosy-cheeked face</title>
        
        {/* Main face shape */}
        <path 
            d="M 50,22 C 70,22 82,40 82,60 C 82,80 70,95 50,95 C 30,95 18,80 18,60 C 18,40 30,22 50,22 Z"
            fill="#FDFDFD"
        />

        {/* Cheeks */}
        <g fill="#F26D50">
            <circle cx="35" cy="68" r="15" />
            <circle cx="78" cy="68" r="15" />
        </g>

        {/* Eyes */}
        <g fill="#202020">
            <circle cx="45" cy="50" r="3.5" />
            <circle cx="65" cy="50" r="3.5" />
        </g>
        
        {/* Mouth */}
        <path d="M 53,82 Q 55,85 57,82" stroke="#202020" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
      </g>
    </svg>
  );
}
