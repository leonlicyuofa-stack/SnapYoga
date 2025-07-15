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
      <SmileyPebbleIcon className="h-8 w-8 animate-pebble-pulse" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
