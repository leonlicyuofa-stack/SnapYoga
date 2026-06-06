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
  
  // Routes that should not show the header/navigation shell
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

  return (
    <div className="relative min-h-screen font-serif">
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className={cn(
          "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur-lg sm:px-6 transition-colors duration-300",
          theme === 'dark' ? "bg-black/20 border-white/10 text-white" : "bg-white/30 border-black/10 text-black"
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

        {/* MAIN CONTENT */}
        <main className="flex-grow pb-24 md:pb-0">
          {children}
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around border-t px-2 backdrop-blur-xl md:hidden transition-colors duration-300",
          theme === 'dark' ? "bg-black/40 border-white/10 text-white" : "bg-white/60 border-black/10 text-black"
        )}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link 
                key={item.label} 
                href={item.href} 
                className="flex flex-col items-center justify-center gap-1 w-full h-full transition-all active:scale-90"
              >
                <item.icon 
                  className={cn(
                    "h-6 w-6 transition-colors duration-300",
                    active ? "text-primary fill-primary/10" : (theme === 'dark' ? "text-white/40" : "text-black/40")
                  )} 
                />
                <span className={cn(
                  "text-[10px] uppercase tracking-widest font-sans font-semibold transition-colors duration-300",
                  active ? "text-primary" : (theme === 'dark' ? "text-white/30" : "text-black/30")
                )}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-2 h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
