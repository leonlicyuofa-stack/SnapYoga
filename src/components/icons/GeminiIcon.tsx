
"use client";

import { cn } from "@/lib/utils";

interface GeminiIconProps {
  animationState: 'idle' | 'glowing' | 'streaking';
}

export function GeminiIcon({ animationState }: GeminiIconProps) {

  const groupClasses = cn(
    "relative w-20 h-20 cursor-pointer group",
    {
      'animate-soft-glow-expand': animationState === 'glowing',
      'animate-streak-out': animationState === 'streaking',
    }
  );

  return (
    <div className={groupClasses}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
      >
        <title>Get Started</title>
        <path
          d="M60 20C48.9543 20 40 28.9543 40 40C40 51.0457 48.9543 60 60 60"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
              "transition-all duration-300",
              "group-hover:translate-x-1",
              { 'animate-shimmer': animationState === 'idle' }
          )}
        />
        <path
          d="M20 60C31.0457 60 40 51.0457 40 40C40 28.9543 31.0457 20 20 20"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
              "transition-all duration-300",
              "group-hover:-translate-x-1",
              { 'animate-shimmer animation-delay-[-0.5s]': animationState === 'idle' }
          )}
        />
      </svg>
    </div>
  );
}
