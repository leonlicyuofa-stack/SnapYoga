
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, orderBy, type Timestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { Badge } from '@/components/ui/badge';

interface RawLog {
  id: string;
  createdAt: Timestamp;
  isError: boolean;
  rawResponse: any;
  videoUrl: string;
  gsPath?: string;
  responseStatus?: number;
  errorBody?: string;
}

export default function AnalysisLogsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<RawLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError("You must be logged in to view analysis logs.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const logsCollectionRef = collection(firestore, 'users', currentUser.uid, 'poseAnalysisRawLogs');
    const q = query(logsCollectionRef, orderBy('createdAt', 'desc'));

    getDocs(q)
      .then((querySnapshot) => {
        const fetchedLogs: RawLog[] = [];
        querySnapshot.forEach((doc) => {
          fetchedLogs.push({ id: doc.id, ...doc.data() } as RawLog);
        });
        setLogs(fetchedLogs);
        if (fetchedLogs.length === 0) {
            setError("No analysis logs found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching analysis logs:", err);
        setError("Failed to fetch analysis logs. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser, authLoading]);

  const handleDownloadJson = (data: any, logId: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-log-${logId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const renderLogContent = (log: RawLog) => {
    // Check for the new, more complex structure first
    if (log.rawResponse?.summary?.primary_pose_detected) {
      const { summary } = log.rawResponse;
      return (
        <>
          <p><strong>Pose:</strong> {summary.primary_pose_detected}</p>
          <p><strong>Score:</strong> {summary.average_performance_score?.toFixed(2)}</p>
          <p><strong>Grade:</strong> {summary.performance_grade}</p>
          <p><strong>Frames:</strong> {summary.total_frames_analyzed}</p>
        </>
      )
    }
    
    // Fallback to old structure
    if (log.rawResponse?.identifiedPose) {
        return (
             <>
              <p><strong>Pose:</strong> {log.rawResponse.identifiedPose}</p>
              <p><strong>Score:</strong> {log.rawResponse.score?.toFixed(2)}</p>
            </>
        )
    }
    
    // Fallback for errors or unknown structures
    return (
        <p className="text-destructive font-mono text-xs">{log.errorBody || JSON.stringify(log.rawResponse)}</p>
    )
  }

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
              Raw Analysis Logs
            </CardTitle>
            <CardDescription className="text-md">
              Here you can view and download the raw JSON responses from the pose analysis service for debugging.
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
            {logs.map((log) => (
              <Card key={log.id} className="bg-card/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Log ID: {log.id}</CardTitle>
                        <CardDescription>{format(log.createdAt.toDate(), 'PPP p')}</CardDescription>
                    </div>
                     <Badge variant={log.isError ? "destructive" : "default"} className={!log.isError ? 'bg-green-600' : ''}>
                        {log.isError ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        {log.isError ? `Error: ${log.responseStatus || 'N/A'}` : `Success: ${log.responseStatus || '200'}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="p-3 bg-muted/50 rounded-md border text-sm">
                        <h4 className="font-semibold mb-2">Analysis Summary:</h4>
                        {renderLogContent(log)}
                   </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => handleDownloadJson(log.rawResponse, log.id)} size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download Raw JSON
                    </Button>
                     {log.videoUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={log.videoUrl} target="_blank" rel="noopener noreferrer">
                                View Video
                            </a>
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
