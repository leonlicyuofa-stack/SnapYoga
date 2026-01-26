
"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { YogaMatMascot } from '../icons/YogaMatMascot';


interface SmileyRockLoaderProps {
  className?: string;
  text?: string;
}

const LoadingDot = ({ delay }: { delay: string }) => (
    <div 
        className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" 
        style={{ animationDelay: delay }}
    ></div>
);

export function SmileyRockLoader({ className, text }: SmileyRockLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="flex items-center justify-center gap-2">
        <YogaMatMascot className="h-16 w-16" />
      </div>
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}
