
"use client";

import { useState } from 'react';
// Import the new server action
import { performPoseAnalysis, type AnalysisServiceOutput } from '@/app/actions/analyze-pose-action';
import { summarizeFeedback, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { VideoUploadCard } from './video-upload-card';
import { PoseAnalysisCard } from './pose-analysis-card';
import { FeedbackSubmissionCard } from './feedback-submission-card';
import { RecommendedVideosCard, type YouTubeVideo } from './recommended-videos-card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ActiveChallengesSnapshotCard } from './active-challenges-snapshot-card';

export function SnapYogaPageClient() {
  const { user: currentUser } = useAuth();
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisServiceOutput | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeFeedbackOutput | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideo[]>([]);
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleVideoUpload = async (dataUri: string, fileName: string) => {
    if (!currentUser) {
        toast({
            title: "Authentication Required",
            description: "You must be logged in to analyze a pose.",
            variant: "destructive",
        });
        return;
    }

    setVideoDataUri(dataUri);
    setVideoFileName(fileName);
    setAnalysisResult(null); 
    setSummaryResult(null); 
    setRecommendedVideos([]);
    setError(null);
    setIsLoadingAnalysis(true);
    setIsLoadingRecommendations(true);

    try {
      // Call the new server action directly
      const result = await performPoseAnalysis({ 
          videoDataUri: dataUri,
          userId: currentUser.uid,
      });
      
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: `Your yoga pose has been analyzed. Score: ${result.score !== undefined ? result.score + '/100' : 'N/A'}`,
      });

      // Save the analysis result to Firestore
      try {
        const analysisDataToSave = {
          videoFileName: fileName,
          feedback: result.feedback,
          score: result.score,
          identifiedPose: result.identifiedPose,
          videoUrl: result.videoUrl,
          createdAt: serverTimestamp(),
        };
        const userAnalysesCollectionRef = collection(firestore, 'users', currentUser.uid, 'poseAnalyses');
        await addDoc(userAnalysesCollectionRef, analysisDataToSave);
        console.log("Analysis metadata saved successfully to Firestore.");
        toast({
          title: "Analysis Saved",
          description: "Your pose analysis results have been saved to your profile.",
        });
      } catch (saveError: any) {
        console.error("Error saving analysis to Firestore:", saveError);
        toast({
          title: "Firestore Save Error",
          description: "Could not save your analysis results.",
          variant: "destructive",
        });
      }

      // Simulate fetching recommended videos based on the result
      setTimeout(() => {
          setRecommendedVideos([
            { id: 'vid1', title: `Tips for ${result.identifiedPose}`, embedUrl: 'https://www.youtube.com/embed/tKAs69_N3aE' },
            { id: 'vid2', title: `Common Mistakes in ${result.identifiedPose}`, embedUrl: 'https://www.youtube.com/embed/jK0arm2R2gU' },
          ]);
          setIsLoadingRecommendations(false);
      }, 1500);

    } catch (e: any) {
      console.error("Error analyzing pose:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`Failed to analyze pose: ${errorMessage}`);
      toast({
        title: "Analysis Failed",
        description: `${errorMessage}`,
        variant: "destructive",
      });
      // Set a failed state for the card to display
      setAnalysisResult({ feedback: "Analysis failed. Please try again.", score: 0, identifiedPose: "Unknown", videoUrl: "" });
      setIsLoadingRecommendations(false);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    setError(null);
    setIsLoadingSummary(true);
    setSummaryResult(null);

    try {
      const input: SummarizeFeedbackInput = { feedback };
      const result = await summarizeFeedback(input);
      setSummaryResult(result);
      toast({
        title: "Feedback Submitted",
        description: "Thank you! Your feedback has been summarized.",
      });
    } catch (e: any) {
      console.error("Error summarizing feedback:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while submitting feedback.";
      setError(`Failed to submit feedback: ${errorMessage}`);
      toast({
        title: "Feedback Submission Failed",
        description: `${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive" className="shadow-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <VideoUploadCard 
                onVideoUpload={handleVideoUpload} 
                isLoading={isLoadingAnalysis}
            />
            <ActiveChallengesSnapshotCard />
        </div>
        <PoseAnalysisCard
          videoDataUri={videoDataUri}
          videoFileName={videoFileName}
          analysis={analysisResult}
          isLoading={isLoadingAnalysis}
        />
      </div>
      
      {analysisResult && <Separator className="my-8" />}

      {analysisResult && (
        <FeedbackSubmissionCard
          onFeedbackSubmit={handleFeedbackSubmit}
          isLoading={isLoadingSummary}
          summary={summaryResult}
          isAnalysisDone={!!analysisResult && analysisResult.feedback !== "Analysis failed. Please try again."}
        />
      )}

      {analysisResult && (
        <>
          <Separator className="my-8" />
          <RecommendedVideosCard videos={recommendedVideos} isLoading={isLoadingRecommendations} />
        </>
      )}
    </div>
  );
}
