
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
        className="drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]"
      >
        <title>Get Started</title>
        {/* Circle */}
        <circle 
            cx="40" 
            cy="40" 
            r="37" 
            stroke="currentColor" 
            strokeWidth="3"
            className="transition-transform duration-300 group-hover:scale-105"
        />
        {/* Arrow */}
        <path
          d="M35 28 L47 40 L35 52"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </svg>
    </div>
  );
}
