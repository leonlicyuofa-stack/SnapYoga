import type { SVGProps } from 'react';

export function Avatar4Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of woman with hijab</title>
        <circle cx="50" cy="50" r="40" fill="#FECDD3" />
        <path d="M50 80 C 65 95, 35 95, 50 80 L 50 60 Z" fill="#FBCFE8"/>
        {/* Hijab */}
        <path d="M50 90 C 30 90, 25 70, 30 50 C 35 30, 65 30, 70 50 C 75 70, 70 90, 50 90 Z" fill="#881337" />
        <circle cx="50" cy="55" r="18" fill="#FEEBCB"/>
        {/* Eyes */}
        <g stroke="#3D2C28" strokeWidth="2.5" fill="none">
            <path d="M40 55 Q 44 53 48 55" strokeLinecap="round" />
            <path d="M52 55 Q 56 53 60 55" strokeLinecap="round" />
        </g>
        {/* Smile */}
        <path d="M47,65 Q 50,68 53,65" stroke="#3D2C28" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
