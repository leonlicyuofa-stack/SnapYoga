
import type { SVGProps } from 'react';

export function LadybirdIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g transform="rotate(-15 50 50)">
            {/* Body */}
            <circle cx="50" cy="50" r="35" fill="#D22B2B"/>
            <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2"/>
            
            {/* Head */}
            <circle cx="50" cy="20" r="15" fill="black" />
            
            {/* Face */}
            <circle cx="45" cy="18" r="2" fill="white" />
            <circle cx="55" cy="18" r="2" fill="white" />
            
            {/* Spots */}
            <circle cx="38" cy="40" r="5" fill="black" />
            <circle cx="62" cy="40" r="5" fill="black" />
            <circle cx="38" cy="65" r="5" fill="black" />
            <circle cx="62" cy="65" r="5" fill="black" />
            <circle cx="50" cy="52" r="5" fill="black" />
        </g>
    </svg>
  );
}
