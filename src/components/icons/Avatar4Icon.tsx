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
          <circle cx="38" cy="45" r="14" fill="#FFFFFF" stroke="#8B5742" strokeWidth="2.5"/>
          <circle cx="45" cy="45" r="9" fill="#2E4A8D" />

          {/* Right Eye */}
          <circle cx="68" cy="45" r="14" fill="#FFFFFF" stroke="#8B5742" strokeWidth="2.5"/>
          <circle cx="75" cy="45" r="9" fill="#2E4A8D" />
        </g>
        
        {/* Mouth and Fangs */}
        <g>
          {/* Mouth */}
          <ellipse cx="53" cy="62" rx="7" ry="4" fill="#D9534F" stroke="#B54440" strokeWidth="1"/>
          
          {/* Fangs line */}
          <path d="M 38 72 L 68 72" stroke="#8B5742" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          
          {/* Fangs */}
          <path d="M 42 72 L 46 78 L 50 72 Z" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="1" />
          <path d="M 58 72 L 62 78 L 66 72 Z" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="1" />
        </g>
        
        {/* Cheek */}
        <path d="M 70 70 C 75 75, 75 80, 70 85" stroke="#8B5742" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      </g>
    </svg>
  );
}
