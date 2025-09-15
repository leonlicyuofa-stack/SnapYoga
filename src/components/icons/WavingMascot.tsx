
import type { SVGProps } from 'react';

export function WavingMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Waving Mascot</title>
        {/* Body */}
        <circle cx="105" cy="95" r="50" fill="#FFB6C1" />

        {/* Glasses */}
        <g stroke="white" strokeWidth="3" fill="none">
          <circle cx="85" cy="70" r="12" />
          <circle cx="120" cy="70" r="12" />
          <line x1="97" y1="70" x2="108" y2="70" />
        </g>
        
        {/* Eyes */}
        <circle cx="85" cy="70" r="2" fill="black" />
        <circle cx="120" cy="70" r="2" fill="black" />

        {/* Smile */}
        <path d="M 98 85 Q 102 90 106 85" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Waving Arm */}
        <path d="M 65,80 C 55,70 50,55 60,50" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="-10" to="10" dur="1s" repeatCount="indefinite" additive="sum" transform-origin="65 80"/>
        </path>

        {/* Feet */}
        <line x1="95" y1="145" x2="95" y2="155" stroke="black" strokeWidth="2" strokeLinecap="round" />
        <line x1="115" y1="145" x2="115" y2="155" stroke="black" strokeWidth="2" strokeLinecap="round" />

        {/* Antenna */}
        <line x1="130" y1="48" x2="130" y2="40" stroke="black" strokeWidth="2" strokeLinecap="round" />
        <circle cx="130" cy="38" r="2" fill="black" />
      </g>
    </svg>
  );
}
