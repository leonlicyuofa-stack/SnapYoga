
"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function PebbleTrioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Pebble Trio Icon</title>
      
      {/* Left Pebble - design from top pebble of logo */}
      <g className="animate-pebble-bounce" style={{ animationDelay: '0s' }}>
         <g transform="translate(-25, 35) scale(0.9)">
            <path d="M69.9,51.3c-2.5,2.4-11,4-20,4s-17.5-1.6-20-4c-2.5-2.4,0.4-7.5,9.2-8.7s18.4-0.6,24.1,2.1C68.8,46.5,72.4,48.9,69.9,51.3z" fill="#e9ecef" stroke="#343a40" strokeWidth="0.5"/>
            <g className="animate-pebble-eyes">
                 <ellipse cx="46" cy="46" rx="1.5" ry="2" fill="#424242" />
                 <ellipse cx="56" cy="46" rx="1.5" ry="2" fill="#424242" />
            </g>
            <path d="M49 50 Q 51 52 53 50" stroke="#424242" strokeWidth="0.5" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Center Pebble - design from middle pebble of logo */}
      <g className="animate-pebble-bounce" style={{ animationDelay: '0.2s' }}>
         <g transform="translate(0, 25) scale(0.9)">
            <path d="M78.6,65.8c-2.7,3.6-14.6,6.3-28.6,6.3s-25.9-2.7-28.6-6.3c-2.7-3.6,1.2-11.3,13.6-13.1c12.4-1.8,27.5-0.9,35.8,3.2C81.8,60.1,81.3,62.2,78.6,65.8z" fill="#adb5bd" stroke="#343a40" strokeWidth="0.5"/>
            <g className="animate-pebble-eyes">
                <ellipse cx="48" cy="62" rx="1.5" ry="2" fill="#424242" />
                <ellipse cx="62" cy="62" rx="1.5" ry="2" fill="#424242" />
            </g>
             <path d="M53 68 Q 55 70 57 68" stroke="#424242" strokeWidth="0.5" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Right Pebble - design from bottom pebble of logo */}
      <g className="animate-pebble-bounce" style={{ animationDelay: '0.4s' }}>
        <g transform="translate(25, 15) scale(0.9)">
            <path d="M84.7,85.4c-2.3,4.8-19.4,8.9-34.7,8.9s-32.4-4.1-34.7-8.9c-2.3-4.8,2.7-14.5,17.4-16.7c14.7-2.2,34.3-1.1,44.7,4.3C88.1,78.2,87,80.6,84.7,85.4z" fill="#6c757d" stroke="#343a40" strokeWidth="0.5"/>
            <g className="animate-pebble-eyes">
                <ellipse cx="67" cy="80" rx="1.5" ry="2" fill="white" />
                <ellipse cx="77" cy="80" rx="1.5" ry="2" fill="white" />
            </g>
            <path d="M71 85 Q 72 87 73 85" stroke="white" strokeWidth="0.5" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
