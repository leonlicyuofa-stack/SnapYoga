"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function PebbleTrioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Three pebbles holding hands</title>
      
      {/* Middle Pebble */}
      <g>
        <ellipse cx="60" cy="60" rx="22" ry="28" fill="#f5f5f5" stroke="black" strokeWidth="1.5"/>
        {/* Blush */}
        <ellipse cx="50" cy="65" rx="7" ry="4" fill="#ffc0cb" opacity="0.6"/>
        <ellipse cx="70" cy="65" rx="7" ry="4" fill="#ffc0cb" opacity="0.6"/>
        {/* Eyes */}
        <ellipse cx="53" cy="58" rx="2" ry="3" fill="black" />
        <ellipse cx="67" cy="58" rx="2" ry="3" fill="black" />
      </g>

      {/* Left Pebble */}
      <g className="animate-pebble-bounce-left" style={{ transformOrigin: 'center center' }}>
        <ellipse cx="28" cy="65" rx="22" ry="18" fill="#eeeeee" stroke="black" strokeWidth="1.5"/>
        {/* Blush */}
        <ellipse cx="22" cy="68" rx="6" ry="3" fill="#ffc0cb" opacity="0.6"/>
        <ellipse cx="34" cy="68" rx="6" ry="3" fill="#ffc0cb" opacity="0.6"/>
        {/* Eyes */}
        <path d="M 21,63 Q 23,60 25,63" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 31,63 Q 33,60 35,63" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
      
      {/* Right Pebble */}
      <g className="animate-pebble-bounce-right" style={{ transformOrigin: 'center center' }}>
        <ellipse cx="92" cy="65" rx="22" ry="18" fill="#eeeeee" stroke="black" strokeWidth="1.5"/>
        {/* Blush */}
        <ellipse cx="86" cy="68" rx="6" ry="3" fill="#ffc0cb" opacity="0.6"/>
        <ellipse cx="98" cy="68" rx="6" ry="3" fill="#ffc0cb" opacity="0.6"/>
        {/* Eyes */}
        <path d="M 85,63 Q 87,60 89,63" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 95,63 Q 97,60 99,63" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
