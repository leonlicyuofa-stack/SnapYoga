"use client";

import type { SVGProps } from 'react';

export function PebbleTrioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Three pebbles holding hands</title>
      <defs>
        <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#ffc0cb', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: '#ffc0cb', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      
      {/* Middle Pebble */}
      <g>
        <ellipse cx="60" cy="60" rx="40" ry="30" fill="#f5f5f5" stroke="black" strokeWidth="0.5"/>
        {/* Blush */}
        <ellipse cx="50" cy="65" rx="7" ry="4" fill="url(#blushGradient)"/>
        <ellipse cx="70" cy="65" rx="7" ry="4" fill="url(#blushGradient)"/>
        {/* Eyes */}
        <ellipse cx="53" cy="58" rx="2" ry="4" fill="black" />
        <ellipse cx="67" cy="58" rx="2" ry="4" fill="black" />
      </g>

      {/* Left Pebble */}
      <g className="animate-pebble-bounce-left" style={{ transformOrigin: 'center center' }}>
        <ellipse cx="30" cy="70" rx="7" ry="4.5" fill="#eeeeee" stroke="black" strokeWidth="0.5"/>
      </g>
      
      {/* Right Pebble */}
      <g className="animate-pebble-bounce-right" style={{ transformOrigin: 'center center' }}>
        <ellipse cx="90" cy="70" rx="7" ry="4.5" fill="#eeeeee" stroke="black" strokeWidth="0.5"/>
      </g>
    </svg>
  );
}
