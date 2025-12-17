
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp'; 
import { collection, query, orderBy, getDocs, type Timestamp } from 'firebase/firestore'; 
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, FileText, Calendar as CalendarIcon, Activity, ChevronRight, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { format, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import type { DayContentProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';


interface AnalysisSummary {
  id: string;
  createdAt: Timestamp;
  identifiedPose: string;
  score: number;
}

export default function AnalysisLogsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError("You must be logged in to view analysis history.");
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch from the 'poseAnalyses' collection in Firestore
    const analysesCollectionRef = collection(firestore, `users/${currentUser.uid}/poseAnalyses`);
    const q = query(analysesCollectionRef, orderBy('createdAt', 'desc'));

    getDocs(q)
      .then((querySnapshot) => {
        const fetchedAnalyses: AnalysisSummary[] = [];
        querySnapshot.forEach((doc) => {
          fetchedAnalyses.push({ id: doc.id, ...doc.data() } as AnalysisSummary);
        });

        setAnalyses(fetchedAnalyses);
        if (fetchedAnalyses.length === 0) {
          setError("No analysis history found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching analysis history from Firestore:", err);
        setError("Failed to fetch analysis history. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser, authLoading]);
  
  const filteredAnalyses = analyses.filter(analysis => 
      selectedDate ? isSameDay(analysis.createdAt.toDate(), selectedDate) : true
  );

  const analysisDates = useMemo(() => {
    const dates = new Set<string>();
    analyses.forEach(analysis => {
      dates.add(format(analysis.createdAt.toDate(), 'yyyy-MM-dd'));
    });
    return dates;
  }, [analyses]);

  const DayWithDot = (props: DayContentProps) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const hasAnalysis = analysisDates.has(dateStr);
    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center pt-1">
        <span>{format(props.date, 'd')}</span>
        <div className={cn(
            "h-1.5 w-1.5 rounded-full mt-0.5",
            hasAnalysis ? "bg-primary" : "bg-transparent"
        )} />
      </div>
    );
  };
  
  if (authLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <SmileyRockLoader />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        <Button variant="outline" asChild className="mb-8 group">
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                            Select a Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="p-0"
                            components={{
                                DayContent: DayWithDot
                            }}
                            styles={{
                                day_selected: { 
                                    backgroundColor: 'hsl(var(--primary))', 
                                    color: 'hsl(var(--primary-foreground))',
                                    borderRadius: '9999px',
                                },
                                day_today: {
                                    backgroundColor: 'hsl(var(--accent))',
                                    color: 'hsl(var(--accent-foreground))',
                                    borderRadius: '9999px',
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2">
                {error && !loading && analyses.length === 0 && (
                  <Alert variant="destructive" className="max-w-md mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Notice</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : filteredAnalyses.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <h2 className="text-2xl font-bold">
                            Analyses for {selectedDate ? format(selectedDate, 'PPP') : 'All Time'}
                        </h2>
                        {filteredAnalyses.map((analysis) => {
                             const scoreValue = analysis.score < 1 ? analysis.score * 100 : analysis.score;
                             const score = Math.min(Math.round(scoreValue), 100);
                             return (
                                <AccordionItem value={analysis.id} key={analysis.id} className="border-b-0">
                                    <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                                        <AccordionTrigger className="p-4 hover:no-underline w-full">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="p-3 bg-primary/10 rounded-md">
                                                    <Activity className="h-8 w-8 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-lg">{analysis.identifiedPose}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{format(analysis.createdAt.toDate(), 'p')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="border-t pt-4 mt-2 space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground flex items-center"><Award className="mr-2 h-4 w-4"/>Score</span>
                                                    <Badge variant="secondary">{score} / 100</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground flex items-center"><CalendarIcon className="mr-2 h-4 w-4"/>Date</span>
                                                    <span className="font-medium">{format(analysis.createdAt.toDate(), 'PPP')}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground flex items-center"><Clock className="mr-2 h-4 w-4"/>Time</span>
                                                    <span className="font-medium">{format(analysis.createdAt.toDate(), 'p')}</span>
                                                </div>
                                                <Button asChild variant="outline" size="sm" className="w-full mt-2">
                                                    <Link href={`/analysis/${analysis.id}`}>
                                                        View Full Report
                                                        <ChevronRight className="ml-2 h-4 w-4"/>
                                                    </Link>
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </Card>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                ) : selectedDate && (
                    <div className="p-8 border-2 border-dashed rounded-lg text-center bg-card/50">
                        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No Analyses Found</h3>
                        <p className="text-muted-foreground mt-1">
                            No analysis sessions were recorded on {format(selectedDate, 'PPP')}.
                        </p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </AppShell>
  );
}
