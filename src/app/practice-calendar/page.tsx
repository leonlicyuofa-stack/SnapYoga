
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, type Timestamp, orderBy, doc, getDoc } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CalendarDays, Dumbbell, Star, Goal, Smile, FileText, Upload, RefreshCcw, ChevronDown, Activity, CheckCircle } from 'lucide-react';
import { startOfDay, format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from '@/components/ui/calendar';
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

type ViewMode = 'mood' | 'practice';

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
  const [viewMode, setViewMode] = useState<ViewMode>('mood');
  const [moodsByDate, setMoodsByDate] = useState<Record<string, StoredMood>>({});
  const [analysesByDate, setAnalysesByDate] = useState<Record<string, StoredAnalysis[]>>({});
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
    const fetchAnalyses = getDocs(query(collection(firestore, 'users', user.uid, 'poseAnalyses'), where('createdAt', '>=', start), where('createdAt', '<=', end)));


    Promise.all([fetchMoods, fetchAnalyses]).then(([moodsSnapshot, analysesSnapshot]) => {
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

        // Process Analyses
        const fetchedAnalyses: Record<string, StoredAnalysis[]> = {};
        analysesSnapshot.forEach(doc => {
            const analysis = { id: doc.id, ...doc.data() } as StoredAnalysis;
            if(analysis.createdAt) {
                const dateStr = format(analysis.createdAt.toDate(), 'yyyy-MM-dd');
                if (!fetchedAnalyses[dateStr]) {
                    fetchedAnalyses[dateStr] = [];
                }
                fetchedAnalyses[dateStr].push(analysis);
            }
        });
        setAnalysesByDate(fetchedAnalyses);

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
    const analyses = analysesByDate[dateStr];

    const renderContent = () => {
        if (viewMode === 'mood' && mood) {
            return (
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all", 
                    moodToColor[mood.name] || 'bg-muted'
                )}>
                    <SmileyPebbleIcon mood={moodToFace[mood.name] || 'neutral'} className="w-5 h-5" />
                </div>
            );
        }
        if (viewMode === 'practice' && analyses) {
            return (
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
                    <Activity className="w-5 h-5 text-primary" />
                </div>
            )
        }
        return null;
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-1 pt-1">
            <span className={cn(
                "relative z-10 font-semibold", 
                isSameDay(props.date, new Date()) ? "text-primary" : "text-muted-foreground",
            )}>
                {format(props.date, 'd')}
            </span>
            {renderContent()}
        </div>
    );
  };

  return (
    <AppShell>
       <div className="relative min-h-[calc(100vh-4rem)]">
         <div className="absolute top-0 left-0 right-0 h-[25vh] bg-secondary rounded-b-3xl" />
         <div className="relative z-10 flex flex-col h-full">
            <header className="container mx-auto px-4 pt-8 pb-4 text-primary-foreground">
                <h1 className="text-3xl font-bold text-primary">Practice Calendar</h1>
                <p className="text-md text-primary/80">Review your practice and mood history.</p>
            </header>
            <main className="flex-grow container mx-auto px-4 mt-8">
              <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="flex items-center gap-2">
                                  {viewMode === 'mood' ? <Smile className="h-5 w-5"/> : <Activity className="h-5 w-5"/>}
                                  <span className="capitalize">{viewMode}</span>
                                  <ChevronDown className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuLabel>View Type</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                                  <DropdownMenuRadioItem value="mood">
                                      <Smile className="mr-2 h-4 w-4" />
                                      Mood
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="practice">
                                      <Activity className="mr-2 h-4 w-4" />
                                      Practice
                                  </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="icon">
                          <RefreshCcw className="h-5 w-5 text-muted-foreground"/>
                      </Button>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                      {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <Button variant="outline">
                      <Upload className="h-5 w-5"/>
                  </Button>
              </div>

              <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-md bg-card/80 backdrop-blur-sm shadow-xl border p-4"
                  classNames={{
                      months: 'p-0',
                      month: 'p-0 space-y-4',
                      caption: "hidden", // We have a custom header now
                      head_row: "flex justify-around",
                      head_cell: "text-muted-foreground font-semibold w-full uppercase text-sm",
                      row: "flex w-full mt-2 justify-around",
                      cell: "h-24 w-24 text-center text-sm p-0 relative rounded-lg",
                      day: "h-24 w-24 p-0 font-normal rounded-lg focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2",
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
            </main>
          </div>
      </div>
    </AppShell>
  );
}
