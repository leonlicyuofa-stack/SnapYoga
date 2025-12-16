
import type { SVGProps } from 'react';

export function Avatar3Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a cute watermelon slice</title>
        {/* The head/background is transparent so it can be colored by its container */}
        <rect width="100" height="100" fill="transparent" />

        {/* Green Rind */}
        <rect y="70" width="100" height="30" fill="#84CC16" />

        {/* White Rind */}
        <rect y="60" width="100" height="10" fill="#F8F8F0" />
        
        {/* Pink Flesh */}
        <rect width="100" height="60" fill="#F472B6" />

        {/* Face */}
        <g fill="black">
          <circle cx="38" cy="48" r="6" />
          <circle cx="62" cy="48" r="6" />
          <path d="M 48 55 C 49 57, 51 57, 52 55" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
