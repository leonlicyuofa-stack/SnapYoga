
import type { SVGProps } from 'react';

export function PerfectionistPebble(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M50,15 C20,20 10,50 25,75 C40,100 70,95 85,70 C100,45 80,10 50,15Z" fill="#8e24aa"/>
        <path d="M50,15 C20,20 10,50 25,75 C40,100 70,95 85,70 C100,45 80,10 50,15Z" stroke="black" strokeWidth="2"/>
        <ellipse cx="45" cy="55" rx="6" ry="4" fill="white"/>
        <circle cx="45" cy="55" r="1.5" fill="black"/>
        <ellipse cx="65" cy="55" rx="6" ry="4" fill="white"/>
        <circle cx="65" cy="55" r="1.5" fill="black"/>
        <path d="M50,70 C55,65 60,65 65,70" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

    