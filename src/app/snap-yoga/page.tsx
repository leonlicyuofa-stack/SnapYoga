
"use client";

import { AppShell } from '@/components/layout/app-shell';
import { OnboardingBackground } from '@/components/layout/OnboardingBackground';
import { SnapYogaPageClient } from '@/components/features/snap-yoga/snap-yoga-page-client';

export default function SnapYogaAnalysisPage() {
  return (
    <AppShell>
      <div className="relative min-h-[calc(100vh-4rem)]">
        <OnboardingBackground />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <SnapYogaPageClient />
        </div>
      </div>
    </AppShell>
  );
}
