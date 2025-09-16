
import type { SVGProps } from 'react';

export function HalfFullGlass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Half Full Glass of Water</title>
        
        {/* Water */}
        <path d="M45 80 L105 80 L100 130 L50 130 Z" fill="#A8D5FF"/>
        
        {/* Glass */}
        <path d="M35 20 L40 135 H110 L115 20 H35 Z" 
              stroke="#D1E9FF" strokeWidth="4" fill="#D1E9FF" fillOpacity="0.4"/>
        
        {/* Water Surface */}
        <ellipse cx="75" cy="80" rx="30" ry="8" fill="#A8D5FF" />

         {/* Rim */}
        <ellipse cx="75" cy="20" rx="40" ry="6" stroke="#D1E9FF" strokeWidth="4" fill="none"/>
      </g>
    </svg>
  );
}
