import type { SVGProps } from 'react';

export function Avatar3Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of man with a turban</title>
        <circle cx="50" cy="50" r="40" fill="#FED7AA" />
        <path d="M50 80 C 65 95, 35 95, 50 80 L 50 60 Z" fill="#FB923C"/>
        <circle cx="50" cy="60" r="22" fill="#A16207"/>
        {/* Turban */}
        <path d="M50 35 C 25 35, 25 55, 50 55 C 75 55, 75 35, 50 35" fill="#FB923C" />
        <path d="M50 32 C 40 32, 40 40, 50 40 C 60 40, 60 32, 50 32" fill="#F97316" />
        <path d="M50 28 C 45 28, 45 34, 50 34 C 55 34, 55 28, 50 28" fill="#EA580C" />
        {/* Eyes */}
        <g stroke="white" strokeWidth="2.5" fill="none">
            <path d="M38 60 Q 42 58 46 60" strokeLinecap="round" />
            <path d="M54 60 Q 58 58 62 60" strokeLinecap="round" />
        </g>
        {/* Beard */}
        <path d="M 38,68 C 35,78 65,78 62,68 Q 50,74 38,68 Z" fill="#5A3E36" />
        {/* Mouth */}
        <path d="M45,75 Q 50,80 55,75" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
