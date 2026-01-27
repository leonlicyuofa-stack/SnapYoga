
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
  { title: "Profile & Stats", href: "/profile", icon: Activity, bgColor: "bg-white/10", description: "View your progress" },
  { title: "Challenges", href: "/challenges", icon: Trophy, bgColor: "bg-white/10", description: "Join a new challenge" },
  { title: "Collection", href: "/yoga-collection", icon: Gem, bgColor: "bg-white/10", description: "See your equipment" },
  { title: "Practice Log", href: "/practice-calendar", icon: CalendarDays, bgColor: "bg-white/10", description: "Review your calendar" },
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
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Good Morning, {welcomeName}</h1>
                <p className="text-md text-white/80">What are you up to today?</p>
              </div>
              <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "user"} />
                  <AvatarFallback className="text-xl bg-black/20">{getInitials(user?.email, user?.displayName)}</AvatarFallback>
              </Avatar>
          </div>
          <div className="relative mt-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                type="search"
                placeholder="Search for exercises..."
                className="w-full rounded-full bg-black/20 backdrop-blur-lg border-white/20 text-white placeholder:text-white/50 pl-12 pr-4 py-7 shadow-md text-base"
              />
          </div>
        </header>

        <main className="space-y-8">
            <RockCollectionCard collectibles={allCollectibles} />
            <div className="grid grid-cols-2 gap-4">
                {gridItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Link href={item.href} key={index}>
                        <Card
                            className="rounded-2xl shadow-lg bg-black/20 backdrop-blur-lg border-white/20 h-full text-white"
                        >
                            <CardContent className="flex flex-col items-center justify-center p-4 gap-3 text-center h-full">
                                <div className={cn("p-4 rounded-full", item.bgColor)}>
                                <Icon className="h-8 w-8 text-white" />
                                </div>
                                <div className="mt-2">
                                    <p className="font-semibold text-md">{item.title}</p>
                                    <p className="text-xs text-white/80">{item.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
                })}
            </div>
        </main>
      </div>
    </AppShell>
  );
}
