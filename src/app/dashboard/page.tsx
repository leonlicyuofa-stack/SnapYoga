
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Trophy, Users, CalendarDays, Moon, BarChart2 } from 'lucide-react';
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
import { PracticeAnalytics } from '@/components/features/dashboard/PracticeAnalytics';
import { RockCollectionCard } from '@/components/features/dashboard/rock-collection-card';
import { allRocks } from '@/components/features/dashboard/rock-data';
import { PracticeCalendarSnapshot } from '@/components/features/dashboard/PracticeCalendarSnapshot';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';
import { MoodChart } from '@/components/features/dashboard/MoodChart';
import { UserCircle } from 'lucide-react';
import { OnboardingBackground } from '@/components/layout/OnboardingBackground';

interface UserProfileData extends DocumentData {
  displayName?: string;
}

const projects = [
  {
    component: PracticeAnalytics,
    title: "Profile",
    category: "Overview",
    bgColor: "bg-pistachio-background", 
    href: "/profile",
    className: "col-span-1 row-span-1",
  },
  {
    component: RockCollectionCard,
    title: "Rock Collection",
    category: "Collectibles",
    bgColor: "bg-rose-200",
    href: "/rocks",
    className: "col-span-1 row-span-2",
    props: { rocks: allRocks },
  },
  {
    component: MoodChart,
    title: "Mood Analysis",
    category: "Tracking",
    bgColor: "bg-fuchsia-200",
    href: "/practice-calendar",
    className: "col-span-1 row-span-2"
  },
  {
    component: PracticeCalendarSnapshot,
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
  const [selectedMood, setSelectedMood] = useState<{ name: string; emoji: string } | null>(null);
  const { toast } = useToast();
  
  const welcomeName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    // Fetch today's mood when the component mounts
    if (user) {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const moodDocRef = doc(firestore, `users/${user.uid}/moods/${todayStr}`);
      getDoc(moodDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const moodData = docSnap.data();
          const foundMood = moods.find(m => m.name === moodData.name);
          if(foundMood) {
            setSelectedMood(foundMood);
          }
        }
      });
    }
  }, [user]);

  const handleMoodSelection = async (mood: { name: string; emoji: string }) => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "You must be logged in to track your mood.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedMood(mood);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const moodDocRef = doc(firestore, `users/${user.uid}/moods/${todayStr}`);
    try {
      await setDoc(moodDocRef, { 
        name: mood.name,
        emoji: mood.emoji,
        loggedAt: serverTimestamp() 
      }, { merge: true });
      
      if (mood.name === 'Sad') {
        toast({
            title: "A Little Note for You",
            description: "Inhale the good vibes, exhale the drama.",
        });
      } else if (mood.name === 'Happy') {
        toast({
            title: "Rise, stretch, breathe, smile — it's Yoga Day!",
            description: `Your mood for today is set to: ${mood.emoji} ${mood.name}`,
        });
      } else {
        toast({
            title: "Mood Saved!",
            description: `Your mood for today has been set to: ${mood.emoji} ${mood.name}`,
        });
      }

    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Error",
        description: "Could not save your mood. Please try again.",
        variant: "destructive"
      });
    }
  };

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
      <div className="relative h-full">
        <OnboardingBackground />
        <div className="relative z-10 container mx-auto px-4 py-6 space-y-4">

          
          {/* Greeting */}
          <div className="flex items-center gap-4 pt-4">
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
                      <button 
                        key={mood.name} 
                        onClick={() => handleMoodSelection(mood)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 bg-card border rounded-lg shadow-sm hover:bg-accent/50 hover:border-primary transition-all",
                          selectedMood?.name === mood.name && "bg-accent/80 border-primary"
                        )}
                      >
                          <span className="text-4xl">{mood.emoji}</span>
                          <span className="text-sm font-medium text-muted-foreground">{mood.name}</span>
                      </button>
                  ))}
              </div>
          </div>


          
          {/* Ongoing Projects */}
            <div className="grid grid-cols-2 grid-rows-3 gap-4 h-[30rem]">
              {projects.map((project, index) => {
                const Component = project.component
                const CardProps = project.component ? project.props : {};
                return (
                  <div key={index} className={cn("block transition-transform duration-200", project.className)}>
                    <Card className={cn(project.bgColor, "rounded-xl shadow-sm p-4 flex flex-col h-full relative overflow-hidden")}>
                     
                      <CardHeader className="flex-1 p-2 z-10">
                        <CardTitle className="text-card-foreground font-semibold">{project.title}</CardTitle>
                        <p className="text-sm text-card-foreground/90">{project.category}</p>
                      </CardHeader>
                      <CardContent className="p-2 flex justify-center items-center flex-1">
                        {Component ? <Component {...CardProps} className="h-full w-full text-card-foreground/80" /> : null}
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>

        </div>
      </div>
    </AppShell>
  );
}
