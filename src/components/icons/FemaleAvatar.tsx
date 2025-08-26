
import type { SVGProps } from 'react';

export function FemaleAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="#F472B6">
            <circle cx="50" cy="25" r="20" />
            <path d="M15 50 L40 100 Q50 110 60 100 L85 50 Z" />
        </g>
    </svg>
  );
}
