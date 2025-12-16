import type { SVGProps } from 'react';

export function Avatar2Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a cute pig</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <path d="M 20,60 C 10,40 25,25 50,25 C 75,25 90,40 80,60 C 90,80 70,95 50,95 C 30,95 10,80 20,60 Z" fill="transparent" />

        {/* Eyes */}
        <circle cx="38" cy="48" r="8" fill="#000000" />
        <circle cx="62" cy="48" r="8" fill="#000000" />

        {/* Snout */}
        <ellipse cx="50" cy="65" rx="22" ry="15" fill="#F48FB1" stroke="#E91E63" strokeWidth="2" />
        
        {/* Nostrils */}
        <ellipse cx="44" cy="65" rx="4" ry="7" fill="#C2185B" />
        <ellipse cx="56" cy="65" rx="4" ry="7" fill="#C2185B" />
      </g>
    </svg>
  );
}
