
"use client";

import { AppShell } from '@/components/layout/app-shell';
import { SnapYogaPageClient } from '@/components/features/snap-yoga/snap-yoga-page-client';
import { Sparkles } from 'lucide-react';

export default function SnapYogaAnalysisPage() {
  return (
    <AppShell>
      <div className="relative min-h-[calc(100vh-4rem)]">
        <div className="absolute top-0 left-0 right-0 h-[25vh] bg-secondary rounded-b-3xl" />
        <div className="relative z-10 flex flex-col h-full">
            <header className="container mx-auto px-4 pt-8 pb-4 text-primary-foreground">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                    <Sparkles className="h-8 w-8" />
                    Snap Yoga Analysis
                </h1>
                <p className="text-md text-primary/80">Get AI-powered feedback on your poses.</p>
            </header>
            <main className="flex-grow container mx-auto px-4 mt-8">
                <SnapYogaPageClient />
            </main>
        </div>
      </div>
    </AppShell>
  );
}
