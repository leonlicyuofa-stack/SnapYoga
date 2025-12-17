
"use client"; 

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, UserCircle, Home, Settings, CalendarDays, Trophy, Languages, Sparkles, MoreHorizontal, Search, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from 'next/navigation'; 
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { SmileyRockLoader } from './smiley-rock-loader';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOutUser, loading } = useAuth();
  const pathname = usePathname(); 
  const router = useRouter();
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
      "flex flex-col items-center justify-center h-full w-full gap-1 p-2 rounded-md transition-colors hover:bg-accent/50",
      pathname === path 
        ? "text-primary bg-primary/10 font-bold" 
        : "text-muted-foreground hover:text-primary"
    );

  const homeLinkPath = user ? "/dashboard" : "/";
  
  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };
  
  const noShellRoutes = ['/auth/signin', '/auth/signup', '/auth/verify-email', '/'];
  const noHeaderRoutes = ['/welcome', '/dashboard'];
  
  const showOnboardingHeader = pathname.startsWith('/onboarding/');
  const noFooterRoutes = ['/welcome', ...showOnboardingHeader ? [pathname] : []];
  
  if (noShellRoutes.includes(pathname) || pathname.startsWith('/home') || pathname === '/page') {
      return (
        <div className="relative flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
            {children}
        </div>
      );
  }

  const userMenuItems = (
    <>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium leading-none">
            {user?.displayName || t('welcome')}
        </p>
        <p className="text-xs leading-none text-muted-foreground">
            {user?.email}
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
    </>
  )

  const renderHeader = () => {
    if (noHeaderRoutes.includes(pathname)) return null;

    if (showOnboardingHeader) {
        return (
             <header className="fixed top-0 z-40 w-full">
                <div className="container mx-auto flex h-20 items-center justify-start px-4 sm:px-6 lg:px-8">
                    <Button variant="ghost" size="icon" className="rounded-full bg-card/20 backdrop-blur-sm h-12 w-12" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </div>
             </header>
        );
    }
    
    // Default Header
    return null;
  }


  return (
    <div className="relative flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
      {renderHeader()}

      <main className={cn("flex-grow", !noFooterRoutes.includes(pathname) && "mb-20")}>
        {children}
      </main>

      {!noFooterRoutes.includes(pathname) && (
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

            <Link href="/snap-yoga" className={navLinkClasses('/snap-yoga')}>
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
                {user?.photoURL ? (
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={user.photoURL} alt={user.displayName || 'User avatar'} />
                        <AvatarFallback>{getInitials(user.email, user.displayName)}</AvatarFallback>
                    </Avatar>
                ) : (
                    <UserCircle className="h-6 w-6" />
                )}
                <span className="btm-nav-label">{t('profile')}</span>
            </Link>
        </footer>
       )}
    </div>
  );
}
