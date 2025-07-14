
import type { SVGProps } from 'react';

export function SocialButterflyRock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M50,20 C80,20 95,40 90,60 C85,80 65,95 45,90 C25,85 10,65 15,45 C20,25 35,20 50,20Z" fill="#d81b60"/>
        <path d="M50,20 C80,20 95,40 90,60 C85,80 65,95 45,90 C25,85 10,65 15,45 C20,25 35,20 50,20Z" stroke="black" strokeWidth="2"/>
        <ellipse cx="40" cy="55" rx="5" ry="7" fill="white"/>
        <circle cx="40" cy="55" r="2" fill="black"/>
        <ellipse cx="60" cy="55" rx="5" ry="7" fill="white"/>
        <circle cx="60" cy="55" r="2" fill="black"/>
        <path d="M45,70 C50,75 55,75 60,70" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

    