"use client";

import { cn } from "@/lib/utils";

interface RightArrowIconProps {
  animationState: 'idle' | 'clicked';
  className?: string;
}

export function RightArrowIcon({ animationState, className }: RightArrowIconProps) {

  const groupClasses = cn(
    "relative w-10 h-10 cursor-pointer group",
    {
      'animate-move-right-and-fade': animationState === 'clicked',
    },
    className,
  );

  return (
    <div className={groupClasses}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Get Started</title>
        {/* New Arrow Shape */}
        <g 
          className="transition-transform duration-300 group-hover:translate-x-1"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M20 40 H 60" />
          <path d="M45 25 C 55 30, 60 35, 60 40" />
          <path d="M45 55 C 55 50, 60 45, 60 40" />
        </g>
      </svg>
    </div>
  );
}
