import type { SVGProps } from 'react';

export function BunnyMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Bunny Mascot</title>
        
        {/* Head */}
        <circle cx="60" cy="80" r="30" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1.5" />
        
        {/* Left Ear */}
        <path d="M 45,55 C 35,30 50,10 55,30 L 50,80 Z" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1.5" />
        <path d="M 47,55 C 42,40 50,25 53,35 L 50,75 Z" fill="#FCE4EC" />
        
        {/* Right Ear */}
        <path d="M 75,55 C 85,30 70,10 65,30 L 70,80 Z" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1.5" />
        <path d="M 73,55 C 78,40 70,25 67,35 L 70,75 Z" fill="#FCE4EC" />
        
        {/* Eyes */}
        <circle cx="52" cy="80" r="3" fill="#2C3E50" />
        <circle cx="68" cy="80" r="3" fill="#2C3E50" />
        
        {/* Nose and Mouth */}
        <path d="M 60,85 L 58,89 L 62,89 Z" fill="#2C3E50" />
        <path d="M 60,89 C 55,93 55,87 55,87" stroke="#2C3E50" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 60,89 C 65,93 65,87 65,87" stroke="#2C3E50" fill="none" strokeWidth="1.5" strokeLinecap="round" />

        {/* Blush */}
        <circle cx="45" cy="85" r="5" fill="#FFC0CB" opacity="0.6" />
        <circle cx="75" cy="85" r="5" fill="#FFC0CB" opacity="0.6" />

      </g>
    </svg>
  );
}
