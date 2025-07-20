
import type { SVGProps } from 'react';

export function LadybirdIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g transform="rotate(-15 50 50)">
            <circle cx="50" cy="50" r="35" fill="#D22B2B"/>
            <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2"/>
            <path d="M 50,15 V 85" stroke="currentColor" strokeWidth="3" />
            <circle cx="35" cy="35" r="5" fill="black" />
            <circle cx="65" cy="35" r="5" fill="black" />
            <circle cx="35" cy="65" r="5" fill="black" />
            <circle cx="65" cy="65" r="5" fill="black" />
            <circle cx="50" cy="50" r="5" fill="black" />
        </g>
    </svg>
  );
}
