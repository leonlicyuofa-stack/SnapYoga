
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Bell, MoreHorizontal, Sparkles, Trophy, Megaphone, Users, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { QuoteCarousel } from '@/components/features/dashboard/QuoteCarousel';

interface UserProfileData extends DocumentData {
  displayName?: string;
}

const projects = [
  {
    icon: Sparkles,
    title: "Pose Analysis",
    category: "AI Feedback",
    bgColor: "bg-primary text-primary-foreground",
    href: "/snap-yoga",
  },
  {
    icon: Trophy,
    title: "Dashboard",
    category: "Challenges",
    bgColor: "bg-card text-card-foreground",
    href: "/homepage",
  },
  {
    icon: Users,
    title: "Friends Challenges",
    category: "Community",
    bgColor: "bg-card text-card-foreground",
    href: "/challenges",
  },
  {
    icon: CalendarDays,
    title: "Practice Calendar",
    category: "Tracking",
    bgColor: "bg-card text-card-foreground",
    href: "/practice-calendar",
  },
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
                <h2 className="text-3xl font-bold text-foreground">Welcome back!</h2>
                <p className="text-muted-foreground">Good Morning</p>
              </div>
          </div>

          {/* Search */}
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search" className="pl-10 h-12 rounded-lg bg-card shadow-sm" />
          </div>

          {/* Quote Carousel */}
          <div className="flex justify-center">
              <QuoteCarousel />
          </div>
          
          {/* Ongoing Projects */}
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  {projects.map((project, index) => {
                      const Icon = project.icon;
                      return (
                        <Link href={project.href} key={index} className="block hover:scale-105 transition-transform duration-200">
                          <Card className={`${project.bgColor} rounded-xl shadow-sm p-4 flex flex-col justify-between h-32`}>
                              <div className="flex justify-between items-start">
                                  <div className="p-2 bg-card/20 rounded-lg">
                                      <Icon className="h-6 w-6" />
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                              </div>
                              <div>
                                  <p className="font-semibold">{project.title}</p>
                                  <p className="text-sm opacity-80">{project.category}</p>
                              </div>
                          </Card>
                        </Link>
                      )
                  })}
              </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
