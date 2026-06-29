"use client";

import * as React from 'react';
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { SearchPanel } from '@/components/layout/search-panel';
import { NotificationsPanel } from '@/components/layout/notifications-panel';

function getInitials(email?: string | null, displayName?: string | null) {
  if (displayName) {
    const names = displayName.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }
  if (email) {
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

/**
 * Shared top-bar action icons (search · notifications · profile) used on the
 * main app routes whose AppShell header is hidden. Right-aligned by default.
 */
export function TopBarIcons({ className }: { className?: string }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [panel, setPanel] = React.useState<'search' | 'notifications' | null>(null);
  const iconColor = isDark ? 'rgba(255,240,215,0.82)' : 'rgba(50,14,59,0.85)';
  const profileBg = isDark ? 'rgba(193,154,107,0.85)' : 'rgba(50,14,59,0.85)';
  const profileFg = isDark ? '#1a1210' : 'rgba(255,248,235,0.95)';

  const iconBtn: React.CSSProperties = {
    color: iconColor,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div className={cn('flex items-center justify-end gap-4', className)}>
      <button type="button" aria-label="Search" onClick={() => setPanel('search')} className="transition-opacity hover:opacity-70" style={iconBtn}>
        <Search className="h-5 w-5" />
      </button>
      <button type="button" aria-label="Notifications" onClick={() => setPanel('notifications')} className="relative transition-opacity hover:opacity-70" style={iconBtn}>
        <Bell className="h-5 w-5" />
        <span style={{ position: 'absolute', top: -1, right: -1, width: 7, height: 7, borderRadius: '50%', background: isDark ? 'rgba(193,154,107,0.95)' : '#320E3B', border: `1.5px solid ${isDark ? 'rgba(13,16,22,0.9)' : 'rgba(200,200,210,0.9)'}` }} />
      </button>
      <Link href="/profile" aria-label="Profile" className="transition-opacity hover:opacity-80">
        <Avatar style={{ width: 30, height: 30, border: `1.5px solid ${isDark ? 'rgba(193,154,107,0.40)' : 'rgba(50,14,59,0.40)'}` }}>
          <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'Profile'} />
          <AvatarFallback style={{ background: profileBg, color: profileFg, fontSize: 12, fontWeight: 600 }}>
            {getInitials(user?.email, user?.displayName)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <SearchPanel open={panel === 'search'} onClose={() => setPanel(null)} />
      <NotificationsPanel open={panel === 'notifications'} onClose={() => setPanel(null)} />
    </div>
  );
}
