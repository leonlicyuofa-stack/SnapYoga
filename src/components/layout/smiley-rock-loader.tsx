
import { WelcomeRock } from '@/components/icons/rocks/welcome-rock';
import { cn } from '@/lib/utils';

interface SmileyRockLoaderProps {
  className?: string;
  text?: string;
}

export function SmileyRockLoader({ className, text }: SmileyRockLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="flex items-end justify-center gap-2 h-12">
        <WelcomeRock
          className="h-8 w-8 text-primary animate-rock-jump"
          style={{ animationDelay: '0s' }}
        />
        <WelcomeRock
          className="h-8 w-8 text-primary animate-rock-jump"
          style={{ animationDelay: '0.2s' }}
        />
        <WelcomeRock
          className="h-8 w-8 text-primary animate-rock-jump"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

    