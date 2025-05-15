
"use client";

import { useState, useEffect } from 'react';
import { analyzeYogaPose, type AnalyzeYogaPoseInput, type AnalyzeYogaPoseOutput } from '@/ai/flows/analyze-yoga-pose';
import { summarizeFeedback, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { VideoUploadCard } from './video-upload-card';
import { PoseAnalysisCard } from './pose-analysis-card';
import { FeedbackSubmissionCard } from './feedback-submission-card';
import { RecommendedVideosCard, type YouTubeVideo } from './recommended-videos-card'; // Added import
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Separator } from '@/components/ui/separator';

export function SnapYogaPageClient() {
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeYogaPoseOutput | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeFeedbackOutput | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideo[]>([]); // Added state for videos
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleVideoUpload = async (dataUri: string, fileName: string) => {
    setVideoDataUri(dataUri);
    setVideoFileName(fileName);
    setAnalysisResult(null); 
    setSummaryResult(null); 
    setRecommendedVideos([]); // Reset videos
    setError(null);
    setIsLoadingAnalysis(true);

    try {
      const input: AnalyzeYogaPoseInput = { videoDataUri: dataUri };
      const result = await analyzeYogaPose(input);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Your yoga pose has been analyzed.",
      });
    } catch (e) {
      console.error("Error analyzing pose:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`Failed to analyze pose: ${errorMessage}`);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
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

  // Populate recommended videos when analysis result is available
  useEffect(() => {
    if (analysisResult) {
      // These are example videos. In a real app, these could be
      // dynamically fetched or recommended by an AI based on the analysis.
      const exampleVideos: YouTubeVideo[] = [
        { id: '0hxF5hYtYgI', title: 'Yoga For Complete Beginners - 20 Minute Home Workout', embedUrl: 'https://www.youtube.com/embed/0hxF5hYtYgI' },
        { id: '4iTzE_X3qYw', title: 'Yoga For Back Pain - 20 Minute Back Stretch', embedUrl: 'https://www.youtube.com/embed/4iTzE_X3qYw' },
        { id: '5X18EXg5L2Q', title: 'Total Body Yoga - Deep Stretch', embedUrl: 'https://www.youtube.com/embed/5X18EXg5L2Q' },
      ];
      setRecommendedVideos(exampleVideos);
    } else {
      setRecommendedVideos([]);
    }
  }, [analysisResult]);

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
          isAnalysisDone={!!analysisResult}
        />
      )}

      {/* Recommended Videos Section */}
      {analysisResult && recommendedVideos.length > 0 && (
        <>
          <Separator className="my-8" />
          <RecommendedVideosCard videos={recommendedVideos} />
        </>
      )}
    </div>
  );
}
