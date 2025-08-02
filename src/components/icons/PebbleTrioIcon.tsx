
"use client";

import type { SVGProps } from 'react';

export function PebbleTrioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Pebble Trio Icon</title>
      <defs>
        <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#ff8a80', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: '#ff8a80', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Background */}
      <path d="M-10 70 L 50 40 L 110 70 Z" fill="#ffadad" />
      <path d="M-10 60 L 50 30 L 110 60 Z" fill="#9bf6ff" />
      <path d="M-10 50 L 50 20 L 110 50 Z" fill="#caffbf" />
      <path d="M0 60 Q 25 50, 50 60 T 100 60 V 100 H 0 Z" fill="#bde0fe" />
      <path d="M0 50 Q 25 40, 50 50 T 100 50 V 100 H 0 Z" fill="#a2d2ff" />


      {/* Left Pebble */}
      <g>
        <ellipse cx="25" cy="50" rx="15" ry="12" fill="#F5F5F5" stroke="#757575" strokeWidth="0.5" />
        {/* Blush */}
        <ellipse cx="20" cy="52" rx="4" ry="2" fill="url(#blushGradient)" />
        <ellipse cx="30" cy="52" rx="4" ry="2" fill="url(#blushGradient)" />
        {/* Eyes */}
        <ellipse cx="22" cy="48" rx="1.5" ry="3" fill="#424242" />
        <ellipse cx="28" cy="48" rx="1.5" ry="3" fill="#424242" />
        {/* Smile */}
        <path d="M24 55 Q 25 57 26 55" stroke="#424242" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Center Pebble */}
      <g>
        <ellipse cx="50" cy="50" rx="15" ry="12" fill="#F5F5F5" stroke="#757575" strokeWidth="0.5" />
        {/* Blush */}
        <ellipse cx="45" cy="52" rx="4" ry="2" fill="url(#blushGradient)" />
        <ellipse cx="55" cy="52" rx="4" ry="2" fill="url(#blushGradient)" />
        {/* Eyes */}
        <ellipse cx="47" cy="48" rx="1.5" ry="3" fill="#424242" />
        <ellipse cx="53" cy="48" rx="1.5" ry="3" fill="#424242" />
        {/* Smile */}
        <path d="M49 55 Q 50 57 51 55" stroke="#424242" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Right Pebble */}
      <g>
        <ellipse cx="75" cy="50" rx="15" ry="12" fill="#F5F5F5" stroke="#757575" strokeWidth="0.5" />
         {/* Blush */}
        <ellipse cx="70" cy="52" rx="4" ry="2" fill="url(#blushGradient)" />
        <ellipse cx="80" cy="52" rx="4" ry="2" fill="url(#blushGradient)" />
        {/* Eyes */}
        <ellipse cx="72" cy="48" rx="1.5" ry="3" fill="#424242" />
        <ellipse cx="78" cy="48" rx="1.5" ry="3" fill="#424242" />
        {/* Smile */}
        <path d="M74 55 Q 75 57 76 55" stroke="#424242" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
