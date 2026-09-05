"use client"; 

import * as React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Settings, CalendarDays, Trophy, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const getInitials = (email?: string | null, displayName?: string | null) => {
  if (displayName) {
    const names = displayName.split(' ');
    if (names.length > 1) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    return displayName.substring(0, 2).toUpperCase();
  }
  if (email) {
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
};

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const pathname = usePathname(); 
  const { t } = useLanguage();
  const { theme } = useTheme();

  const homeLinkPath = user ? "/dashboard" : "/";
  
  // Routes that should not show the shell AT ALL (no top header, no bottom nav)
  const noShellRoutes = ['/auth/signin', '/auth/signup', '/auth/verify-email', '/'];
  
  if (noShellRoutes.includes(pathname) || pathname.startsWith('/onboarding') || pathname === '/testing-page-1') {
      return (
        <div className="relative flex flex-col min-h-screen">
            {children}
        </div>
      );
  }

  const navItems = [
    { href: homeLinkPath, label: t('navHome'), icon: Home },
    { href: "/snap-yoga", label: "Analyze", icon: Sparkles },
    { href: "/practice-calendar", label: t('navCalendar'), icon: CalendarDays },
    { href: "/challenges", label: t('navChallenges'), icon: Trophy },
    { href: "/profile", label: t('profile'), icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  // Pages that already provide their own top controls — skip the floating
  // theme-toggle + avatar there so nothing is duplicated.
  const ownTopBarRoutes = ['/dashboard', '/snap-yoga', '/practice-calendar', '/challenges', '/challenges/headstand', '/challenges/crow', '/profile', '/mood-tracker'];
  const showTopControls = !ownTopBarRoutes.includes(pathname);

  // Bottom-nav display order (Analyze in the centre) + the active tab drives the
  // rolling indicator position (10% / 30% / 50% / 70% / 90%).
  const navDisplay = [navItems[0], navItems[2], navItems[1], navItems[3], navItems[4]];
  const activeNavIndex = navDisplay.findIndex(it => isActive(it.href));
  const navPct = activeNavIndex >= 0 ? (activeNavIndex + 0.5) * 20 : 50;
  const showNavIndicator = activeNavIndex >= 0;
  const notchMask = `radial-gradient(circle 33px at var(--sy-nx) -2px, transparent 32px, #000 33px)`;

  return (
    <div className="relative min-h-screen font-serif">
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* TOP CONTROLS — just the avatar, floating top-right (no full header,
            no theme toggle — theme is chosen under Settings). Skipped on pages
            that have their own top bar. */}
        {showTopControls && user && (
          <div className="fixed top-4 right-4 z-40">
            <Link href="/profile" aria-label="Profile">
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User avatar'} />
                <AvatarFallback>{getInitials(user.email, user.displayName)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-grow pb-24">
          {children}
        </main>

        {/* BOTTOM NAVIGATION — icons-only bar with a rolling indicator that slides to the active tab */}
        <div
          className="sy-navbar fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
          style={{ width: 'min(340px, calc(100vw - 32px))', height: 78, '--sy-nx': `${navPct}%` } as React.CSSProperties}
        >
          {/* Bar (with a dent under the active tab) */}
          <nav
            aria-label="Primary"
            className="absolute bottom-0 left-0 w-full rounded-full backdrop-blur-xl transition-colors duration-300"
            style={{
              height: 56,
              ...(showNavIndicator ? { maskImage: notchMask, WebkitMaskImage: notchMask } : {}),
              ...(theme === 'dark'
                ? { background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 22px rgba(0,0,0,0.35)' }
                : { background: 'rgba(255,252,248,0.90)', border: '0.5px solid rgba(255,255,255,0.50)', boxShadow: '0 8px 22px rgba(60,40,70,0.18)' }),
            }}
          />

          {/* Rolling indicator circle */}
          {showNavIndicator && (
            <span
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                top: -4, left: 'var(--sy-nx)', transform: 'translateX(-50%)', width: 52, height: 52, zIndex: 2,
                ...(theme === 'dark'
                  ? { background: 'linear-gradient(180deg, rgba(214,178,130,0.98), rgba(193,154,107,0.92))', boxShadow: '0 6px 16px rgba(193,154,107,0.45)' }
                  : { background: '#320E3B', boxShadow: '0 6px 16px rgba(50,14,59,0.40)' }),
              }}
            />
          )}

          {/* Icons */}
          <div className="absolute bottom-0 left-0 w-full flex" style={{ height: 56, zIndex: 3 }}>
            {navDisplay.map((item, i) => {
              const active = i === activeNavIndex;
              const dark = theme === 'dark';
              const isAnalyze = item.href === navItems[1].href;
              const color = active
                ? (dark ? '#1a1210' : 'rgba(255,248,235,0.96)')
                : isAnalyze
                  ? (dark ? 'rgba(214,178,130,1)' : '#320E3B')
                  : (dark ? 'rgba(255,240,215,0.72)' : 'rgba(50,14,59,0.62)');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className="sy-navicon flex-1 flex items-center justify-center active:scale-90"
                  style={{ transform: active ? 'translateY(-28px)' : 'none', color }}
                >
                  <item.icon className="h-[22px] w-[22px]" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
