
import type { SVGProps } from 'react';

export function ImproveFlexibilityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="#27272A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Arm pointing up */}
        <path d="M55,30 C60,20 65,10 70,5" fill="none"/>

        {/* Arm in prayer pose */}
        <path d="M50,60 C40,55 35,60 35,65 L45,70" fill="none"/>

        {/* Main Body */}
        <path 
          d="M62.5,90.5 C60.5,95.5 40.5,95.5 38.5,90.5 C35.5,85.5 42.5,70.5 42.5,60.5 C42.5,45.5 35.5,35.5 45.5,25.5 C52.5,18.5 60.5,20.5 65.5,30.5 C72.5,45.5 70.5,50.5 65.5,60.5 C60.5,70.5 70.5,80.5 62.5,90.5Z"
          fill="#FDE68A"
        />
        
        {/* Blushes */}
        <circle cx="58" cy="52" r="5" fill="#FCCACA" opacity="0.7" stroke="none"/>

        {/* Face */}
        <circle cx="53" cy="43" r="2" fill="#27272A" stroke="none" />
        <circle cx="62" cy="43" r="2" fill="#27272A" stroke="none" />
        <path d="M 56,50 Q 58.5,54 61,50" strokeWidth="2" fill="none"/>
      </g>
    </svg>
  );
}
