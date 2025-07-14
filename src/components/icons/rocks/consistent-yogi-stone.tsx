
import type { SVGProps } from 'react';

export function ConsistentYogiStone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M80,65 C95,45 85,20 65,15 C45,10 25,25 20,45 C15,65 30,85 50,80 C70,75 75,70 80,65Z" fill="#fb8c00"/>
        <path d="M80,65 C95,45 85,20 65,15 C45,10 25,25 20,45 C15,65 30,85 50,80 C70,75 75,70 80,65Z" stroke="black" strokeWidth="2"/>
        <ellipse cx="43" cy="50" rx="4" ry="6" fill="white"/>
        <circle cx="43" cy="50" r="1.5" fill="black"/>
        <ellipse cx="60" cy="48" rx="4" ry="6" fill="white"/>
        <circle cx="60" cy="48" r="1.5" fill="black"/>
        <path d="M45,60 C50,62 58,60 58,60" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

    