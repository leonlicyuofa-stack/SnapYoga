
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
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleVideoUpload = async (dataUri: string, fileName: string) => {
    setVideoDataUri(dataUri);
    setVideoFileName(fileName);
    setAnalysisResult(null); 
    setSummaryResult(null); 
    setRecommendedVideos([]); // Clear previous recommendations
    setError(null);
    setIsLoadingAnalysis(true);
    setIsLoadingRecommendations(true); // Start loading recommendations immediately

    try {
      const input: AnalyzeYogaPoseInput = { videoDataUri: dataUri };
      const result = await analyzeYogaPose(input);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: `Your yoga pose has been analyzed. Score: ${result.score !== undefined ? result.score + '/100' : 'N/A'}`,
      });

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
                feedback: result.feedback,
                score: result.score,
                identifiedPose: result.identifiedPose,
                createdAt: serverTimestamp(),
              };
              console.log("Saving data to Firestore in path:", `users/${currentUser.uid}/poseAnalyses`, "Data:", analysisDataToSave);
              const userAnalysesCollectionRef = collection(firestore, 'users', currentUser.uid, 'poseAnalyses');
              await addDoc(userAnalysesCollectionRef, analysisDataToSave);
              console.log("Analysis metadata saved successfully to Firestore.");
              toast({
                title: "Analysis Saved",
                description: "Your pose analysis results (excluding video data) have been saved.",
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

      // Simulate fetching recommended videos
      // Forcing recommendation fetch for visibility during dev
      setTimeout(() => {
          setRecommendedVideos([
            { id: 'vid1', title: 'Improve Your Warrior Pose Alignment', embedUrl: 'https://www.youtube.com/embed/tKAs69_N3aE' },
            { id: 'vid2', title: '5 Tips for a Better Downward Dog', embedUrl: 'https://www.youtube.com/embed/jK0arm2R2gU' },
            { id: 'vid3', title: 'Core Strengthening for Yoga Stability', embedUrl: 'https://www.youtube.com/embed/44mgUselcDU' },
            { id: 'vid4', title: 'Shoulder Opening Yoga Poses', embedUrl: 'https://www.youtube.com/embed/n3uQ227u1C8' },
          ]);
          setIsLoadingRecommendations(false);
      }, 1500);

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
      setIsLoadingRecommendations(false); // Also stop loading recommendations on error
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

      {/* Render RecommendedVideosCard if analysisResult exists, it will handle its own loading/empty state */}
      {analysisResult && (
        <>
          <Separator className="my-8" />
          <RecommendedVideosCard videos={recommendedVideos} isLoading={isLoadingRecommendations} />
        </>
      )}
    </div>
  );
}
