
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
import { YogaPoseIllustration } from '@/components/icons/YogaPoseIllustration';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UserProfileData extends DocumentData {
  displayName?: string;
}

const projects = [
  {
    icon: null,
    title: "Pose Analysis",
    category: "AI Feedback",
    bgColor: "", // Removed color to use custom SVG background
    href: "/snap-yoga",
    className: "col-span-1 row-span-1",
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
      <div className="min-h-screen">
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


          
          {/* Ongoing Projects */}
            <div className="grid grid-cols-2 grid-rows-3 gap-4 h-[30rem]">
              {projects.map((project, index) => {
                const Icon = project.icon
                if (project.title === "Pose Analysis") {
                  return (
                     <Link href={project.href} key={index} className={cn("block hover:scale-105 transition-transform duration-200", project.className)}>
                        <Card className="rounded-xl shadow-sm p-4 flex flex-col h-full relative overflow-hidden bg-card">
                            <div className="absolute inset-0 z-0">
                                <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M -10,150 C 50,220 150,220 210,150 L 210,210 L -10,210 Z" fill="#D2B48C" fillOpacity="0.4"/>
                                    <path d="M 80,-10 C 180,-10 220,90 150,110 C 80,130 0,60 80,-10 Z" fill="#A1B5D8" fillOpacity="0.4"/>
                                    <path d="M -10,50 C 30,110 80,110 100,50 C 120,-10 40,-10 -10,50 Z" fill="#FFC0CB" fillOpacity="0.4"/>
                                    <path d="M 120,50 C 200,50 200,150 120,150 C 40,150 40,50 120,50 Z" fill="#BDB76B" fillOpacity="0.3"/>
                                    <path d="M -10,150 Q 100,200 210,150" stroke="#800000" strokeWidth="1.5" fill="none" />
                                    <path d="M 80,-10 Q 100,150 200,180" stroke="#000080" strokeWidth="1.5" fill="none" />
                                    <path d="M -10,50 Q 100,100 150,0" stroke="#228B22" strokeWidth="1.5" fill="none" />
                                </svg>
                            </div>
                            <CardHeader className="flex-1 p-2 z-10">
                                <CardTitle className="text-card-foreground font-semibold">{project.title}</CardTitle>
                                <p className="text-sm text-card-foreground/90">{project.category}</p>
                            </CardHeader>
                        </Card>
                     </Link>
                  )
                }
                return (
                  <Link href={project.href} key={index} className={cn("block hover:scale-105 transition-transform duration-200", project.className)}>
                    <Card className={cn(project.bgColor, "rounded-xl shadow-sm p-4 flex flex-col h-full relative overflow-hidden")}>
                     {project.image && (
                        <Image
                            src={project.image.src}
                            alt={project.title}
                            fill
                            className="object-cover"
                            data-ai-hint={project.image.hint}
                        />
                     )}
                      <CardHeader className="flex-1 p-2 z-10">
                        <CardTitle className="text-card-foreground font-semibold">{project.title}</CardTitle>
                        <p className="text-sm text-card-foreground/90">{project.category}</p>
                      </CardHeader>
                      <CardContent className="p-2 flex justify-center items-center flex-1">
                        {Icon && <Icon className="h-12 w-12 text-card-foreground/80" />}
                      </CardContent>
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
