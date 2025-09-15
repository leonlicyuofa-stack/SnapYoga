
import type { SVGProps } from 'react';

export function MaleAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <rect x="15" y="15" width="70" height="70" rx="15" fill="#608398"/>
        {/* Eyes */}
        <circle cx="42" cy="50" r="5" fill="#2C3E50" />
        <circle cx="58" cy="50" r="5" fill="#2C3E50" />
      </g>
    </svg>
  );
}
