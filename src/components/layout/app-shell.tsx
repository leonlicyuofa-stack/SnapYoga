
"use client"; 

import type { ReactNode } from 'react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, UserCircle, Loader2, Home, Settings, CalendarDays, Trophy, Languages, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation'; 
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { SmileyPebbleIcon } from '../icons/smiley-pebble-icon';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOutUser, loading } = useAuth();
  const pathname = usePathname(); 
  const { language, setLanguage, t } = useLanguage();

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
      "flex flex-col items-center justify-center h-full w-full gap-1 p-2 rounded-md transition-colors",
      pathname === path 
        ? "text-primary bg-primary/10" 
        : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
    );

  const homeLinkPath = user ? "/dashboard" : "/";
  
  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };
  
  const noShellRoutes = ['/auth/signin', '/auth/signup', '/auth/verify-email', '/'];
  
  if (noShellRoutes.includes(pathname)) {
      return (
        <div className="relative flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
            {children}
        </div>
      );
  }

  return (
    <div className="relative flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-breathing-bg overflow-hidden">
            
        </div>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={user ? "/dashboard" : "/"} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <SnapYogaLogo />
          </Link>
          
          <div className="flex items-center space-x-2">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                      <AvatarFallback>{getInitials(user.email, user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || t('welcome')}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="cursor-pointer">
                     <a onClick={handleLanguageSwitch}>
                       <Languages className="mr-2 h-4 w-4" />
                       <span>Bahasa Indonesia</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOutUser} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               <Button asChild className="h-9 px-4 py-2">
                  <Link href="/auth/signup">
                    <UserCircle className="mr-2 h-5 w-5" />
                    {t('signUp')}
                  </Link>
                </Button>
            )}
            </div>
        </div>
      </header>

      <main className="flex-grow mb-20">
        {children}
      </main>

       <footer className="btm-nav">
          <Link href={homeLinkPath} className={navLinkClasses(homeLinkPath)}>
            <Home className="h-6 w-6" />
            <span className="btm-nav-label">{t('navHome')}</span>
          </Link>
          
          {user && (
            <Link href="/practice-calendar" className={navLinkClasses("/practice-calendar")}>
                <CalendarDays className="h-6 w-6" />
                <span className="btm-nav-label">{t('navCalendar')}</span>
            </Link>
          )}

          <Link href="/snap-yoga" className={cn(navLinkClasses('/snap-yoga'), "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground scale-110 rounded-lg shadow-lg -translate-y-2 border-4 border-background")}>
            <Sparkles className="h-6 w-6" />
            <span className="btm-nav-label">Analyze</span>
          </Link>

          {user && (
            <Link href="/challenges" className={navLinkClasses("/challenges")}>
                <Trophy className="h-6 w-6" />
                <span className="btm-nav-label">{t('navChallenges')}</span>
            </Link>
          )}

          <Link href="/profile" className={navLinkClasses("/profile")}>
            <UserCircle className="h-6 w-6" />
            <span className="btm-nav-label">{t('profile')}</span>
          </Link>
      </footer>
    </div>
  );
}
