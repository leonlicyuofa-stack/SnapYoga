import type { SVGProps } from 'react';

export function Avatar1Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of man with glasses</title>
        <circle cx="50" cy="50" r="40" fill="#F3E8FF" />
        <path d="M50 80 C 65 95, 35 95, 50 80 L 50 60 Z" fill="#E9D5FF"/>
        <path d="M35 55 C 30 40, 70 40, 65 55 L 60 70 L 40 70 Z" fill="#5A3E36"/>
        <path d="M50 90 C 40 100, 60 100, 50 90 V 70 H 50 Z" fill="#3D2C28"/>
        <circle cx="50" cy="55" r="22" fill="#FEEBCB"/>
        <path d="M50 77 C 40 85, 60 85, 50 77 V 65 C 45 62, 55 62, 50 65 Z" fill="#C46D5E"/>
        {/* Beard */}
        <path d="M 38,62 C 35,72 65,72 62,62 Q 50,68 38,62 Z" fill="#5A3E36" />
        {/* Glasses */}
        <g stroke="#3D2C28" strokeWidth="2.5" fill="none">
            <circle cx="42" cy="58" r="6" />
            <circle cx="58" cy="58" r="6" />
            <path d="M48 58 H 52" />
        </g>
        {/* Eyes */}
        <circle cx="42" cy="58" r="2" fill="#3D2C28" />
        <circle cx="58" cy="58" r="2" fill="#3D2C28" />
        {/* Mouth */}
        <path d="M45,70 Q 50,75 55,70" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
