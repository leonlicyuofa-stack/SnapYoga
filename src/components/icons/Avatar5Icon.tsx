import type { SVGProps } from 'react';

export function Avatar5Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of man with beard</title>
        <circle cx="50" cy="50" r="40" fill="#D1FAE5" />
        <path d="M50 80 C 65 95, 35 95, 50 80 L 50 60 Z" fill="#A7F3D0"/>
        <path d="M35 55 C 30 45, 70 45, 65 55 Q 50 50 35 55 Z" fill="#1F2937"/>
        <path d="M50 90 C 40 100, 60 100, 50 90 V 70 H 50 Z" fill="#111827"/>
        <circle cx="50" cy="60" r="22" fill="#854d0e"/>
        {/* Beard */}
        <path d="M 38,70 C 35,80 65,80 62,70 Q 50,76 38,70 Z" fill="#1F2937" />
        {/* Eyes */}
        <g stroke="white" strokeWidth="2.5" fill="none">
            <path d="M40 62 Q 44 60 48 62" strokeLinecap="round" />
            <path d="M52 62 Q 56 60 60 62" strokeLinecap="round" />
        </g>
        {/* Mouth */}
        <path d="M47,75 Q 50,80 53,75" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
