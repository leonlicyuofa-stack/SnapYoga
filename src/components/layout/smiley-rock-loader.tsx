"use client";

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { SmileyPebbleIcon } from '../icons/smiley-pebble-icon';


interface SmileyRockLoaderProps {
  className?: string;
  text?: string;
}

export function SmileyRockLoader({ className, text }: SmileyRockLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="relative h-16 w-16 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin"></div>
        <SmileyPebbleIcon className="h-8 w-8" />
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
