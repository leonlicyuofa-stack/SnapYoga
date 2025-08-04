
"use client";

import { AppShell } from '@/components/layout/app-shell';
import { SnapYogaPageClient } from '@/components/features/snap-yoga/snap-yoga-page-client';

export default function SnapYogaAnalysisPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <SnapYogaPageClient />
      </div>
    </AppShell>
  );
}
