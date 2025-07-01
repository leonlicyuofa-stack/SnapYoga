
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, type Timestamp, orderBy } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CalendarDays } from 'lucide-react';
import { startOfDay } from 'date-fns';

interface StoredAnalysis {
  id: string;
  createdAt: Timestamp;
  // other fields are not strictly necessary for the calendar view, but good to have
  videoFileName?: string;
  feedback?: string;
  score?: number;
  identifiedPose?: string;
}

export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [practiceDates, setPracticeDates] = useState<Date[]>([]);
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
    // Fetch all analyses for simplicity. For many entries, pagination or range-limiting would be needed.
    const q = query(analysesRef, orderBy('createdAt', 'desc'));

    getDocs(q)
      .then((querySnapshot) => {
        const uniqueDates = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data() as StoredAnalysis;
          if (data.createdAt) {
            // Normalize to the start of the day to avoid timezone issues with highlighting
            const date = startOfDay(data.createdAt.toDate());
            uniqueDates.add(date.toISOString());
          }
        });
        setPracticeDates(Array.from(uniqueDates).map(dateStr => new Date(dateStr)));
      })
      .catch((err) => {
        console.error("Error fetching practice data:", err);
        setError("Failed to load practice data. Please try again.");
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, [user, authLoading]);

  const practicedDaysModifier = practiceDates.length > 0 ? { practiced: practiceDates } : {};
  const practicedDaysClasses = practiceDates.length > 0 
    ? { practiced: "bg-primary/20 text-primary-foreground rounded-md" } 
    : {};


  if (authLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-0">
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-3">
            <CalendarDays className="h-10 w-10" />
            Your Practice Calendar
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            View the days you've analyzed your yoga poses. Keep up the great work!
          </p>
        </header>

        {error && (
          <Alert variant="destructive" className="max-w-xl mx-auto mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="max-w-md mx-auto shadow-xl overflow-hidden">
          <CardContent className="p-1 sm:p-2 flex justify-center">
            {isLoadingData && !error ? (
              <Skeleton className="h-[330px] sm:h-[350px] w-full max-w-xs sm:max-w-sm" />
            ) : !error ? (
              <Calendar
                mode="single" // Using single to display one month, navigation handles month changes
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                selected={practiceDates} // Visually marks the dates
                modifiers={practicedDaysModifier}
                modifiersClassNames={practicedDaysClasses}
                className="rounded-md w-full"
                classNames={{
                  day_selected: "bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
                  day_today: "text-accent font-bold rounded-md",
                }}
                showOutsideDays
                disabled={isLoadingData} // Prevent interaction while loading (though not strictly needed for display)
              />
            ) : null}
          </CardContent>
          {practiceDates.length > 0 && !isLoadingData && !error && (
            <CardFooter className="bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground w-full">
                Highlighted days indicate completed pose analyses.
              </p>
            </CardFooter>
          )}
           {practiceDates.length === 0 && !isLoadingData && !error && (
            <CardFooter className="bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground w-full">
                No practices recorded yet. Analyze a pose to see it here!
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
