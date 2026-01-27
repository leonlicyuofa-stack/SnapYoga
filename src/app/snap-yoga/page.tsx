
"use client";

import { AppShell } from '@/components/layout/app-shell';
import { SnapYogaPageClient } from '@/components/features/snap-yoga/snap-yoga-page-client';
import { Sparkles } from 'lucide-react';

export default function SnapYogaAnalysisPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="h-8 w-8" />
                  Snap Yoga Analysis
              </h1>
              <p className="text-md text-white/80">Get AI-powered feedback on your poses.</p>
          </header>
          <main>
              <SnapYogaPageClient />
          </main>
      </div>
    </AppShell>
  );
}
