import type { SVGProps } from 'react';

export function Avatar1Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Avatar of a cute frog</title>
        <path d="M 20,60 C 10,40 25,25 50,25 C 75,25 90,40 80,60 C 90,80 70,95 50,95 C 30,95 10,80 20,60 Z" fill="#b2c8a4" />
        <circle cx="38" cy="48" r="8" fill="#5a5a5a" />
        <circle cx="62" cy="48" r="8" fill="#5a5a5a" />
        <path d="M 48 55 Q 50 52 52 55" stroke="#5a5a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
