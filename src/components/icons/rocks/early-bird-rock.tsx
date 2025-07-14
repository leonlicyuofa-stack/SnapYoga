
import type { SVGProps } from 'react';

export function EarlyBirdRock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20,50 C20,25 40,10 60,20 C80,30 90,50 80,70 C70,90 45,95 30,80 C15,65 20,50 20,50Z" fill="#00acc1"/>
        <path d="M20,50 C20,25 40,10 60,20 C80,30 90,50 80,70 C70,90 45,95 30,80 C15,65 20,50 20,50Z" stroke="black" strokeWidth="2"/>
        <ellipse cx="45" cy="45" rx="5" ry="8" fill="white"/>
        <circle cx="45" cy="45" r="2" fill="black"/>
        <ellipse cx="65" cy="50" rx="5" ry="8" fill="white"/>
        <circle cx="65" cy="50" r="2" fill="black"/>
        <path d="M48,60 Q55,65 62,60" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

    