import type { SVGProps } from 'react';

export function HalfFullGlass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Half Full Glass of Water</title>
        {/* Glass outline */}
        <path d="M 40 20 L 45 130 H 105 L 110 20 H 40 Z" stroke="#1F2937" strokeWidth="3" fill="none" />
        {/* Water */}
        <path d="M 47.5 75 L 102.5 75 L 105 130 H 45 L 47.5 75 Z" fill="#60A5FA" opacity="0.5" />
        {/* Water surface */}
        <path d="M 47.5 75 C 65 70, 85 80, 102.5 75" stroke="#60A5FA" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
}
