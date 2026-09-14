"use client";

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingThemeToggle } from '@/components/onboarding/onboarding-theme-toggle';
import { GlossyButton } from '@/components/ui/glossy-button';

interface OnboardingScaffoldProps {
  title?: string;
  subtitle?: string;
  /** When provided, renders the back arrow at the top-left, outside the card. */
  onBack?: () => void;
  /** Optional "next" control rendered in a fixed row below the card (never overlapping it). */
  next?: ReactNode;
  /** Card body. */
  children: ReactNode;
  cardClassName?: string;
  outerClassName?: string;
  /** 1-based step number; renders the onboarding progress bar in the header. */
  step?: number;
  /** Total number of onboarding steps. */
  totalSteps?: number;
}

/**
 * Consistent layout for every onboarding step:
 *  - brand wordmark + tagline live OUTSIDE the card
 *  - one shared card width (max-w-2xl)
 *  - back arrow always top-left, next arrow always below the card on the right
 */
export function OnboardingScaffold({
  title,
  subtitle,
  onBack,
  next,
  children,
  cardClassName,
  outerClassName,
  step,
  totalSteps,
}: OnboardingScaffoldProps) {
  return (
    <div className={cn('relative min-h-screen', outerClassName)}>
      <OnboardingThemeToggle />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <OnboardingHeader
            className="mb-6"
            steps={totalSteps}
            currentStep={step ? step - 1 : 0}
          />
          <div className={cn('sy-card backdrop-blur-lg rounded-2xl p-8 w-full', cardClassName)}>
            {(title || subtitle) && (
              <div className="text-center mb-6">
                {title && <h1 className="sy-card-heading" style={{ fontSize: 18, margin: 0 }}>{title}</h1>}
                {subtitle && <p className="sy-subtitle" style={{ fontSize: 12, letterSpacing: '0.04em', margin: '3px 0 0' }}>{subtitle}</p>}
              </div>
            )}
            {children}
            {(onBack || next) && (
              <div className="flex items-center justify-between mt-6">
                {onBack ? (
                  <GlossyButton type="button" variant="ghost" onClick={onBack} icon={<ArrowLeft className="h-4 w-4" />}>
                    Back
                  </GlossyButton>
                ) : <span />}
                {next ?? <span />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
