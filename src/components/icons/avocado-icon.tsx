
import type { SVGProps } from 'react';

export function AvocadoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g transform="rotate(15 50 50)">
            {/* Main body */}
            <path d="M 50,10 C 20,10 10,40 25,70 C 40,100 60,100 75,70 C 90,40 80,10 50,10 Z" fill="hsl(var(--primary))" />
            
            {/* Lighter inner part */}
            <path d="M 50,18 C 30,18 20,45 32,70 C 44,95 56,95 68,70 C 80,45 70,18 50,18 Z" fill="#a5d6a7" />

            {/* Seed with face */}
            <g>
                <circle cx="50" cy="65" r="15" fill="#c5e1a5" />
                <path d="M 45,62 Q 50,58 55,62" stroke="black" strokeWidth="1.5" fill="none" />
                <path d="M 42,70 Q 50,75 58,70" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
        </g>
    </svg>
  );
}
