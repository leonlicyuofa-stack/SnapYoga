
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Trophy, Users, CalendarDays, Moon, Sun, Flower, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuoteCarousel } from '@/components/features/dashboard/QuoteCarousel';
import { Playfair_Display } from 'next/font/google';
import { YogaPoseIllustration } from '@/components/icons/YogaPoseIllustration';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
});

interface UserProfileData extends DocumentData {
  displayName?: string;
}

const projects = [
  {
    icon: Moon,
    title: "Pose Analysis",
    category: "AI Feedback",
    bgColor: "bg-indigo-300",
    href: "/snap-yoga",
    className: "col-span-1 row-span-1"
  },
  {
    icon: Sun,
    title: "Dashboard",
    category: "Challenges",
    bgColor: "bg-rose-200",
    href: "/homepage",
    className: "col-span-1 row-span-2"
  },
  {
    icon: Flower,
    title: "Friends Challenges",
    category: "Community",
    bgColor: "bg-fuchsia-200",
    href: "/challenges",
    className: "col-span-1 row-span-2"
  },
  {
    icon: YogaPoseIllustration,
    title: "Practice Calendar",
    category: "Tracking",
    bgColor: "bg-violet-200",
    href: "/practice-calendar",
    className: "col-span-1 row-span-1"
  },
]

const moods = [
    { name: 'Angry', emoji: '😠' },
    { name: 'Happy', emoji: '😊' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Relaxed', emoji: '😌' },
]

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  
  const welcomeName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

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

  return (
    <AppShell>
      <div className="bg-card min-h-screen">
        <div className="container mx-auto px-4 py-6 space-y-6">

          
          {/* Greeting */}
          <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={user?.photoURL || ''} alt={welcomeName} />
                <AvatarFallback className="text-xl bg-card text-primary font-semibold">
                    {getInitials(user?.email, user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">Welcome back!</h2>
                <p className="text-muted-foreground">{welcomeName}</p>
              </div>
          </div>
          
          {/* Mood Tracker */}
          <div className="space-y-4">
              <p className="text-muted-foreground">How do you feel today?</p>
              <div className="grid grid-cols-4 gap-4">
                  {moods.map((mood) => (
                      <button key={mood.name} className="flex flex-col items-center justify-center gap-2 p-4 bg-card border rounded-lg shadow-sm hover:bg-accent/50 hover:border-primary transition-all">
                          <span className="text-4xl">{mood.emoji}</span>
                          <span className="text-sm font-medium text-muted-foreground">{mood.name}</span>
                      </button>
                  ))}
              </div>
          </div>


          {/* Quote Carousel */}
          <div className="flex justify-center">
              <QuoteCarousel />
          </div>
          
          {/* Ongoing Projects */}
            <div className="grid grid-cols-2 grid-rows-3 gap-4 h-[30rem]">
              {projects.map((project, index) => {
                const Icon = project.icon
                return (
                  <Link href={project.href} key={index} className={cn("block hover:scale-105 transition-transform duration-200", project.className)}>
                    <Card className={cn(project.bgColor, "rounded-xl shadow-sm p-4 flex flex-col h-full")}>
                      <CardHeader className="flex-1 p-2">
                        <CardTitle className="text-card-foreground font-semibold">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 flex justify-center items-center flex-1">
                        <Icon className="h-12 w-12 text-card-foreground/80" />
                      </CardContent>
                      <CardFooter className="p-2">
                         <p className="text-sm text-card-foreground/90">{project.category}</p>
                      </CardFooter>
                    </Card>
                  </Link>
                )
              })}
            </div>

        </div>
      </div>
    </AppShell>
  );
}
