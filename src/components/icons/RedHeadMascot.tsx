
import type { SVGProps } from 'react';

export function RedHeadMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Red-haired Mascot</title>

        {/* Head */}
        <circle cx="70" cy="110" r="40" fill="#E6E6FA" />
        <circle cx="70" cy="110" r="40" stroke="currentColor" strokeWidth="1.5" />

        {/* Hair */}
        <g fill="#E63946">
            <circle cx="45" cy="80" r="15"/>
            <circle cx="70" cy="75" r="18"/>
            <circle cx="95" cy="80" r="15"/>
        </g>
        
        {/* Face */}
        <ellipse cx="60" cy="105" rx="4" ry="5" fill="#2C3E50" />
        <ellipse cx="80" cy="105" rx="4" ry="5" fill="#2C3E50" />
        <path d="M 68,115 Q 70,118 72,115" stroke="#2C3E50" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Blush */}
        <circle cx="50" cy="112" r="5" fill="#FFC0CB" opacity="0.6" />
        <circle cx="90" cy="112" r="5" fill="#FFC0CB" opacity="0.6" />
      </g>
    </svg>
  );
}

    