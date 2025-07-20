
import type { SVGProps } from 'react';

export function AvocadoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g transform="rotate(20 50 50) scale(1, -1) translate(0, -100)">
            {/* Body */}
            <path d="M 50,10 C 20,10 10,40 25,70 C 40,100 60,100 75,70 C 90,40 80,10 50,10 Z" fill="#6B8E23" />
            <path d="M 50,10 C 20,10 10,40 25,70 C 40,100 60,100 75,70 C 90,40 80,10 50,10 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            
            {/* Seed with Face */}
            <g>
              <circle cx="50" cy="65" r="15" fill="#8B4513" stroke="currentColor" strokeWidth="1"/>
              {/* Face on Seed */}
              <circle cx="45" cy="62" r="2" fill="white" />
              <circle cx="55" cy="62" r="2" fill="white" />
              <path d="M 48,68 Q 50,72 52,68" stroke="white" fill="none" strokeWidth="1.5" strokeLinecap="round" />
            </g>
        </g>
    </svg>
  );
}
