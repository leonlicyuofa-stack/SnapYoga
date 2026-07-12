"use client";

import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { isDark } = useTheme();
  const badgeBg = isDark ? 'rgba(214,178,130,0.95)' : '#320E3B';
  const badgeColor = isDark ? '#1a1210' : 'rgba(255,248,235,0.96)';
  return (
    <header className={cn('relative flex flex-col items-center text-center', className)}>
      <div className="sy-echo" aria-hidden="true">
        <div className="sy-echo-ring" />
        <div className="sy-echo-spin"><div className="sy-echo-dot" /></div>
      </div>
      <span className="sy-wordmark" style={{ fontSize: 28, position: 'relative' }}>SnapYoga</span>
      <span className="sy-tagline" style={{ marginTop: 3 }}>Listen · Guide · Activate</span>
      <div className="sy-divider" style={{ margin: '8px 0 16px' }} />

      {typeof steps === 'number' && steps > 0 && (
        <div className="flex items-center gap-1.5 mb-5" aria-label={`Step ${currentStep + 1} of ${steps}`}>
          <span
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: badgeBg, color: badgeColor,
              fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700, fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {currentStep + 1}
          </span>
          {Array.from({ length: steps }).map((_, i) => (
            <span
              key={i}
              className={cn('rounded-full transition-all', i <= currentStep ? 'sy-step-active' : 'sy-step')}
              style={{ height: 6, width: 20 }}
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
