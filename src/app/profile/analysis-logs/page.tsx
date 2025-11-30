
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp'; 
import { collection, query, orderBy, getDocs, type Timestamp } from 'firebase/firestore'; 
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, FileJson, FileText, Calendar, Activity, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { format } from 'date-fns';

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
        
        <div className="mb-8 p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-xl">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-3xl text-primary">
              <FileText className="h-8 w-8" />
              Analysis History
            </CardTitle>
            <CardDescription className="text-md">
              Review a summary of your past pose analysis sessions.
            </CardDescription>
          </CardHeader>
        </div>

        {error && !loading && (
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
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-md">
                        <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-lg">{analysis.identifiedPose}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(analysis.createdAt.toDate(), 'PPP p')}</span>
                        </div>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/analysis/${analysis.id}`} aria-label={`View details for ${analysis.identifiedPose}`}>
                        <ChevronRight className="h-6 w-6" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
