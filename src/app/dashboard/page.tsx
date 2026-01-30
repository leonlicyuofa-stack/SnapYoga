"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Wind, Frown, Activity, Goal, Trophy, Bot, Tired } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MoodChart } from '@/components/features/dashboard/MoodChart';
import { PracticeCalendarSnapshot } from '@/components/features/dashboard/PracticeCalendarSnapshot';

// New moods based on user request
const moods = [
  { name: 'Joyful', icon: Smile, emoji: '😊' },
  { name: 'Calm', icon: Wind, emoji: '😌' },
  { name: 'Emotional', icon: Frown, emoji: '😢' },
  { name: 'Fatigue', icon: Tired, emoji: '😫' },
];

const WeeklyCalendar = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekDays = eachDayOfInterval({ start, end: endOfWeek(today, { weekStartsOn: 1 }) });
    
    return (
        <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border">
            <CardContent className="p-2 sm:p-4 flex justify-around items-center">
                {weekDays.map(day => {
                    const isToday = isSameDay(day, today);
                    return (
                        <div key={day.toISOString()} className={cn(
                            "text-center p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted w-14", 
                            isToday && "bg-primary text-primary-foreground"
                        )}>
                            <p className="text-xs opacity-80">{format(day, 'EEE')}</p>
                            <p className="font-bold text-lg">{format(day, 'd')}</p>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

const PracticeLogCard = () => {
    return (
        <Card className="bg-primary text-primary-foreground h-full flex flex-col justify-between">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity /> Practice Log
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">1,240</div>
                <p className="text-sm text-primary-foreground/80">Mins this month</p>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [lastLoggedMood, setLastLoggedMood] = useState<string | null>(null);
  const [isMoodLogging, setIsMoodLogging] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch today's mood if it exists
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const moodDocRef = doc(firestore, 'users', user.uid, 'moods', todayStr);
      getDoc(moodDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setLastLoggedMood(docSnap.data().name);
        }
      });
    }
  }, [user]);
  
  const handleMoodSelect = async (moodName: string, moodEmoji: string) => {
    if (!user || isMoodLogging) return;
    setIsMoodLogging(true);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const moodDocRef = doc(firestore, 'users', user.uid, 'moods', todayStr);

    try {
      await setDoc(moodDocRef, {
        name: moodName,
        emoji: moodEmoji,
        loggedAt: serverTimestamp(),
      });
      setLastLoggedMood(moodName);
      toast({
        title: "Mood Logged",
        description: `Your mood has been logged as "${moodName}".`,
      });
    } catch (error) {
      console.error("Error logging mood:", error);
      toast({
        title: "Error",
        description: "Could not log your mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMoodLogging(false);
    }
  };

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
       <div className="relative flex flex-col h-full">
            <header className="container mx-auto px-4 pt-8 pb-4">
              <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md text-white/80">Welcome back,</p>
                    <h1 className="text-3xl font-bold text-white">{welcomeName}</h1>
                  </div>
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                      <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "user"} />
                      <AvatarFallback className="text-xl bg-background text-foreground">{getInitials(user?.email, user?.displayName)}</AvatarFallback>
                  </Avatar>
              </div>
            </header>

            <main className="flex-grow container mx-auto px-4 mt-4 space-y-6 pb-8">
                <WeeklyCalendar />

                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">My Activity</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Smile className="mr-2 h-5 w-5" />
                                    How are you feeling today?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-around items-center">
                                {moods.map(mood => (
                                <button
                                    key={mood.name}
                                    onClick={() => handleMoodSelect(mood.name, mood.emoji)}
                                    disabled={isMoodLogging}
                                    className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-2 rounded-lg w-16 h-20 transition-all duration-200",
                                    lastLoggedMood === mood.name ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-foreground/70 hover:bg-muted"
                                    )}
                                >
                                    <mood.icon className="h-7 w-7" />
                                    <span className="text-xs font-medium">{mood.name}</span>
                                </button>
                                ))}
                            </CardContent>
                        </Card>
                        <PracticeLogCard />
                         <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border flex flex-col justify-between">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Goal /> Monthly Goal</CardTitle>
                            </CardHeader>
                            <CardContent className="h-full flex items-center justify-center">
                            <PracticeCalendarSnapshot />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Activity className="mr-3 h-6 w-6" />
                            Weekly Mood
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MoodChart />
                    </CardContent>
                </Card>

               <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border">
                  <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Trophy className="h-6 w-6 text-primary" />
                            Challenges
                        </CardTitle>
                    </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground mb-4">Join a new challenge or check your progress on active ones.</p>
                      <Button asChild className="w-full">
                        <Link href="/challenges">View Challenges</Link>
                      </Button>
                  </CardContent>
              </Card>

            </main>
          </div>
    </AppShell>
  );
}
