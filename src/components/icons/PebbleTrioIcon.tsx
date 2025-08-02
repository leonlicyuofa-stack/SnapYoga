
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

      {/* Background Elements */}
      <rect x="0" y="0" width="120" height="100" fill="#e0f7fa" />
      <path d="M-10 70 Q 30 50, 60 70 T 130 70 L 120 100 L 0 100 Z" fill="#b3e5fc" />
      <path d="M-10 80 Q 40 65, 70 80 T 140 80 L 120 100 L 0 100 Z" fill="#81d4fa" />
      <path d="M 20 100 L 50 40 L 80 100 Z" fill="#c8e6c9" />
      <path d="M 60 100 L 90 50 L 120 100 Z" fill="#a5d6a7" />
      
      {/* Middle Pebble */}
      <g>
        <ellipse cx="50" cy="45" rx="20" ry="15" fill="#f5f5f5" stroke="black" strokeWidth="0.5"/>
        {/* Blush */}
        <ellipse cx="45" cy="50" rx="3.5" ry="2" fill="url(#blushGradient)"/>
        <ellipse cx="55" cy="50" rx="3.5" ry="2" fill="url(#blushGradient)"/>
        {/* Eyes */}
        <ellipse cx="48" cy="43" rx="1.5" ry="2.5" fill="black" />
        <ellipse cx="52" cy="43" rx="1.5" ry="2.5" fill="black" />
      </g>

      {/* Left Pebble */}
      <g className="animate-pebble-bounce-left" style={{ transformOrigin: 'center center' }}>
        <ellipse cx="25" cy="50" rx="7" ry="4.5" fill="#eeeeee" stroke="black" strokeWidth="0.5"/>
      </g>
      
      {/* Right Pebble */}
      <g className="animate-pebble-bounce-right" style={{ transformOrigin: 'center center' }}>
        <ellipse cx="75" cy="50" rx="7" ry="4.5" fill="#eeeeee" stroke="black" strokeWidth="0.5"/>
      </g>
    </svg>
  );
}
