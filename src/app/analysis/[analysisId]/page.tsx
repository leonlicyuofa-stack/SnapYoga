"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { AppShell } from '@/components/layout/app-shell';
import { PoseAnalysisCard } from '@/components/features/snap-yoga/pose-analysis-card';
import { RecommendedVideosCard, type StorageVideo } from '@/components/features/snap-yoga/recommended-videos-card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Share2, Copy } from 'lucide-react';
import type { AnalysisServiceOutput } from '@/app/actions/analyze-pose-action';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';


interface StoredAnalysisData extends AnalysisServiceOutput {
  id: string;
  createdAt: Timestamp;
  videoFileName?: string;
  userNotes?: string;
}

export default function PastAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const analysisId = params.analysisId as string;
  const { user: currentUser, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const isMobile = useIsMobile();
  // Light = amethyst on lavender; dark = the original cream/gold on ink.
  const txt = (a: number) => isDark ? `rgba(255,240,215,${a})` : `rgba(50,14,59,${a})`;
  const acc = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  const TITLE = isDark ? 'rgba(255,240,215,0.94)' : 'rgba(255,248,235,0.96)';
  const TITLE_SH = isDark ? 'none' : '0 1px 3px rgba(70,60,80,0.32)';

  const [analysisDetail, setAnalysisDetail] = useState<StoredAnalysisData | null>(null);
  const [analysisForCard, setAnalysisForCard] = useState<AnalysisServiceOutput | null>(null);
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

            const analysisForCardPayload: AnalysisServiceOutput = {
              feedback: data.feedback,
              score: data.score,
              identifiedPose: data.identifiedPose,
              videoUrl: data.videoUrl ?? '',
              poseConfidence: data.poseConfidence,
              identificationReasoning: data.identificationReasoning,
              jointAssessment: data.jointAssessment,
              performanceGrade: data.performanceGrade,
              priorityCorrections: data.priorityCorrections,
              strengths: data.strengths,
              recommendedPreparatoryPoses: data.recommendedPreparatoryPoses,
              progressionPath: data.progressionPath,
              motivationalNote: data.motivationalNote,
            };
            setAnalysisForCard(analysisForCardPayload);
            
            // Fetch videos from Firebase Storage
            setLoadingRecommendations(true);
            try {
                const storage = getStorage();
                // Corrected path to match your sample link structure
                const videosRef = ref(storage, 'recommendation-videos/downward-dog');
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
          <SmileyRockLoader text="Loading Analysis..." />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12 text-center max-w-md">
           <button onClick={() => router.back()} aria-label="Go back" className="rounded-full h-10 w-10 p-0 inline-flex items-center justify-center bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-md transition-all hover:scale-105 backdrop-blur-sm border border-[rgba(50,14,59,0.4)] dark:border-white/20 mb-8">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300">
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
          <p style={{ color: txt(0.55) }}>No analysis data to display.</p>
           <button onClick={() => router.back()} aria-label="Go back" className="rounded-full h-10 w-10 p-0 inline-flex items-center justify-center bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-md transition-all hover:scale-105 backdrop-blur-sm border border-[rgba(50,14,59,0.4)] dark:border-white/20 mt-4">
             <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8 gap-4">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="rounded-full h-10 w-10 p-0 inline-flex items-center justify-center bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-md transition-all hover:scale-105 backdrop-blur-sm border border-[rgba(50,14,59,0.4)] dark:border-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
                <button
                  onClick={() => handleShare('link')}
                  className="inline-flex items-center gap-1.5 transition-all active:scale-95"
                  style={{ color: acc(0.92), background: acc(0.10), border: `0.5px solid ${acc(0.35)}`, borderRadius: 999, padding: '7px 16px', fontSize: 12, fontWeight: 500 }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </button>
                <button
                  onClick={() => handleShare('instagram')}
                  className="inline-flex items-center gap-1.5 transition-all active:scale-95"
                  style={{ color: isDark ? 'rgba(25,16,8,0.95)' : 'rgba(255,248,235,0.95)', background: isDark ? 'rgba(193,154,107,0.85)' : '#320E3B', borderRadius: 999, padding: '7px 16px', fontSize: 12, fontWeight: 600 }}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
            </div>
        </div>

        {/* REPORT HEADER */}
        <div className="mb-8">
          <p style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: acc(0.55) }}>
            Pose Analysis Report
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, fontWeight: 600, color: TITLE, textShadow: TITLE_SH, marginTop: 4 }}>
            {analysisDetail.identifiedPose || 'Your Practice'}
          </h1>
          <p style={{ fontSize: 11, fontStyle: 'italic', color: txt(0.42), marginTop: 4 }}>
            {analysisDetail.videoFileName ? `${analysisDetail.videoFileName} · ` : ''}
            {format(analysisDetail.createdAt.toDate(), 'PPP p')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 items-start">
          <PoseAnalysisCard
            videoDataUri={analysisDetail.videoUrl || null}
            videoFileName={analysisDetail.videoFileName || "Stored Analysis"}
            userNotes={analysisDetail.userNotes}
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
