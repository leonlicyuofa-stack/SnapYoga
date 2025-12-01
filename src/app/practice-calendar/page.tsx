
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, type Timestamp, orderBy, doc, getDoc } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CalendarDays, Dumbbell, Star, Goal, Smile, FileText } from 'lucide-react';
import { startOfDay, format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";


interface StoredAnalysis {
  id: string;
  createdAt: Timestamp;
  identifiedPose?: string;
  score?: number;
}

interface StoredMood {
  id: string;
  loggedAt: Timestamp;
  name: string;
  emoji: string;
}

export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [practiceDates, setPracticeDates] = useState<Date[]>([]);
  const [moodsByDate, setMoodsByDate] = useState<Record<string, StoredMood>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [analysesForSelectedDay, setAnalysesForSelectedDay] = useState<StoredAnalysis[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<StoredAnalysis[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfDay(new Date()));

  // Mock data for the pie chart
  const monthlyProgress = 72;
  const chartData = [
    { name: 'Completed', value: monthlyProgress, fill: 'hsl(var(--primary))' },
    { name: 'Remaining', value: 100 - monthlyProgress, fill: 'hsl(var(--muted))' },
  ];
  const chartConfig = {
    progress: {
      label: 'Progress',
      color: 'hsl(var(--primary))',
    },
    remaining: {
      label: 'Remaining',
      color: 'hsl(var(--muted))',
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("Please log in to view your practice calendar.");
      setIsLoadingData(false);
      return;
    }
    
    setIsLoadingData(true);
    setError(null);

    const fetchAnalyses = getDocs(query(collection(firestore, 'users', user.uid, 'poseAnalyses'), orderBy('createdAt', 'desc')));
    const fetchMoods = getDocs(query(collection(firestore, 'users', user.uid, 'moods'), orderBy('loggedAt', 'desc')));

    Promise.all([fetchAnalyses, fetchMoods]).then(([analysesSnapshot, moodsSnapshot]) => {
        // Process Analyses
        const fetchedAnalyses: StoredAnalysis[] = [];
        analysesSnapshot.forEach(doc => {
            fetchedAnalyses.push({ id: doc.id, ...doc.data() } as StoredAnalysis);
        });
        setAllAnalyses(fetchedAnalyses);

        const uniquePracticeDates = new Set<string>();
        fetchedAnalyses.forEach(analysis => {
            if (analysis.createdAt) {
                const date = startOfDay(analysis.createdAt.toDate());
                uniquePracticeDates.add(date.toISOString());
            }
        });
        setPracticeDates(Array.from(uniquePracticeDates).map(dateStr => new Date(dateStr)));

        // Process Moods
        const fetchedMoods: Record<string, StoredMood> = {};
        moodsSnapshot.forEach(doc => {
            const mood = { id: doc.id, ...doc.data() } as StoredMood;
            if(mood.loggedAt) {
                 const dateStr = format(mood.loggedAt.toDate(), 'yyyy-MM-dd');
                 fetchedMoods[dateStr] = mood;
            }
        });
        setMoodsByDate(fetchedMoods);

    }).catch((err) => {
        console.error("Error fetching practice data:", err);
        setError("Failed to load practice data. Please try again.");
    }).finally(() => {
        setIsLoadingData(false);
    });

  }, [user, authLoading]);
  
  useEffect(() => {
    if (selectedDate) {
        const startOfSelected = startOfDay(selectedDate);
        const filtered = allAnalyses.filter(a => a.createdAt && isSameDay(a.createdAt.toDate(), startOfSelected));
        setAnalysesForSelectedDay(filtered);
    } else {
        setAnalysesForSelectedDay([]);
    }
  }, [selectedDate, allAnalyses]);

  const moodForSelectedDay = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return moodsByDate[dateStr] || null;
  }, [selectedDate, moodsByDate]);

  const practicedDaysModifier = { practiced: practiceDates };
  const selectedDayModifier = { selected: selectedDate };
  
  const modifiers = { ...practicedDaysModifier, ...selectedDayModifier };

  const modifiersClassNames = {
    practiced: "bg-primary/20 text-primary-foreground font-bold",
    selected: "bg-accent text-accent-foreground rounded-md",
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarDays className="h-7 w-7 text-primary" />
              Practice Calendar
            </CardTitle>
            <CardDescription>
              Select a day to see your practice logs and recorded mood.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="rounded-md border p-0"
                classNames={{
                  caption_label: "font-bold text-lg",
                  head_cell: "text-muted-foreground font-semibold w-full",
                  cell: "h-12 w-full text-center text-sm p-0",
                  day: "h-12 w-full rounded-md",
                  day_today: "font-bold text-primary",
                }}
              />
            </div>

            <div className="space-y-6">
              {/* Daily Details Section */}
              <div className="space-y-4">
                  <h3 className="font-bold text-lg text-primary border-b pb-2">
                    Details for {selectedDate ? format(selectedDate, 'PPP') : 'Today'}
                  </h3>

                  {/* Mood for the day */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Mood</CardTitle>
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingData ? (
                        <Skeleton className="h-8 w-1/2" />
                      ) : moodForSelectedDay ? (
                        <div className="flex items-center gap-2">
                           <span className="text-2xl">{moodForSelectedDay.emoji}</span>
                           <p className="text-lg font-semibold">{moodForSelectedDay.name}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No mood recorded.</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Practice Log for the day */}
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Practice Log</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                       {isLoadingData ? (
                          <>
                              <Skeleton className="h-10 w-full" />
                              <Skeleton className="h-10 w-full" />
                          </>
                      ) : analysesForSelectedDay.length > 0 ? (
                          analysesForSelectedDay.map(analysis => (
                              <div key={analysis.id} className="text-sm text-foreground flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                                      <p>{analysis.identifiedPose || 'Unknown Pose'}</p>
                                  </div>
                                  <div className="flex items-center gap-1 font-semibold">
                                      <Star className="h-4 w-4 text-yellow-400" />
                                      <span>{analysis.score || 'N/A'}</span>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <p className="text-sm text-muted-foreground">No practice recorded.</p>
                      )}
                    </CardContent>
                  </Card>
            </div>
            
            {/* Monthly Goal Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
                <Goal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[150px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} strokeWidth={5}>
                      <Cell key="completed" fill="var(--color-progress)" />
                      <Cell key="remaining" fill="var(--color-remaining)" />
                    </Pie>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
                      {monthlyProgress}%
                    </text>
                  </PieChart>
                </ChartContainer>
                <p className="text-xs text-muted-foreground mt-2">You're on track to meet your goal!</p>
              </CardContent>
            </Card>

            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="max-w-xl mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </AppShell>
  );
}

