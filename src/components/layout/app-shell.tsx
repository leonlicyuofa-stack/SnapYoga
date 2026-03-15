"use client"; 

import * as React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, UserCircle, Home, Settings, CalendarDays, Trophy, Languages, Sparkles, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from 'next/navigation'; 
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { SnapYogaLogo } from '../icons/snap-yoga-logo';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOutUser, loading } = useAuth();
  const pathname = usePathname(); 
  const { language, setLanguage, t } = useLanguage();
  const [isSheetOpen, setSheetOpen] = React.useState(false);

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

  const navLinkClasses = (path: string) => 
    cn(
      "flex items-center gap-4 rounded-lg px-4 py-3 text-lg transition-colors hover:bg-white/20",
      pathname === path 
        ? "text-white bg-white/10 font-bold" 
        : "text-white/80 hover:text-white"
    );

  const homeLinkPath = user ? "/dashboard" : "/";
  
  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };
  
  const noShellRoutes = ['/auth/signin', '/auth/signup', '/auth/verify-email', '/'];
  
  const handleSignOut = () => {
    setSheetOpen(false);
    signOutUser();
  }

  if (noShellRoutes.includes(pathname) || pathname.startsWith('/home') || pathname === '/welcome' || pathname.startsWith('/onboarding') || pathname === '/testing-page-1') {
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

  return (
    <div className="relative min-h-screen font-serif text-white">
      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/20 bg-black/20 px-4 backdrop-blur-lg sm:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-full max-sm flex-col p-6 bg-black/80 backdrop-blur-lg border-r-white/20 text-white">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">A list of links to navigate the application.</SheetDescription>
                </SheetHeader>
                <div className="mb-8">
                  <SnapYogaLogo />
                </div>
                <nav className="flex-grow space-y-2">
                  {navItems.map(item => (
                    user || (item.href !== '/practice-calendar' && item.href !== '/challenges' && item.href !== '/profile') 
                    ? (
                      <Link key={item.label} href={item.href} className={navLinkClasses(item.href)} onClick={() => setSheetOpen(false)}>
                          <item.icon className="h-6 w-6" />
                          <span>{item.label}</span>
                      </Link>
                    ) : null
                  ))}
                </nav>
                {user && (
                  <div className="mt-auto">
                      <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-white/10">
                          <Avatar className="h-12 w-12 border-2 border-background">
                              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User avatar'} />
                              <AvatarFallback>{getInitials(user.email, user.displayName)}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-semibold">{user.displayName || 'User'}</p>
                              <p className="text-xs text-white/80">{user.email}</p>
                          </div>
                      </div>
                      <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-lg gap-4 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10">
                          <LogOut className="h-6 w-6"/>
                          {t('signOut')}
                      </Button>
                  </div>
                )}
            </SheetContent>
          </Sheet>
          <div className="hidden md:block">
              <SnapYogaLogo />
          </div>
           <nav className="hidden items-center gap-2 md:flex">
               {navItems.map(item => (
                    user || (item.href !== '/practice-calendar' && item.href !== '/challenges' && item.href !== '/profile') 
                    ? (
                      <Button key={item.label} variant={pathname === item.href ? 'outline' : 'ghost'} asChild className={cn(
                        'text-white hover:bg-white/20', 
                        pathname === item.href && 'bg-white/90 text-black hover:bg-white hover:text-black'
                      )}>
                          <Link href={item.href}>{item.label}</Link>
                      </Button>
                    ) : null
              ))}
          </nav>
          {user && (
               <Avatar className="h-10 w-10 border-2 border-white/20 hidden md:block">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User avatar'} />
                  <AvatarFallback>{getInitials(user.email, user.displayName)}</AvatarFallback>
              </Avatar>
          )}
        </header>

        <main className="flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
}
