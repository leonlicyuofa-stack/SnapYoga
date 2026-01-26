
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Trophy, Users, CalendarDays, Search, Gem, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { DocumentData } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { RockCollectionCard } from '@/components/features/dashboard/rock-collection-card';
import { allCollectibles } from '@/components/features/dashboard/rock-data';
import { UserCircle } from 'lucide-react';

const gridItems: { title: string; href: string, icon: React.ElementType, bgColor: string, description: string }[] = [
  { title: "Profile & Stats", href: "/profile", icon: Activity, bgColor: "bg-emerald-100/50", description: "View your progress" },
  { title: "Challenges", href: "/challenges", icon: Trophy, bgColor: "bg-rose-100/50", description: "Join a new challenge" },
  { title: "Collection", href: "/yoga-collection", icon: Gem, bgColor: "bg-sky-100/50", description: "See your equipment" },
  { title: "Practice Log", href: "/practice-calendar", icon: CalendarDays, bgColor: "bg-purple-100/50", description: "Review your calendar" },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  
  const welcomeName = user?.displayName || user?.email?.split('@')[0] || 'Yogi';

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
      <div className="relative min-h-[calc(100vh-4rem)]">
        {/* Top Orange Section */}
        <div className="absolute top-0 left-0 right-0 h-[35vh] bg-secondary rounded-b-3xl" />

        <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <header className="container mx-auto px-4 pt-8 pb-4 text-primary-foreground">
            <div className="flex justify-between items-center">
                <div>
                <h1 className="text-3xl font-bold text-primary">Good Morning, {welcomeName}</h1>
                <p className="text-md text-primary/80">What are you up to today?</p>
                </div>
                <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "user"} />
                    <AvatarFallback className="text-xl">{getInitials(user?.email, user?.displayName)}</AvatarFallback>
                </Avatar>
            </div>
            <div className="relative mt-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search for exercises..."
                className="w-full rounded-full bg-background/80 text-foreground pl-12 pr-4 py-7 shadow-md text-base"
                />
            </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow container mx-auto px-4 mt-8">
                <div className="mb-8">
                    <RockCollectionCard collectibles={allCollectibles} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {gridItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link href={item.href} key={index}>
                            <Card
                                className="rounded-2xl shadow-lg bg-card/90 backdrop-blur-sm border-border/20 h-full"
                            >
                                <CardContent className="flex flex-col items-center justify-center p-4 gap-3 text-center h-full">
                                    <div className={cn("p-4 rounded-full", item.bgColor)}>
                                    <Icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-semibold text-md text-foreground">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                    })}
                </div>
            </main>

        </div>
      </div>
    </AppShell>
  );
}
