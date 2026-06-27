"use client";

import { cn } from '@/lib/utils';

interface OnboardingHeaderProps {
  title?: string;
  subtitle?: string;
  /** Total number of onboarding steps; renders a progress bar when set. */
  steps?: number;
  /** Zero-based index of the current step. */
  currentStep?: number;
  className?: string;
}

/**
 * Shared brand header for the auth + onboarding flow.
 * Renders the SnapYoga wordmark, tagline and divider exactly like the homepage,
 * plus an optional step indicator and a serif title / sleek subtitle.
 */
export function OnboardingHeader({
  title,
  subtitle,
  steps,
  currentStep = 0,
  className,
}: OnboardingHeaderProps) {
  return (
    <header className={cn('flex flex-col items-center text-center', className)}>
      <span className="sy-wordmark" style={{ fontSize: 28 }}>SnapYoga</span>
      <span className="sy-tagline" style={{ marginTop: 3 }}>Listen · Guide · Activate</span>
      <div className="sy-divider" style={{ margin: '8px 0 16px' }} />

      {typeof steps === 'number' && steps > 0 && (
        <div className="flex gap-1 mb-5" aria-label={`Step ${currentStep + 1} of ${steps}`}>
          {Array.from({ length: steps }).map((_, i) => (
            <span
              key={i}
              className={cn('rounded-full transition-all', i <= currentStep ? 'sy-step-active' : 'sy-step')}
              style={{
                height: 3,
                width: i === currentStep ? 20 : 8,
              }}
            />
          ))}
        </div>
      )}

      {title && (
        <h1 className="sy-title" style={{ fontSize: 24, margin: 0 }}>{title}</h1>
      )}
      {subtitle && (
        <p className="sy-subtitle" style={{ fontSize: 12, letterSpacing: '0.04em', margin: '4px 0 0' }}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
