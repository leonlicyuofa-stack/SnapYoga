
import type { SVGProps } from 'react';

export function MaleAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <path 
          d="M 85,75 C 95,60 90,30 70,25 C 50,20 30,30 20,50 C 10,70 25,85 45,85 C 65,85 80,85 85,75 Z"
          fill="#A7C7E7"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
        />
        {/* Smiley Face */}
        <circle cx="68" cy="48" r="1.5" fill="hsl(var(--foreground))" />
        <circle cx="78" cy="48" r="1.5" fill="hsl(var(--foreground))" />
        <path d="M 70 56 Q 74 60 78 56" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
