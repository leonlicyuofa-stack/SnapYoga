"use client";

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';

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
}: OnboardingScaffoldProps) {
  return (
    <div className={cn('relative min-h-screen', outerClassName)}>
      {onBack && (
        <Button
          onClick={onBack}
          variant="ghost"
          className="absolute top-4 left-4 rounded-full h-12 w-12 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      )}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <OnboardingHeader title={title} subtitle={subtitle} className="mb-6" />
          <div className={cn('sy-card backdrop-blur-lg rounded-2xl p-8 w-full', cardClassName)}>
            {children}
          </div>
          {next && (
            <div className="w-full flex justify-end mt-5 min-h-[3.5rem] items-center">
              {next}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
