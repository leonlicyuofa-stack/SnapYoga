
"use client";

import { useState, useEffect } from 'react';
import { analyzeYogaPose, type AnalyzeYogaPoseInput, type AnalyzeYogaPoseOutput } from '@/ai/flows/analyze-yoga-pose';
import { summarizeFeedback, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { VideoUploadCard } from './video-upload-card';
import { PoseAnalysisCard } from './pose-analysis-card';
import { FeedbackSubmissionCard } from './feedback-submission-card';
import { RecommendedVideosCard, type YouTubeVideo } from './recommended-videos-card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';

export function SnapYogaPageClient() {
  const { user: currentUser } = useAuth();
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeYogaPoseOutput | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeFeedbackOutput | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideo[]>([]);
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleVideoUpload = async (dataUri: string, fileName: string) => {
    setVideoDataUri(dataUri);
    setVideoFileName(fileName);
    setAnalysisResult(null); 
    setSummaryResult(null); 
    setRecommendedVideos([]);
    setError(null);
    setIsLoadingAnalysis(true);

    try {
      const input: AnalyzeYogaPoseInput = { videoDataUri: dataUri };
      const result = await analyzeYogaPose(input);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: `Your yoga pose has been analyzed. Score: ${result.score !== undefined ? result.score + '/100' : 'N/A'}`,
      });

      if (currentUser && result) {
        try {
          const analysisDataToSave = {
            videoFileName: fileName,
            videoDataUri: dataUri, // For smaller videos or as a reference. Consider Firebase Storage for large files.
            feedback: result.feedback,
            score: result.score,
            identifiedPose: result.identifiedPose,
            createdAt: serverTimestamp(),
          };
          const userAnalysesCollectionRef = collection(firestore, 'users', currentUser.uid, 'poseAnalyses');
          await addDoc(userAnalysesCollectionRef, analysisDataToSave);
          toast({
            title: "Analysis Saved",
            description: "Your pose analysis results have been saved to your profile.",
          });
        } catch (saveError) {
          console.error("Error saving analysis to Firestore:", saveError);
          toast({
            title: "Save Error",
            description: "Could not save your analysis results. Please try again.",
            variant: "destructive",
          });
        }
      }


      // Populate recommended videos (placeholder logic)
      if (result && result.score < 90) {
        setRecommendedVideos([
          { id: 'v1', title: 'Improve Your Posture with These 5 Exercises', embedUrl: 'https://www.youtube.com/embed/watch?v=BqgS03wTOsA' },
          { id: 'v2', title: 'Yoga for Better Alignment and Balance', embedUrl: 'https://www.youtube.com/embed/watch?v=o8_jPgtpZ3w' },
          { id: 'v3', title: 'Core Strengthening for Yoga Stability', embedUrl: 'https://www.youtube.com/embed/watch?v=44mgUselcDU' },
          { id: 'v4', title: 'Shoulder Opening Yoga Poses', embedUrl: 'https://www.youtube.com/embed/watch?v=n3uQ227u1C8' },
        ]);
      }

    } catch (e) {
      console.error("Error analyzing pose:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`Failed to analyze pose: ${errorMessage}`);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setAnalysisResult({ feedback: "Analysis failed. Please try again.", score: 0, identifiedPose: "Unknown" });
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
    } catch (e) {
      console.error("Error summarizing feedback:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while submitting feedback.";
      setError(`Failed to submit feedback: ${errorMessage}`);
      toast({
        title: "Feedback Submission Failed",
        description: errorMessage,
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
        <VideoUploadCard onVideoUpload={handleVideoUpload} isLoading={isLoadingAnalysis} />
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

      {analysisResult && recommendedVideos.length > 0 && (
        <>
          <Separator className="my-8" />
          <RecommendedVideosCard videos={recommendedVideos} isLoading={isLoadingAnalysis && recommendedVideos.length === 0} />
        </>
      )}
    </div>
  );
}
