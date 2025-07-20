
import type { SVGProps } from 'react';

export function PenguinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="rotate(10 50 50)">
        {/* Body */}
        <ellipse cx="50" cy="60" rx="30" ry="35" fill="hsl(var(--foreground))" />
        
        {/* Tummy */}
        <ellipse cx="50" cy="65" rx="20" ry="25" fill="hsl(var(--background))" />
        
        {/* Eyes */}
        <circle cx="42" cy="45" r="4" fill="white" />
        <circle cx="43" cy="46" r="2" fill="black" />
        <circle cx="58" cy="45" r="4" fill="white" />
        <circle cx="59" cy="46" r="2" fill="black" />
        
        {/* Beak */}
        <polygon points="48,55 52,55 50,62" fill="hsl(var(--accent))" />
        
        {/* Feet */}
        <ellipse cx="40" cy="94" rx="10" ry="5" fill="hsl(var(--accent))" transform="rotate(-10 40 94)" />
        <ellipse cx="60" cy="94" rx="10" ry="5" fill="hsl(var(--accent))" transform="rotate(10 60 94)" />
      </g>
    </svg>
  );
}
