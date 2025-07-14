
import type { SVGProps } from 'react';

export function WelcomeRock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="50" cy="60" rx="35" ry="25" fill="#e53935" />
      <ellipse cx="50" cy="60" rx="35" ry="25" stroke="black" strokeWidth="2" />
      <ellipse cx="40" cy="55" rx="5" ry="8" fill="white" />
      <circle cx="40" cy="55" r="2" fill="black" />
      <ellipse cx="60" cy="55" rx="5" ry="8" fill="white" />
      <circle cx="60" cy="55" r="2" fill="black" />
      <path d="M42 68 Q 50 78 58 68" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

    