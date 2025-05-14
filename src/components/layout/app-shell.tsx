import type { ReactNode } from 'react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import Link from 'next/link';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <SnapYogaLogo />
          </Link>
          {/* Future navigation items can go here */}
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SnapYoga. Improve your practice, one pose at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
