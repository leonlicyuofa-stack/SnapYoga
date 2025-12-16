
import type { SVGProps } from 'react';

export function Avatar4Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a cute brown monster</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <path d="M 20,60 C 10,40 25,25 50,25 C 75,25 90,40 80,60 C 90,80 70,95 50,95 C 30,95 10,80 20,60 Z" fill="transparent" />

        {/* Eyes */}
        <g>
          {/* Left Eye */}
          <circle cx="35" cy="48" r="14" fill="#FFFFFF" stroke="#8B5742" strokeWidth="2.5"/>
          <circle cx="42" cy="48" r="9" fill="#2E4A8D" />

          {/* Right Eye */}
          <circle cx="65" cy="48" r="14" fill="#FFFFFF" stroke="#8B5742" strokeWidth="2.5"/>
          <circle cx="72" cy="48" r="9" fill="#2E4A8D" />
        </g>
        
        {/* Mouth and Fangs */}
        <g>
          {/* Mouth */}
          <ellipse cx="50" cy="65" rx="7" ry="4" fill="#D9534F" stroke="#B54440" strokeWidth="1"/>
          
          {/* Fangs line */}
          <path d="M 35 75 L 65 75" stroke="#8B5742" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          
          {/* Fangs */}
          <path d="M 39 75 L 43 81 L 47 75 Z" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="1" />
          <path d="M 55 75 L 59 81 L 63 75 Z" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="1" />
        </g>
        
        {/* Cheek */}
        <path d="M 67 73 C 72 78, 72 83, 67 88" stroke="#8B5742" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      </g>
    </svg>
  );
}
