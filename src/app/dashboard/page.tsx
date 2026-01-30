
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Gem, HelpCircle, User, Smile, Wind, Frown, Angry, Activity } from 'lucide-react';
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
import { MoodChart } from '@/components/features/dashboard/MoodChart';
import { QuoteCarousel } from '@/components/features/dashboard/QuoteCarousel';
import { PracticeAnalytics } from '@/components/features/dashboard/PracticeAnalytics';
import { PracticeCalendarSnapshot } from '@/components/features/dashboard/PracticeCalendarSnapshot';
import { HowToGuideDialog } from '@/components/features/dashboard/how-to-guide-dialog';
import { Trophy } from 'lucide-react';


const moods = [
  { name: 'Happy', icon: Smile },
  { name: 'Relaxed', icon: Wind },
  { name: 'Sad', icon: Frown },
  { name: 'Angry', icon: Angry },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [lastLoggedMood, setLastLoggedMood] = useState<string | null>(null);
  const [isMoodLogging, setIsMoodLogging] = useState(false);
  const [showHowToGuide, setShowHowToGuide] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if it's the user's first visit to show the guide
      const hasSeenGuide = localStorage.getItem('snapYoga_hasSeenHowToGuide');
      if (!hasSeenGuide) {
        setShowHowToGuide(true);
        localStorage.setItem('snapYoga_hasSeenHowToGuide', 'true');
      }

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
       <HowToGuideDialog isOpen={showHowToGuide} onClose={() => setShowHowToGuide(false)} />
       <div className="relative min-h-[calc(100vh-4rem)]">
         <div className="absolute top-0 left-0 right-0 h-[25vh] bg-secondary rounded-b-3xl" />
         <div className="relative z-10 flex flex-col h-full">
            <header className="container mx-auto px-4 pt-8 pb-4 text-primary-foreground">
              <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-primary">Good Morning, {welcomeName}</h1>
                    <p className="text-md text-primary/80">How are you feeling today?</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowHowToGuide(true)} className="text-primary hover:bg-primary/10">
                        <HelpCircle />
                        <span className="sr-only">How to get started</span>
                    </Button>
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "user"} />
                        <AvatarFallback className="text-xl bg-background text-foreground">{getInitials(user?.email, user?.displayName)}</AvatarFallback>
                    </Avatar>
                  </div>
              </div>
            </header>

            <main className="flex-grow container mx-auto px-4 mt-8 space-y-8">
              <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border">
                <CardContent className="p-4 flex justify-around items-center">
                  {moods.map(mood => (
                    <button
                      key={mood.name}
                      onClick={() => handleMoodSelect(mood.name, mood.icon.displayName || mood.name)}
                      disabled={isMoodLogging}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-lg w-20 h-20 transition-all duration-200",
                        lastLoggedMood === mood.name ? "bg-primary/90 text-primary-foreground shadow-md scale-105" : "text-foreground/70 hover:bg-muted"
                      )}
                    >
                      <mood.icon className="h-8 w-8" />
                      <span className="text-xs font-medium">{mood.name}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border">
                  <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                          <Activity className="mr-3 h-6 w-6" />
                          Weekly Mood
                      </CardTitle>
                  </CardHeader>
                  <MoodChart className="w-full" />
              </Card>

              <QuoteCarousel />

              <RockCollectionCard collectibles={allCollectibles} />

              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-lg">Practice Log</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                       <PracticeAnalytics />
                    </CardContent>
                </Card>
                <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-lg">Profile & Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                       <PracticeCalendarSnapshot />
                    </CardContent>
                </Card>
              </div>

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
      </div>
    </AppShell>
  );
}
