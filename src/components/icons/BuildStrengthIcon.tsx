import type { SVGProps } from 'react';

export function BuildStrengthIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        {/* Mat */}
        <ellipse cx="50" cy="85" rx="30" ry="6" fill="#A3D9B1" />

        {/* Body */}
        <path 
          d="M 50,25 C 75,25 90,45 90,65 C 90,85 75,90 50,90 C 25,90 10,85 10,65 C 10,45 25,25 50,25 Z"
          fill="#FDE68A"
          stroke="#27272A"
          strokeWidth="2"
        />

        {/* Face */}
        <g stroke="#27272A" strokeWidth="2" strokeLinecap="round">
            <path d="M40 50 L 48 52" />
            <path d="M60 50 L 52 52" />
            <path d="M45 60 H 55" />
            <path d="M62 48 L 65 45 L 68 48" />
        </g>
        <circle cx="38" cy="58" r="5" fill="#FCA5A5" opacity="0.8"/>
        <circle cx="62" cy="58" r="5" fill="#FCA5A5" opacity="0.8"/>


        {/* Arms */}
        <g fill="#FDE68A" stroke="#27272A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M30,55 C20,45 25,30 40,35 C40,45 35,55 30,55 Z" />
            <path d="M70,55 C80,45 75,30 60,35 C60,45 65,55 70,55 Z" />
        </g>
        
        {/* Abs */}
        <g stroke="#27272A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
            <path d="M45 68 Q 50 67 55 68" />
            <path d="M43 72 Q 50 71 57 72" />
            <path d="M43 76 Q 50 75 57 76" />
        </g>

        {/* Legs */}
         <g fill="#FDE68A" stroke="#27272A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M40 88 C 35 75, 45 65, 50 70 V 88 H 40 Z" />
            <path d="M60 88 C 65 75, 55 65, 50 70 V 88 H 60 Z" />
        </g>

        {/* Sparkles */}
        <g fill="#FDE047" stroke="#FDBA74" strokeWidth="0.5">
            <path d="M20 30 L 22 28 L 24 30 L 22 32 Z" />
            <path d="M80 30 L 78 28 L 76 30 L 78 32 Z" />
            <path d="M25 75 L 27 73 L 29 75 L 27 77 Z" />
            <path d="M75 75 L 73 73 L 71 75 L 73 77 Z" />
        </g>
        <g stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round">
            <path d="M25 45 Q 20 50 25 55" />
            <path d="M75 45 Q 80 50 75 55" />
        </g>
      </g>
    </svg>
  );
}
