
import type { SVGProps } from 'react';

export function PenguinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g>
            {/* Body */}
            <path d="M 50,10 C 30,10 20,30 20,50 C 20,80 40,95 50,95 C 60,95 80,80 80,50 C 80,30 70,10 50,10 Z" fill="black"/>
            {/* Tummy */}
            <path d="M 50,30 C 40,30 35,40 35,55 C 35,75 40,85 50,85 C 60,85 65,75 65,55 C 65,40 60,30 50,30 Z" fill="white"/>
            {/* Eyes */}
            <circle cx="43" cy="45" r="3" fill="white" />
            <circle cx="57" cy="45" r="3" fill="white" />
            <circle cx="44" cy="46" r="1.5" fill="black" />
            <circle cx="56" cy="46" r="1.5" fill="black" />
            {/* Beak */}
            <path d="M 48,55 L 52,55 L 50,62 Z" fill="#FFD700"/>
        </g>
    </svg>
  );
}
