
import type { SVGProps } from 'react';

export function PebbleTrioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Three pebbles holding hands</title>
      
      {/* Middle Pebble */}
      <g>
        <path d="M 60,35 C 40,30 35,50 45,70 C 55,90 75,85 80,65 C 85,45 80,40 60,35 Z" fill="#e0e0e0" stroke="black" strokeWidth="1.5"/>
        <ellipse cx="55" cy="55" rx="3" ry="5" fill="white"/>
        <circle cx="55" cy="55" r="1" fill="black"/>
        <ellipse cx="70" cy="55" rx="3" ry="5" fill="white"/>
        <circle cx="70" cy="55" r="1" fill="black"/>
        <path d="M58,65 Q62.5,70 67,65" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>

      {/* Left Pebble */}
      <g>
        <path d="M 30,50 C 15,45 10,60 20,75 C 30,90 45,85 50,70 L 45,60 C 40,55 35,55 30,50 Z" fill="#bdbdbd" stroke="black" strokeWidth="1.5"/>
        <ellipse cx="30" cy="65" rx="2.5" ry="4" fill="white"/>
        <circle cx="30" cy="65" r="1" fill="black"/>
        <ellipse cx="40" cy="65" rx="2.5" ry="4" fill="white"/>
        <circle cx="40" cy="65" r="1" fill="black"/>
        <path d="M32,75 Q36,78 40,75" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
      
      {/* Right Pebble */}
      <g>
        <path d="M 90,50 C 105,45 110,60 100,75 C 90,90 75,85 70,70 L 75,60 C 80,55 85,55 90,50 Z" fill="#bdbdbd" stroke="black" strokeWidth="1.5"/>
        <ellipse cx="80" cy="65" rx="2.5" ry="4" fill="white"/>
        <circle cx="80" cy="65" r="1" fill="black"/>
        <ellipse cx="90" cy="65" rx="2.5" ry="4" fill="white"/>
        <circle cx="90" cy="65" r="1" fill="black"/>
        <path d="M82,75 Q86,78 90,75" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}
