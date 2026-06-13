"use client";

import { useState } from 'react';
// Import the new server action
import { performPoseAnalysis, type AnalysisServiceOutput } from '@/app/actions/analyze-pose-action';
import { summarizeFeedback, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { VideoUploadCard } from './video-upload-card';
import { PoseAnalysisCard } from './pose-analysis-card';
import { FeedbackSubmissionCard } from './feedback-submission-card';
import { RecommendedVideosCard, type StorageVideo } from './recommended-videos-card';
import { AnalysisLoader } from './analysis-loader';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function SnapYogaPageClient() {
  const { user: currentUser } = useAuth();
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisServiceOutput | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeFeedbackOutput | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<StorageVideo[]>([]);
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleVideoUpload = async (dataUri: string, fileName: string, notes: string) => {
    if (!currentUser) {
        toast({
            title: "Authentication Required",
            description: "You must be logged in to analyze a pose.",
            variant: "destructive",
        });
        return;
    }

    // Set initial local state for immediate feedback
    setVideoDataUri(dataUri);
    setVideoFileName(fileName);
    setUserNotes(notes);
    setAnalysisResult(null); 
    setSummaryResult(null); 
    setRecommendedVideos([]);
    setError(null);
    setIsLoadingAnalysis(true);
    setIsLoadingRecommendations(true);

    try {
      // Call the server action to upload and analyze
      const result = await performPoseAnalysis({ 
          videoDataUri: dataUri,
          userId: currentUser.uid,
          userNotes: notes,
      });
      
      // CRITICAL: Update the source URI to the final cloud URL FIRST
      // This ensures that when the card stops "loading", it already has the stable URL
      if (result.videoUrl) {
          setVideoDataUri(result.videoUrl);
      }
      
      setAnalysisResult(result);

      toast({
        title: "Analysis Complete",
        description: `Your yoga pose has been analyzed. Score: ${result.score !== undefined ? Math.round(result.score) + '/100' : 'N/A'}`,
      });

      // Save the analysis result to Firestore
      try {
        const analysisDataToSave = {
          videoFileName: fileName,
          userNotes: notes || null,
          ...result,
          createdAt: serverTimestamp(),
        };
        const userAnalysesCollectionRef = collection(firestore, 'users', currentUser.uid, 'poseAnalyses');
        await addDoc(userAnalysesCollectionRef, analysisDataToSave);
        console.log("Analysis metadata saved successfully to Firestore.");
      } catch (saveError: any) {
        console.error("Error saving analysis to Firestore:", saveError);
      }

      setIsLoadingRecommendations(false);

    } catch (e: any) {
      console.error("Error analyzing pose:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`Failed to analyze pose: ${errorMessage}`);
      toast({
        title: "Analysis Failed",
        description: `${errorMessage}`,
        variant: "destructive",
      });
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {isLoadingAnalysis && <AnalysisLoader />}
      
      {error && (
        <Alert variant="destructive" className="shadow-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-8 items-start">
        <VideoUploadCard 
            onVideoUpload={handleVideoUpload} 
            isLoading={isLoadingAnalysis}
        />
        
        <PoseAnalysisCard
          videoDataUri={videoDataUri}
          videoFileName={videoFileName}
          userNotes={userNotes}
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
          <RecommendedVideosCard videos={[]} isLoading={isLoadingRecommendations} />
        </>
      )}
    </div>
  );
}
