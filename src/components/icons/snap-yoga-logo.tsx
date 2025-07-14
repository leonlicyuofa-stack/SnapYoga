
import { WelcomeRock } from "./rocks/welcome-rock";

export function SnapYogaLogo() {
  return (
    <div className="flex items-center space-x-2" aria-label="SnapYoga Home">
      <WelcomeRock className="h-10 w-10 text-primary" />
      <span className="text-2xl font-bold tracking-tight text-primary">SnapYoga</span>
    </div>
  );
}

    