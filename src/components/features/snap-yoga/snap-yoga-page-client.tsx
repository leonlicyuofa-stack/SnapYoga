
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

      console.log("handleVideoUpload - currentUser:", currentUser);
      console.log("handleVideoUpload - analysis result:", result);

      if (currentUser && result) {
        console.log("Attempting to save analysis. User ID:", currentUser.uid, "Result exists:", !!result);
        if (!currentUser.uid) {
            console.error("Cannot save analysis: Current user UID is missing.");
            toast({
                title: "Save Error",
                description: "User authentication data is incomplete. Cannot save analysis.",
                variant: "destructive",
            });
        } else {
            try {
              const analysisDataToSave = {
                videoFileName: fileName,
                videoDataUri: dataUri, // For smaller videos or as a reference. Consider Firebase Storage for large files.
                feedback: result.feedback,
                score: result.score,
                identifiedPose: result.identifiedPose,
                createdAt: serverTimestamp(),
              };
              console.log("Saving data to Firestore in path:", `users/${currentUser.uid}/poseAnalyses`, "Data:", analysisDataToSave);
              const userAnalysesCollectionRef = collection(firestore, 'users', currentUser.uid, 'poseAnalyses');
              await addDoc(userAnalysesCollectionRef, analysisDataToSave);
              console.log("Analysis saved successfully to Firestore.");
              toast({
                title: "Analysis Saved",
                description: "Your pose analysis results have been saved to your profile.",
              });
            } catch (saveError: any) {
              console.error("Error saving analysis to Firestore:", saveError);
              let description = "Could not save your analysis results. Please try again.";
              if (saveError.message) {
                description += ` Error: ${saveError.message}`;
              }
              if (saveError.code) {
                description += ` Code: ${saveError.code}`;
              }
              toast({
                title: "Firestore Save Error",
                description: description,
                variant: "destructive",
              });
            }
        }
      } else {
        console.log("Skipping save analysis. currentUser is falsy or result is falsy.", "currentUser:", currentUser, "result:", result);
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

    } catch (e: any) {
      console.error("Error analyzing pose:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`Failed to analyze pose: ${errorMessage}`);
      toast({
        title: "Analysis Failed",
        description: `${errorMessage}${e.code ? ` (Code: ${e.code})` : ''}`,
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
    } catch (e: any) {
      console.error("Error summarizing feedback:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while submitting feedback.";
      setError(`Failed to submit feedback: ${errorMessage}`);
      toast({
        title: "Feedback Submission Failed",
        description: `${errorMessage}${e.code ? ` (Code: ${e.code})` : ''}`,
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
