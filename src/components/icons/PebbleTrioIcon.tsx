
"use client";

import type { SVGProps } from 'react';

export function PebbleTrioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Smiling Sun Icon</title>
      <defs>
        <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#ff8a80', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: '#ff8a80', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <g transform="scale(0.95) translate(2.5, 2.5)">
        {/* Sun Body */}
        <circle cx="50" cy="50" r="35" fill="#FFC107" stroke="#FFA000" strokeWidth="0.5"/>

        {/* Sun Rays - simple paths for a clean look */}
        {[...Array(8)].map((_, i) => (
            <path
              key={i}
              d="M50 8 L 50 20"
              stroke="#FFCA28"
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${i * 45} 50 50)`}
            />
        ))}

        {/* Blush */}
        <ellipse cx="38" cy="58" rx="10" ry="6" fill="url(#blushGradient)" />
        <ellipse cx="62" cy="58"rx="10" ry="6" fill="url(#blushGradient)" />

        {/* Eyes */}
        <circle cx="42" cy="50" r="4" fill="black" />
        <circle cx="58" cy="50" r="4" fill="black" />

        {/* Smile */}
        <path d="M40 62 Q 50 72 60 62" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}
