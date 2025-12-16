
import type { SVGProps } from 'react';

export function Avatar3Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a cute watermelon</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <circle cx="50" cy="50" r="40" fill="transparent" />
        
        {/* Watermelon Flesh */}
        <circle cx="50" cy="50" r="40" fill="#F472B6" />
        
        {/* Watermelon Rind */}
        <circle cx="50" cy="50" r="38" stroke="#84CC16" strokeWidth="12" />
        
        {/* Seeds and Face */}
        <g fill="black">
          {/* Eyes */}
          <circle cx="38" cy="48" r="5" />
          <circle cx="62" cy="48" r="5" />

          {/* Smile */}
          <path d="M 48 60 C 50 65, 55 65, 57 60" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Seeds as freckles */}
           <path d="M 30,60 a 1.5,2.5 0 1,1 0,0.1" />
           <path d="M 70,60 a 1.5,2.5 0 1,1 0,0.1" />
           <path d="M 45,70 a 1.5,2.5 0 1,1 0,0.1" />
           <path d="M 55,70 a 1.5,2.5 0 1,1 0,0.1" />

        </g>
      </g>
    </svg>
  );
}
