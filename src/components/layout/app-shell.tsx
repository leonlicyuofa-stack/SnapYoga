
"use client"; 

import type { ReactNode } from 'react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, UserCircle, Loader2, Home, Settings, CalendarDays, Trophy, Languages } from 'lucide-react';
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
import { PenguinIcon } from '@/components/icons/penguin-icon';
import { LadybirdIcon } from '@/components/icons/ladybird-icon';
import { AvocadoIcon } from '@/components/icons/avocado-icon';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';


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
      "flex items-center",
      pathname === path ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
    );

  const homeLinkPath = user ? "/dashboard" : "/home";
  
  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
       {/* Animated Background */}
       <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-breathing-bg">
            <PenguinIcon className="absolute top-1/4 left-1/4 w-32 h-32 text-foreground/10 animate-float-1" />
            <LadybirdIcon className="absolute bottom-1/4 right-1/4 w-24 h-24 text-destructive/20 animate-float-2" />
            <AvocadoIcon className="absolute bottom-1/2 right-1/3 w-28 h-28 text-primary/10 animate-float-3" />
            <SmileyPebbleIcon className="absolute top-1/3 left-1/2 w-20 h-20 text-accent/20 animate-float-4" />
        </div>

      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={user ? "/dashboard" : "/home"} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <SnapYogaLogo />
          </Link>
          
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" asChild className={navLinkClasses(homeLinkPath)}>
              <Link href={homeLinkPath}>
                <Home className="mr-0 sm:mr-2 h-5 w-5" />
                <span className="hidden sm:inline">{t('navHome')}</span>
              </Link>
            </Button>
            {user && ( 
              <>
                <Button variant="ghost" asChild className={navLinkClasses("/practice-calendar")}>
                  <Link href="/practice-calendar">
                    <CalendarDays className="mr-0 sm:mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">{t('navCalendar')}</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className={navLinkClasses("/challenges")}>
                  <Link href="/challenges">
                    <Trophy className="mr-0 sm:mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">{t('navChallenges')}</span>
                  </Link>
                </Button>
              </>
            )}
            <div className="flex-grow sm:hidden"></div> 
             <Button variant="outline" onClick={handleLanguageSwitch} className="h-9 px-3" aria-label="Switch Language">
               <span className="mr-2">🇮🇩</span> Bahasa
            </Button>
            
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
              <>
                <Button variant="ghost" asChild className="h-9 px-4 py-2">
                  <Link href="/auth/signin">
                    <LogIn className="mr-2 h-5 w-5" />
                    {t('signIn')}
                  </Link>
                </Button>
                <Button asChild className="h-9 px-4 py-2">
                  <Link href="/auth/signup">
                    <UserCircle className="mr-2 h-5 w-5" />
                    {t('signUp')}
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="py-8 border-t bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            {t('footerText')}
          </p>
        </div>
      </footer>
    </div>
  );
}
