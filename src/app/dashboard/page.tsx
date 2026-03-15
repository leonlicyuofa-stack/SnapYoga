
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Wind, Frown, Activity, Goal, Trophy, Meh, Zap, Heart, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MoodChart } from '@/components/features/dashboard/MoodChart';
import { PracticeCalendarSnapshot } from '@/components/features/dashboard/PracticeCalendarSnapshot';

const moods = [
  { name: 'Joyful', icon: Smile, emoji: '😊', color: 'bg-green-100 text-green-600' },
  { name: 'Calm', icon: Wind, emoji: '😌', color: 'bg-blue-100 text-blue-600' },
  { name: 'Emotional', icon: Frown, emoji: '😢', color: 'bg-purple-100 text-purple-600' },
  { name: 'Fatigue', icon: Meh, emoji: '😫', color: 'bg-orange-100 text-orange-600' },
];

const DashboardCard = ({ 
    title, 
    subtitle, 
    value, 
    icon: Icon, 
    className, 
    children 
}: { 
    title: string; 
    subtitle?: string; 
    value?: string; 
    icon: any; 
    className?: string;
    children?: React.ReactNode;
}) => (
    <Card className={cn("relative overflow-hidden border-none shadow-lg rounded-[2.5rem] bg-white/90 backdrop-blur-md transition-transform hover:scale-[1.02]", className)}>
        <div className="absolute top-6 right-6 p-2 rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
        </div>
        <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-medium text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {value && <div className="text-4xl font-bold tracking-tight text-primary mt-2">{value}</div>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            {children}
        </CardContent>
    </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lastLoggedMood, setLastLoggedMood] = useState<string | null>(null);
  const [isMoodLogging, setIsMoodLogging] = useState(false);

  useEffect(() => {
    if (user) {
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
        description: `Feeling ${moodName} today!`,
      });
    } catch (error) {
      console.error("Error logging mood:", error);
      toast({
        title: "Error",
        description: "Could not log mood.",
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
      return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
    }
    return email?.[0].toUpperCase() || 'U';
  };

  return (
    <AppShell>
       <div className="relative flex flex-col h-full bg-transparent">
            <header className="container mx-auto px-6 pt-8 pb-6">
              <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Hey, {welcomeName}!</h1>
                    <p className="text-white/70 text-lg">Your practice is waiting for you.</p>
                  </div>
                  <Avatar className="h-14 w-14 border-4 border-white/20 shadow-xl">
                      <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "user"} />
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">{getInitials(user?.email, user?.displayName)}</AvatarFallback>
                  </Avatar>
              </div>
            </header>

            <main className="flex-grow container mx-auto px-6 space-y-8 pb-24">
                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Primary Mood Selector */}
                    <DashboardCard title="How are you?" icon={Zap} className="md:col-span-2">
                        <div className="flex justify-between items-center mt-4">
                            {moods.map(mood => (
                                <button
                                    key={mood.name}
                                    onClick={() => handleMoodSelect(mood.name, mood.emoji)}
                                    disabled={isMoodLogging}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-3xl transition-all duration-300",
                                        lastLoggedMood === mood.name 
                                            ? "bg-primary text-primary-foreground shadow-inner scale-105" 
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    <mood.icon className="h-8 w-8" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{mood.name}</span>
                                </button>
                            ))}
                        </div>
                    </DashboardCard>

                    {/* Stats Cards */}
                    <DashboardCard title="Practice" value="1,240" subtitle="Mins this month" icon={Clock} />
                    <DashboardCard title="Monthly Goal" icon={Goal} className="flex flex-col justify-center">
                        <div className="mt-2">
                            <PracticeCalendarSnapshot />
                        </div>
                    </DashboardCard>

                    {/* Mood Analysis Section */}
                    <DashboardCard title="Weekly Mood Flow" icon={Activity} className="md:col-span-3 lg:col-span-3">
                        <div className="mt-4 h-[250px]">
                            <MoodChart />
                        </div>
                    </DashboardCard>

                    {/* Small Call to Action */}
                    <Card className="bg-primary text-primary-foreground rounded-[2.5rem] border-none shadow-xl flex flex-col justify-between p-8 md:col-span-1 lg:col-span-1 transition-transform hover:scale-[1.02]">
                        <div className="space-y-4">
                            <div className="p-3 bg-white/20 rounded-2xl w-fit">
                                <Trophy className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold leading-tight">Join new challenges</h3>
                            <p className="text-primary-foreground/80">Connect with friends and master new poses.</p>
                        </div>
                        <Button asChild variant="secondary" className="w-full mt-8 rounded-2xl h-14 text-lg font-bold">
                            <Link href="/challenges">Explore</Link>
                        </Button>
                    </Card>
                </div>
            </main>
          </div>
    </AppShell>
  );
}
