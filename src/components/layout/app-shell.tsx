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

        {/* BOTTOM NAVIGATION - icons only (label on the active tab), Analyze as a center action */}
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around border-t px-3 backdrop-blur-xl transition-colors duration-300",
          theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-white/60 border-black/10 text-black"
        )}>
          {[navItems[0], navItems[2], null, navItems[3], navItems[4]].map((item, i) => {
            // Center slot: the Analyze action as a raised FAB
            if (item === null) {
              return (
                <Link key="analyze-fab" href="/snap-yoga" aria-label="Analyze" className="flex items-center justify-center flex-1 h-full">
                  <div
                    className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full active:scale-90 transition-transform"
                    style={theme === 'dark'
                      ? { background: 'rgba(193,154,107,0.92)', boxShadow: '0 6px 18px rgba(193,154,107,0.35)' }
                      : { background: '#320E3B', boxShadow: '0 6px 18px rgba(50,14,59,0.40)' }}
                  >
                    <Sparkles className="h-6 w-6" style={{ color: theme === 'dark' ? '#1a1210' : 'rgba(255,248,235,0.95)' }} />
                  </div>
                </Link>
              );
            }
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-90"
              >
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-colors duration-300",
                    active
                      ? (theme === 'dark' ? "text-primary" : "text-[#320E3B]")
                      : (theme === 'dark' ? "text-white/40" : "text-[rgba(50,14,59,0.5)]")
                  )}
                />
                {active && (
                  <span className={cn(
                    "text-[9px] uppercase tracking-widest font-sans font-semibold",
                    theme === 'dark' ? "text-primary" : "text-[#320E3B]"
                  )}>
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
