"use client";

import { AppShell } from '@/components/layout/app-shell';
import { SnapYogaPageClient } from '@/components/features/snap-yoga/snap-yoga-page-client';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function SnapYogaAnalysisPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h1 
                    style={{ 
                      fontFamily: "'Cormorant Garamond', Georgia, serif", 
                      fontWeight: 600, 
                      color: 'rgba(255,240,215,0.92)' 
                    }}
                    className="text-3xl flex items-center gap-3"
                  >
                      <Sparkles className="h-8 w-8" style={{ color: 'rgba(193,154,107,0.85)' }} />
                      Snap Yoga Analysis
                  </h1>
                  <p 
                    style={{ color: 'rgba(255,240,215,0.40)', fontStyle: 'italic' }}
                    className="text-md mt-1"
                  >
                    Get AI-powered feedback on your poses.
                  </p>
                  <div style={{ width: 26, height: 1, background: 'rgba(193,154,107,0.22)', marginTop: 5 }} />
                </div>
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(193,154,107,0.30)',
                    background: 'rgba(193,154,107,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {isDark
                    ? <Sun style={{ width: 14, height: 14, color: 'rgba(193,154,107,0.75)' }} />
                    : <Moon style={{ width: 14, height: 14, color: 'rgba(193,154,107,0.75)' }} />
                  }
                </button>
              </div>
          </header>
          <main>
              <SnapYogaPageClient />
          </main>
      </div>
    </AppShell>
  );
}
