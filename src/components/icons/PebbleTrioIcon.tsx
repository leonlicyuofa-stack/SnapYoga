
"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

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

      {/* Left Pebble */}
      <g className="animate-pebble-bounce" style={{ animationDelay: '0s' }}>
        <ellipse cx="25" cy="65" rx="15" ry="15" fill="#FFD1DC" stroke="#757575" strokeWidth="0.5" />
        <g className="animate-pebble-eyes">
            <ellipse cx="22" cy="62" rx="1.5" ry="3" fill="#424242" />
            <ellipse cx="28" cy="62" rx="1.5" ry="3" fill="#424242" />
        </g>
        <path d="M24 72 Q 25 74 26 72" stroke="#424242" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Center Pebble */}
      <g className="animate-pebble-bounce" style={{ animationDelay: '0.2s' }}>
        <ellipse cx="50" cy="65" rx="15" ry="15" fill="#FFFACD" stroke="#757575" strokeWidth="0.5" />
        <g className="animate-pebble-eyes">
            <ellipse cx="47" cy="62" rx="1.5" ry="3" fill="#424242" />
            <ellipse cx="53" cy="62" rx="1.5" ry="3" fill="#424242" />
        </g>
        <path d="M49 72 Q 50 74 51 72" stroke="#424242" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Right Pebble */}
      <g className="animate-pebble-bounce" style={{ animationDelay: '0.4s' }}>
        <ellipse cx="75" cy="65" rx="15" ry="15" fill="#ADD8E6" stroke="#757575" strokeWidth="0.5" />
        <g className="animate-pebble-eyes">
            <ellipse cx="72" cy="62" rx="1.5" ry="3" fill="#424242" />
            <ellipse cx="78" cy="62" rx="1.5" ry="3" fill="#424242" />
        </g>
        <path d="M74 72 Q 75 74 76 72" stroke="#424242" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
