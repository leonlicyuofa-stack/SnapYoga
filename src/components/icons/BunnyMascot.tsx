import type { SVGProps } from 'react';

export function BunnyMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Bunny Mascot</title>
        
        {/* Bunny Body */}
        <path d="M 75,120 C 50,125 40,100 50,80 C 60,60 90,60 100,80 C 110,100 100,125 75,120 Z" fill="#C8BAD3" stroke="currentColor" strokeWidth="0.5" />

        {/* Head */}
        <circle cx="75" cy="55" r="35" fill="#C8BAD3" stroke="currentColor" strokeWidth="0.5" />
        
        {/* Ears */}
        <path d="M 65,20 C 55,0 70,-5 75,20 C 80,45 75,40 65,20 Z" fill="#C8BAD3" stroke="currentColor" strokeWidth="0.5" />
        <path d="M 85,20 C 95,0 80,-5 75,20 C 70,45 75,40 85,20 Z" fill="#C8BAD3" stroke="currentColor" strokeWidth="0.5" />
        <path d="M 68,25 C 65,15 70,12 73,25 C 76,38 72,35 68,25 Z" fill="#EADADE" />
        
        {/* Face */}
        <ellipse cx="65" cy="50" rx="4" ry="5" fill="white" />
        <ellipse cx="85" cy="50" rx="4" ry="5" fill="white" />
        <path d="M 73,60 Q 75,63 77,60" stroke="white" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Blush */}
        <circle cx="55" cy="57" r="5" fill="#EADADE" opacity="0.6" />
        <circle cx="95" cy="57" r="5" fill="#EADADE" opacity="0.6" />
      </g>
    </svg>
  );
}
