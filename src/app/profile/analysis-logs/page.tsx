
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/firebase/clientApp'; // Import storage
import { ref, listAll, getDownloadURL, type StorageReference } from 'firebase/storage'; // Import storage functions
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, FileJson, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

interface StorageFile {
  name: string;
  downloadUrl: string;
}

export default function AnalysisLogsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError("You must be logged in to view analysis result files.");
      setLoading(false);
      return;
    }

    setLoading(true);
    // Path to the user's result files in Firebase Storage
    const filesListRef = ref(storage, `pose_analysis_results/${currentUser.uid}/`);

    listAll(filesListRef)
      .then(async (res) => {
        const fetchedFiles: StorageFile[] = [];
        for (const itemRef of res.items) {
          try {
            const downloadUrl = await getDownloadURL(itemRef);
            fetchedFiles.push({
              name: itemRef.name,
              downloadUrl: downloadUrl,
            });
          } catch (urlError) {
             console.error("Error getting download URL for", itemRef.name, urlError);
             // Optionally add to an error list to show the user
          }
        }
        
        // Sort files by name descending (newest first if names are date-based)
        fetchedFiles.sort((a, b) => b.name.localeCompare(a.name));

        setFiles(fetchedFiles);
        if (fetchedFiles.length === 0) {
          setError("No analysis result files found in Storage.");
        }
      })
      .catch((err) => {
        console.error("Error listing files from Firebase Storage:", err);
        setError("Failed to fetch analysis files. Please check permissions and try again.");
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
              <FileJson className="h-8 w-8" />
              Analysis Result Files
            </CardTitle>
            <CardDescription className="text-md">
              Here you can view and download the raw JSON result files from Firebase Storage for debugging.
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
            {files.map((file) => (
              <Card key={file.name} className="bg-card/80 backdrop-blur-sm shadow-md">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                        <p className="font-semibold text-sm sm:text-base break-all">{file.name}</p>
                        <p className="text-xs text-muted-foreground">Firebase Storage File</p>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" download={file.name}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </a>
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
