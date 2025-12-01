
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { AppShell } from '@/components/layout/app-shell';
import { PoseAnalysisCard } from '@/components/features/snap-yoga/pose-analysis-card';
import { RecommendedVideosCard, type StorageVideo } from '@/components/features/snap-yoga/recommended-videos-card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, FileText, YoutubeIcon, Share2, Copy } from 'lucide-react';
import type { AnalyzeYogaPoseOutput } from '@/ai/flows/analyze-yoga-pose';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';


interface StoredAnalysisData {
  id: string;
  videoFileName?: string;
  feedback: string;
  score: number;
  identifiedPose: string;
  createdAt: Timestamp;
  videoUrl?: string; // Add the videoUrl field
}

export default function PastAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const analysisId = params.analysisId as string;
  const { user: currentUser, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [analysisDetail, setAnalysisDetail] = useState<StoredAnalysisData | null>(null);
  const [analysisForCard, setAnalysisForCard] = useState<AnalyzeYogaPoseOutput | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<StorageVideo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);


  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError("You must be logged in to view analysis details.");
      setLoadingData(false);
      return;
    }

    if (currentUser && analysisId) {
      setLoadingData(true);
      setError(null);
      const analysisDocRef = doc(firestore, 'users', currentUser.uid, 'poseAnalyses', analysisId);

      getDoc(analysisDocRef)
        .then(async (docSnap) => {
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as StoredAnalysisData;
            setAnalysisDetail(data);
            setAnalysisForCard({
              feedback: data.feedback,
              score: data.score,
              identifiedPose: data.identifiedPose,
              videoUrl: data.videoUrl || "",
            });
            
            // Fetch videos from Firebase Storage
            setLoadingRecommendations(true);
            try {
                const storage = getStorage();
                // As requested, fetching from 'recommendation-video/downward-dog'
                const videosRef = ref(storage, 'recommendation-video/downward-dog');
                const videoList = await listAll(videosRef);

                const videoPromises = videoList.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return {
                        id: itemRef.name,
                        title: itemRef.name.replace(/\.\w+$/, '').replace(/[-_]/g, ' '), // Clean up title
                        url: url
                    };
                });

                const fetchedVideos = await Promise.all(videoPromises);
                setRecommendedVideos(fetchedVideos);

            } catch (storageError) {
                console.error("Error fetching recommended videos from Storage:", storageError);
                // Don't block the UI for this, just show no videos.
            } finally {
                setLoadingRecommendations(false);
            }

          } else {
            setError("Analysis not found or you do not have permission to view it.");
            setAnalysisDetail(null);
            setAnalysisForCard(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching analysis details:", err);
          setError("Failed to fetch analysis details. Please try again.");
        })
        .finally(() => {
          setLoadingData(false);
        });
    } else if (!analysisId) {
        setError("Analysis ID is missing.");
        setLoadingData(false);
    }
  }, [currentUser, analysisId, authLoading, router]);

  const handleShare = (platform: 'link' | 'instagram') => {
    if (typeof window === 'undefined') return;

    const shareUrl = `${window.location.origin}${pathname}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        if (platform === 'instagram') {
          toast({
            title: "Link Copied for Instagram!",
            description: "Paste the link in your story or bio. We'll open Instagram for you.",
          });
          if (isMobile) {
            window.location.href = "instagram://";
          } else {
            window.open("https://instagram.com", "_blank");
          }
        } else {
          toast({
            title: "Link Copied!",
            description: "A shareable link to this analysis has been copied to your clipboard.",
          });
        }
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy the link. Please try manually.",
          variant: "destructive",
        });
      });
  };


  if (authLoading || loadingData) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <SmileyRockLoader />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12 text-center">
           <Button variant="outline" onClick={() => router.back()} className="mb-8 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppShell>
    );
  }

  if (!analysisDetail || !analysisForCard) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>No analysis data to display.</p>
           <Button variant="outline" onClick={() => router.back()} className="mt-4 group">
             <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <Button variant="outline" onClick={() => router.back()} className="group self-start sm:self-center">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Button>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleShare('link')} className="group self-start sm:self-center">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="accent" onClick={() => handleShare('instagram')} className="group self-start sm:self-center">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share to Instagram
                </Button>
            </div>
        </div>
        

        <div className="mb-8 p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-xl">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-3xl text-primary">
              <FileText className="h-8 w-8" />
              Pose Analysis Report
            </CardTitle>
            {analysisDetail.videoFileName && (
              <CardDescription className="text-md">
                For video: <span className="font-semibold">{analysisDetail.videoFileName}</span>
              </CardDescription>
            )}
            <CardDescription className="text-md">
              Analyzed on: {format(analysisDetail.createdAt.toDate(), 'PPP p')}
            </CardDescription>
          </CardHeader>
        </div>

        <div className="grid grid-cols-1 gap-8 items-start">
          <PoseAnalysisCard
            videoDataUri={analysisDetail.videoUrl || null}
            videoFileName={analysisDetail.videoFileName || "Stored Analysis"}
            analysis={analysisForCard}
            isLoading={false}
          />
        </div>
        
        <div className="mt-8">
            <RecommendedVideosCard videos={recommendedVideos} isLoading={loadingRecommendations} />
        </div>

      </div>
    </AppShell>
  );
}
