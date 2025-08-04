import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface InteractivePebbleProps extends SVGProps<SVGSVGElement> {
  isRevealed: boolean;
}

export function InteractivePebble({ isRevealed, ...props }: InteractivePebbleProps) {
  return (
    <svg width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M84.7,55.4C82.4,60.2,65.3,64.3,50,64.3s-32.4-4.1-34.7-8.9c-2.3-4.8,2.7-14.5,17.4-16.7c14.7-2.2,34.3-1.1,44.7,4.3C88.1,48.2,87,50.6,84.7,55.4z"
        className={cn(
          "stroke-2 transition-all duration-300",
          isRevealed
            ? "fill-primary/20 stroke-primary"
            : "fill-muted stroke-muted-foreground/50 group-hover:fill-primary/10 group-hover:stroke-primary/80"
        )}
      />
    </svg>
  );
}
