
import type { SVGProps } from 'react';

export function FemaleAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <rect x="15" y="15" width="70" height="70" rx="15" fill="#DFB2B5"/>
        {/* Eyes */}
        <circle cx="43" cy="50" r="4" fill="#5c3c3c" />
        <circle cx="57" cy="50" r="4" fill="#5c3c3c" />
      </g>
    </svg>
  );
}
