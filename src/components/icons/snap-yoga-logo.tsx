
import { Camera, Sparkles } from 'lucide-react';

export function SnapYogaLogo() {
  return (
    <div className="flex items-center space-x-1" aria-label="SnapYoga Home">
      <Sparkles className="h-7 w-7 text-primary" />
      <Camera className="h-7 w-7 text-primary" />
      <span className="ml-2 text-2xl font-bold tracking-tight text-primary">SnapYoga</span>
    </div>
  );
}
