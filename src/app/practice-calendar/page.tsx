
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, type Timestamp, orderBy, doc, getDoc } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CalendarDays, Dumbbell, Star, Goal, Smile, FileText, Upload, RefreshCcw } from 'lucide-react';
import { startOfDay, format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Calendar } from '@/components/ui/calendar';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';
import { Button } from '@/components/ui/button';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';


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

const moodToColor: Record<string, string> = {
  'Happy': 'bg-green-300',
  'Relaxed': 'bg-green-200',
  'Sad': 'bg-yellow-300',
  'Angry': 'bg-yellow-400',
};

const moodToFace: Record<string, 'happy' | 'neutral' | 'sad'> = {
  'Happy': 'happy',
  'Relaxed': 'happy',
  'Sad': 'sad',
  'Angry': 'sad',
}

export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [moodsByDate, setMoodsByDate] = useState<Record<string, StoredMood>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
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

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const fetchMoods = getDocs(query(collection(firestore, 'users', user.uid, 'moods'), where('loggedAt', '>=', start), where('loggedAt', '<=', end)));

    fetchMoods.then((moodsSnapshot) => {
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

  }, [user, authLoading, currentMonth]);

  const DayContent = (props: { date: Date }) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const mood = moodsByDate[dateStr];

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-1 pt-1">
            <span className={cn(
                "relative z-10 font-semibold", 
                isSameDay(props.date, new Date()) ? "text-primary" : "text-muted-foreground",
            )}>
                {format(props.date, 'd')}
            </span>
            {mood && (
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all", 
                    moodToColor[mood.name] || 'bg-muted'
                )}>
                    <SmileyPebbleIcon mood={moodToFace[mood.name] || 'neutral'} className="w-5 h-5" />
                </div>
            )}
        </div>
    );
  };

  return (
    <AppShell>
       <div className="relative min-h-[calc(100vh-8rem)]">
        <QuadrantBackground />
        <div className="container mx-auto px-4 py-8 relative z-10">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <SmileyPebbleIcon mood="happy" className="h-8 w-8 text-green-700" />
                    </div>
                     <Button variant="ghost" size="icon">
                        <RefreshCcw className="h-5 w-5 text-muted-foreground"/>
                    </Button>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    {format(currentMonth, 'MMMM yyyy')}
                </h1>
                <Button variant="outline">
                    <Upload className="h-5 w-5"/>
                </Button>
            </header>

            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md bg-transparent p-0"
                classNames={{
                    months: 'p-0',
                    month: 'p-0 space-y-4',
                    caption: "hidden", // We have a custom header now
                    head_row: "flex justify-around",
                    head_cell: "text-muted-foreground font-semibold w-full uppercase text-sm",
                    row: "flex w-full mt-2 justify-around",
                    cell: "h-24 w-24 text-center text-sm p-0 relative rounded-full",
                    day: "h-24 w-24 p-0 font-normal rounded-full focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2",
                    day_selected: "bg-primary/10", // Highlight selected day
                    day_today: "", // Today is handled by day content
                    day_outside: "opacity-30",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_hidden: "invisible",
                }}
                components={{
                    DayContent: DayContent,
                }}
            />

            {error && (
            <Alert variant="destructive" className="max-w-xl mx-auto mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}
        </div>
      </div>
    </AppShell>
  );
}
