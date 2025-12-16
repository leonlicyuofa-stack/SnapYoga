import type { SVGProps } from 'react';

export function Avatar2Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of person with blonde hair</title>
        <circle cx="50" cy="50" r="40" fill="#FECDD3" />
        <path d="M50 80 C 65 95, 35 95, 50 80 L 50 60 Z" fill="#FBCFE8"/>
        {/* Hair */}
        <path d="M30 60 C 20 40, 80 40, 70 60 L 65 35 L 35 35 Z" fill="#FDE047"/>
        <path d="M50 90 C 40 100, 60 100, 50 90 V 70 H 50 Z" fill="#3D2C28"/>
        <circle cx="50" cy="55" r="22" fill="#FEEBCB"/>
        {/* Eyes */}
        <g stroke="#3D2C28" strokeWidth="2.5" fill="none">
            <path d="M38 58 Q 42 56 46 58" strokeLinecap="round" />
            <path d="M54 58 Q 58 56 62 58" strokeLinecap="round" />
        </g>
        {/* Mouth */}
        <path d="M45,68 Q 50,73 55,68" stroke="#3D2C28" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
