
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, type Timestamp, orderBy } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CalendarDays, Dumbbell, Star } from 'lucide-react';
import { startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface StoredAnalysis {
  id: string;
  createdAt: Timestamp;
  identifiedPose?: string;
  score?: number;
}

export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [practiceDates, setPracticeDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [todaysAnalyses, setTodaysAnalyses] = useState<StoredAnalysis[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfDay(new Date()));

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("Please log in to view your practice calendar.");
      setIsLoadingData(false);
      return;
    }
    
    setIsLoadingData(true);
    setError(null);

    const analysesRef = collection(firestore, 'users', user.uid, 'poseAnalyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'));

    getDocs(q).then((querySnapshot) => {
        const allAnalyses: StoredAnalysis[] = [];
        querySnapshot.forEach(doc => {
            allAnalyses.push({ id: doc.id, ...doc.data() } as StoredAnalysis);
        });

        const uniqueDates = new Set<string>();
        allAnalyses.forEach(analysis => {
            if (analysis.createdAt) {
                const date = startOfDay(analysis.createdAt.toDate());
                uniqueDates.add(date.toISOString());
            }
        });
        setPracticeDates(Array.from(uniqueDates).map(dateStr => new Date(dateStr)));
        
        // Filter analyses for today's date initially
        const today = startOfDay(new Date());
        const filteredAnalyses = allAnalyses.filter(a => a.createdAt && startOfDay(a.createdAt.toDate()).getTime() === today.getTime());
        setTodaysAnalyses(filteredAnalyses);
    }).catch((err) => {
        console.error("Error fetching practice data:", err);
        setError("Failed to load practice data. Please try again.");
    }).finally(() => {
        setIsLoadingData(false);
    });

  }, [user, authLoading]);

  const practicedDaysModifier = { practiced: practiceDates };
  const selectedDayModifier = { selected: selectedDate };
  
  const modifiers = { ...practicedDaysModifier, ...selectedDayModifier };

  const modifiersClassNames = {
    practiced: "bg-primary/20 text-primary-foreground font-bold",
    selected: "bg-primary text-primary-foreground rounded-md",
  };

  return (
    <AppShell>
      <div className="bg-primary min-h-screen">
        <div className="container mx-auto px-0 pt-4 pb-24">

          {error && (
            <Alert variant="destructive" className="max-w-xl mx-auto m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-background rounded-t-3xl shadow-xl pb-4">
            <div className="relative">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="p-4"
                classNames={{
                  caption_label: "font-bold text-lg",
                  head_cell: "text-muted-foreground font-semibold w-10",
                  cell: "h-10 w-10 text-center",
                  day: "h-10 w-10 rounded-md",
                  day_today: "font-bold text-primary",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-background -mb-16 rounded-b-3xl">
                 <div className="absolute top-0 right-0 h-16 w-1/2 bg-primary rounded-tl-3xl"></div>
                 <div className="absolute top-0 right-1/2 h-16 w-1/2 bg-background rounded-br-3xl"></div>
              </div>
            </div>

            <Tabs defaultValue="log" className="relative -mt-16">
              <TabsList className="grid w-full grid-cols-2 bg-transparent h-16 p-0">
                  <TabsTrigger value="events" className="h-full rounded-none data-[state=inactive]:bg-background data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground font-bold text-base">Practice Log</TabsTrigger>
                  <TabsTrigger value="log" className="h-full rounded-none data-[state=inactive]:bg-primary data-[state=active]:bg-primary text-primary-foreground font-bold text-base">Upcoming Events</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="p-6 text-primary-foreground">
            <h2 className="text-3xl font-bold tracking-tight text-center font-chakra">Monthly Yoga Challenge</h2>
            <p className="text-5xl font-bold text-center mt-2 font-chakra">$0</p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
                <Card className="bg-primary-foreground text-primary shadow-lg relative -rotate-3">
                     <div className="absolute -bottom-2 -left-2 -right-2 h-full bg-white/40 rounded-lg -z-10 rotate-6"></div>
                    <CardHeader>
                        <CardDescription className="font-bold">POSES PRACTICED</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-4xl font-bold font-chakra">{todaysAnalyses.length}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-primary-foreground text-primary shadow-lg relative rotate-3">
                     <div className="absolute -bottom-2 -left-2 -right-2 h-full bg-white/40 rounded-lg -z-10 -rotate-6"></div>
                    <CardHeader>
                        <CardDescription className="font-bold">TIME SPENT</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-4xl font-bold font-chakra">~{todaysAnalyses.length * 5} <span className="text-xl">min</span></p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 space-y-4">
                <h3 className="font-bold text-lg">Today's Log</h3>
                {isLoadingData ? (
                    <>
                        <Skeleton className="h-16 w-full bg-white/20" />
                        <Skeleton className="h-16 w-full bg-white/20" />
                    </>
                ) : todaysAnalyses.length > 0 ? (
                    todaysAnalyses.map(analysis => (
                        <Card key={analysis.id} className="bg-white/10 text-primary-foreground">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Dumbbell className="h-8 w-8" />
                                    <div>
                                        <p className="font-bold">{analysis.identifiedPose || 'Unknown Pose'}</p>
                                        <p className="text-sm opacity-80">Score: {analysis.score || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-300">
                                    <Star className="h-4 w-4" />
                                    <span className="font-bold">{analysis.score || 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="bg-white/10 text-primary-foreground">
                        <CardContent className="p-4 text-center">
                            <p>No practice recorded for this day.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
