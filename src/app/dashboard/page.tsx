
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Bell, MoreHorizontal, Tv, LayoutDashboard, Megaphone, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

interface UserProfileData extends DocumentData {
  displayName?: string;
}

const projects = [
  {
    icon: Tv,
    title: "Mobile App",
    category: "E-commerce",
    bgColor: "bg-primary text-primary-foreground",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    category: "Friends Challenges",
    bgColor: "bg-card text-card-foreground",
  },
  {
    icon: Megaphone,
    title: "Banner",
    category: "Pose Analysis",
    bgColor: "bg-card text-card-foreground",
  },
  {
    icon: Users,
    title: "Practice Calendar",
    category: "Task Manager",
    bgColor: "bg-card text-card-foreground",
  },
]

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  
  const welcomeName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center font-bold text-primary text-lg shadow">88</div>
                <h1 className="font-semibold text-foreground">Home</h1>
            </div>
            <Button variant="ghost" size="icon">
                <Bell className="h-6 w-6" />
            </Button>
        </div>
        
        {/* Greeting */}
        <div>
            <h2 className="text-3xl font-bold text-foreground">Hi {welcomeName}!</h2>
            <p className="text-muted-foreground">Good Morning</p>
        </div>

        {/* Search */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search" className="pl-10 h-12 rounded-lg bg-card border-none shadow-sm" />
        </div>

        {/* Welcome Banner */}
        <Card className="flex items-center p-4 rounded-xl shadow-sm">
          <CardContent className="p-0 flex items-center gap-4">
            <div>
              <p className="font-bold text-lg">Welcome!</p>
              <p className="text-muted-foreground">Let's schedule your projects</p>
            </div>
             <div className="relative w-24 h-20">
                <Image src="https://picsum.photos/seed/desk/200/200" alt="Person working at desk" layout="fill" objectFit="contain" data-ai-hint="desk illustration" />
            </div>
          </CardContent>
        </Card>
        
        {/* Ongoing Projects */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Ongoing Projects</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {projects.map((project, index) => {
                    const Icon = project.icon;
                    return (
                        <Card key={index} className={`${project.bgColor} rounded-xl shadow-sm p-4 flex flex-col justify-between h-32`}>
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
                    )
                })}
            </div>
        </div>

      </div>
    </div>
  );
}
