
"use client"; 

import type { ReactNode } from 'react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, UserCircle, Loader2, Home, Settings, CalendarDays, Trophy, Languages, Sparkles, Plus, ListOrdered, User, DollarSign } from 'lucide-react';
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
        ? "text-primary"
        : "text-muted-foreground hover:text-primary"
    );

  const homeLinkPath = user ? "/dashboard" : "/";
  
  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };
  
  const noShellRoutes = ['/auth/signin', '/auth/signup', '/auth/verify-email', '/', '/home'];
  
  const isDashboard = pathname === '/dashboard';

  if (noShellRoutes.includes(pathname)) {
      return (
        <div className="relative flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
            {children}
        </div>
      );
  }

  // A different shell for the new dashboard UI
  if (isDashboard) {
      return (
        <div className="relative flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
            <main className="flex-grow mb-20">
                {children}
            </main>
            <footer className="btm-nav h-20 shadow-[-2px_-1px_10px_rgba(0,0,0,0.08)]">
                <Link href={homeLinkPath} className={navLinkClasses(homeLinkPath)}>
                    <Home className="h-6 w-6" />
                    <span className="btm-nav-label">Home</span>
                </Link>
                <Link href="/tasks" className={navLinkClasses("/tasks")}>
                    <ListOrdered className="h-6 w-6" />
                    <span className="btm-nav-label">My Task</span>
                </Link>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center -mt-8 shadow-lg">
                   <Button asChild variant="ghost" size="icon" className="w-14 h-14 rounded-full text-primary-foreground hover:bg-primary/90">
                     <Link href="/snap-yoga">
                        <Plus className="h-8 w-8" />
                     </Link>
                   </Button>
                </div>
                <Link href="/payment" className={navLinkClasses("/payment")}>
                    <DollarSign className="h-6 w-6" />
                    <span className="btm-nav-label">Payment</span>
                </Link>
                <Link href="/profile" className={navLinkClasses("/profile")}>
                    <User className="h-6 w-6" />
                    <span className="btm-nav-label">Profile</span>
                </Link>
            </footer>
        </div>
      )
  }

  // Original AppShell for other pages
  return (
    <div className="relative flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
       <div className="absolute inset-0 z-[-1] overflow-hidden bg-background">
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full -top-32 -left-32 animate-cartoon-float-1" />
          <div className="absolute w-80 h-80 bg-accent/10 rounded-full -bottom-24 -right-24 animate-cartoon-float-2" />
          <div className="absolute w-72 h-72 bg-secondary/20 rounded-full bottom-1/2 left-1/3 animate-cartoon-float-3" />
        </div>

      <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm shadow-sm">
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

          <Link href="/snap-yoga" className={cn(navLinkClasses('/snap-yoga'), "text-muted-foreground hover:text-primary")}>
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
