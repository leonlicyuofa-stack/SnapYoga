
import type { SVGProps } from 'react';

export function PenguinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g>
            {/* Body */}
            <path d="M 50,10 C 30,10 20,30 20,50 C 20,80 40,95 50,95 C 60,95 80,80 80,50 C 80,30 70,10 50,10 Z" fill="currentColor"/>
            
            {/* Tummy */}
            <path d="M 50,30 C 40,30 35,40 35,55 C 35,75 40,85 50,85 C 60,85 65,75 65,55 C 65,40 60,30 50,30 Z" fill="white"/>
            
            {/* Face */}
            <circle cx="43" cy="45" r="3" fill="black" />
            <circle cx="57" cy="45" r="3" fill="black" />
            <path d="M 48,55 L 52,55 L 50,62 Z" fill="#FFD700"/>
            
            {/* Blush */}
            <circle cx="35" cy="55" r="5" fill="#ffc8dd" opacity="0.8" />
            <circle cx="65" cy="55" r="5" fill="#ffc8dd" opacity="0.8" />
        </g>
    </svg>
  );
}
