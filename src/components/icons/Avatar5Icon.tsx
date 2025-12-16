
import type { SVGProps } from 'react';

export function Avatar5Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a cute purple monster</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <path 
          d="M 20,80 C 10,60 20,30 50,30 C 80,30 90,60 80,80 C 70,100 30,100 20,80 Z"
          fill="transparent" 
        />
        
        {/* Face */}
        <g>
          {/* Eyes */}
          <circle cx="45" cy="48" r="3" fill="black" />
          <circle cx="55" cy="48" r="3" fill="black" />
          {/* Mouth */}
          <path d="M 35,55 C 35,65 65,65 65,55" stroke="black" strokeWidth="3" fill="none" />
          {/* Teeth */}
          <g fill="white" stroke="black" strokeWidth="1">
            <path d="M 40,55.5 V 61.5 H 45 V 55.5 Z" />
            <path d="M 47.5,55.5 V 62 H 52.5 V 55.5 Z" />
            <path d="M 55,55.5 V 61.5 H 60 V 55.5 Z" />
          </g>
        </g>
        
        {/* Spikes on Head */}
        <g fill="transparent" stroke="black" strokeWidth="0">
           <path d="M 40,31 L 45,26 L 50,31" strokeLinecap="round" strokeLinejoin="round" />
           <path d="M 50,31 L 55,26 L 60,31" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        
        {/* Arms */}
        <g stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 30,65 C 25,60 25,70 30,75" />
            <path d="M 70,65 C 75,60 75,70 70,75" />
        </g>

        {/* Feet */}
        <g stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 35,85 C 30,95 45,95 40,85" />
            <path d="M 65,85 C 60,95 75,95 70,85" />
        </g>
      </g>
    </svg>
  );
}
