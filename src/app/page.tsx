import { AppShell } from '@/components/layout/app-shell';
import { SnapYogaPageClient } from '@/components/features/snap-yoga/snap-yoga-page-client';

export default function SnapYogaPage() {
  return (
    <AppShell>
      <SnapYogaPageClient />
    </AppShell>
  );
}
