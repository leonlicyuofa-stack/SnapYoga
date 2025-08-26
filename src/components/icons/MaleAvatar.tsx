
import type { SVGProps } from 'react';

export function MaleAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="#2DD4BF">
        <circle cx="50" cy="25" r="20" />
        <path d="M15 100 L40 50 Q50 40 60 50 L85 100 Z" />
      </g>
    </svg>
  );
}
