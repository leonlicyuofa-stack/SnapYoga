
import type { SVGProps } from 'react';

export function FirstAnalysisRock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M25,75 C10,60 15,30 35,20 C55,10 75,20 85,40 C95,60 80,85 60,85 C40,85 30,80 25,75Z" fill="#43a047"/>
        <path d="M25,75 C10,60 15,30 35,20 C55,10 75,20 85,40 C95,60 80,85 60,85 C40,85 30,80 25,75Z" stroke="black" strokeWidth="2"/>
        <ellipse cx="45" cy="45" rx="6" ry="5" fill="white"/>
        <circle cx="45" cy="45" r="2" fill="black"/>
        <ellipse cx="68" cy="50" rx="6" ry="5" fill="white"/>
        <circle cx="68" cy="50" r="2" fill="black"/>
        <path d="M50,65 Q60,60 70,65" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

    