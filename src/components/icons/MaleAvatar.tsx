
import type { SVGProps } from 'react';

export function MaleAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path 
        d="M 85,50 C 95,75 75,95 50,95 C 25,95 5,75 15,50 C 25,25 40,15 50,20 C 60,25 75,25 85,50 Z"
        fill="#FFC700"
      />
      {/* Eyes */}
      <circle cx="45" cy="50" r="4" fill="#2C3E50" />
      <circle cx="65" cy="50" r="4" fill="#2C3E50" />
      {/* Smile */}
      <path d="M 40 65 C 45 80, 65 80, 70 65" stroke="#2C3E50" strokeWidth="3" fill="#E57373" strokeLinecap="round" />
    </svg>
  );
}
