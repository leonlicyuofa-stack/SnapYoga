import type { SVGProps } from 'react';

export function HalfFullGlass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Half Full Glass of Water</title>
        {/* Water */}
        <path d="M35 80 C35 115, 115 115, 115 80 V130 C115 130, 35 130, 35 130 V80 Z" fill="#A8D5FF"/>
        
        {/* Glass */}
        <path d="M30 20 Q30 30, 40 30 H110 Q120 30, 120 20 V135 C120 145, 110 145, 100 145 H50 C40 145, 30 145, 30 135 V20 Z" 
              stroke="#D1E9FF" strokeWidth="4" fill="#D1E9FF" fillOpacity="0.4"/>
        
        {/* Water Surface */}
        <ellipse cx="75" cy="80" rx="80" ry="10" fill="#A8D5FF" transform="scale(0.55 1) translate(61, 0)"/>

         {/* Rim */}
        <ellipse cx="75" cy="25" rx="45" ry="8" stroke="#D1E9FF" strokeWidth="4" fill="none"/>
      </g>
    </svg>
  );
}
