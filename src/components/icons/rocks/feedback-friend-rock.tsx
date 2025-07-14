
import type { SVGProps } from 'react';

export function FeedbackFriendRock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect x="20" y="30" width="60" height="40" rx="20" fill="#fdd835"/>
        <rect x="20" y="30" width="60" height="40" rx="20" stroke="black" strokeWidth="2"/>
        <ellipse cx="40" cy="50" rx="4" ry="6" fill="white"/>
        <circle cx="40" cy="50" r="1.5" fill="black"/>
        <ellipse cx="60" cy="50" rx="4" ry="6" fill="white"/>
        <circle cx="60" cy="50" r="1.5" fill="black"/>
        <path d="M45,58 L55,58" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

    