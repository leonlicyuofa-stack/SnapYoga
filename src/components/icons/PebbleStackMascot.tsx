
import type { SVGProps } from 'react';

export function PebbleStackMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Pebble Stack Mascot</title>
        
        {/* Bottom Pebble */}
        <path d="M 15,100 C 5,90 5,70 20,65 C 35,60 75,60 90,70 C 105,80 105,95 85,105 C 65,115 25,110 15,100 Z" fill="#A695B7" stroke="currentColor" strokeWidth="0.5" />
        <ellipse cx="45" cy="85" rx="4" ry="5" fill="#2C3E50" />
        <ellipse cx="65" cy="85" rx="4" ry="5" fill="#2C3E50" />
        <path d="M 50,92 Q 55,98 60,92" stroke="#2C3E50" fill="none" strokeWidth="1.5" strokeLinecap="round" />

        {/* Middle Pebble */}
        <path d="M 25,68 C 18,63 20,50 30,45 C 40,40 70,42 80,50 C 90,58 88,68 75,72 C 62,76 32,73 25,68 Z" fill="#C8BAD3" stroke="currentColor" strokeWidth="0.5" />
        
        {/* Top Pebble */}
        <path d="M 35,48 C 30,45 32,35 40,32 C 48,29 62,32 68,38 C 74,44 70,50 60,51 C 50,52 40,51 35,48 Z" fill="#EADADE" stroke="currentColor" strokeWidth="0.5" />
        
        {/* Blush */}
        <circle cx="35" cy="88" r="5" fill="#FFC0CB" opacity="0.6" />
        <circle cx="75" cy="88" r="5" fill="#FFC0CB" opacity="0.6" />
      </g>
    </svg>
  );
}
