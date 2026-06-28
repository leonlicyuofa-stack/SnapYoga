"use client"; 

import * as React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, UserCircle, Home, Settings, CalendarDays, Trophy, Languages, Sparkles, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from 'next/navigation'; 
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { SnapYogaLogo } from '../icons/snap-yoga-logo';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOutUser, loading } = useAuth();
  const pathname = usePathname(); 
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();

  const getInitials = (email?: string | null, displayName?: string | null) => {
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
  };

  const homeLinkPath = user ? "/dashboard" : "/";
  
  // Routes that should not show the shell AT ALL (no top header, no bottom nav)
  const noShellRoutes = ['/auth/signin', '/auth/signup', '/auth/verify-email', '/'];
  
  if (noShellRoutes.includes(pathname) || pathname === '/welcome' || pathname.startsWith('/onboarding') || pathname === '/testing-page-1') {
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

  // List of routes where the top header is hidden because they provide their own header/toggle
  const hideHeaderRoutes = ['/dashboard', '/snap-yoga', '/practice-calendar', '/challenges', '/challenges/headstand', '/challenges/crow', '/profile', '/mood-tracker'];

  return (
    <div className="relative min-h-screen font-serif">
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* HEADER - Hidden on main routes to prevent "double header" */}
        {!hideHeaderRoutes.includes(pathname) && (
          <header className={cn(
            "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur-lg sm:px-6 transition-colors duration-300",
            theme === 'dark' 
              ? "bg-[rgba(193,154,107,0.07)] border-[rgba(193,154,107,0.18)] text-white" 
              : "bg-white/30 border-black/10 text-black"
          )}>
            <div className="flex items-center">
                <SnapYogaLogo />
            </div>

            <nav className="hidden items-center gap-2 md:flex">
                {navItems.map(item => (
                      user || (item.href !== '/practice-calendar' && item.href !== '/challenges' && item.href !== '/profile') 
                      ? (
                        <Button key={item.label} variant={isActive(item.href) ? 'outline' : 'ghost'} asChild className={cn(
                          'text-current hover:bg-current/10 transition-all font-medium', 
                          isActive(item.href) && (theme === 'dark' ? 'bg-white/90 text-black hover:bg-white border-none' : 'bg-black/90 text-white hover:bg-black border-none')
                        )}>
                            <Link href={item.href}>{item.label}</Link>
                        </Button>
                      ) : null
                ))}
            </nav>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                  <Avatar className="h-10 w-10 border-2 border-primary/30 hidden md:block">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User avatar'} />
                      <AvatarFallback>{getInitials(user.email, user.displayName)}</AvatarFallback>
                  </Avatar>
              )}
            </div>
          </header>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-grow pb-24">
          {children}
        </main>

        {/* BOTTOM NAVIGATION — floating pill; the active tab expands with its label */}
        <nav
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full px-2 py-2 backdrop-blur-xl transition-colors duration-300"
          style={theme === 'dark'
            ? { background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 22px rgba(0,0,0,0.35)' }
            : { background: 'rgba(255,252,248,0.90)', border: '0.5px solid rgba(255,255,255,0.50)', boxShadow: '0 8px 22px rgba(60,40,70,0.18)' }}
        >
          {[navItems[0], navItems[2], navItems[1], navItems[3], navItems[4]].map((item) => {
            const active = isActive(item.href);
            const dark = theme === 'dark';
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex items-center justify-center gap-[7px] rounded-full transition-all duration-300 active:scale-90"
                style={active
                  ? {
                      height: 44, padding: '0 16px',
                      background: dark ? 'rgba(193,154,107,0.20)' : 'rgba(50,14,59,0.12)',
                      border: `0.5px solid ${dark ? 'rgba(193,154,107,0.40)' : 'transparent'}`,
                      color: dark ? 'rgba(214,178,130,1)' : '#320E3B',
                    }
                  : {
                      height: 44, width: 44,
                      color: dark ? 'rgba(255,240,215,0.40)' : 'rgba(50,14,59,0.50)',
                    }}
              >
                <item.icon className="h-[22px] w-[22px] shrink-0" />
                {active && (
                  <span
                    className="text-[13px] font-sans font-medium whitespace-nowrap"
                    style={{ color: dark ? 'rgba(255,240,215,0.96)' : '#320E3B' }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
