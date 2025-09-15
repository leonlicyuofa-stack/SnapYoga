
import type { SVGProps } from 'react';

export function FemaleAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="rotate(20 40 50)">
        <path 
          d="M 25,75 C 10,60 10,30 30,25 C 50,20 70,30 75,50 C 80,70 65,85 45,85 C 25,85 30,80 25,75 Z"
          fill="hsl(var(--pistachio-background))"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
        />
        {/* Smiley Face */}
        <circle cx="48" cy="48" r="1.5" fill="hsl(var(--foreground))" />
        <circle cx="60" cy="48" r="1.5" fill="hsl(var(--foreground))" />
        <path d="M 50 56 Q 54 60 58 56" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
