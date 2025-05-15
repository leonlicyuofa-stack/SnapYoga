"use client";

import { useState } from 'react';
import { analyzeYogaPose, type AnalyzeYogaPoseInput, type AnalyzeYogaPoseOutput } from '@/ai/flows/analyze-yoga-pose';
import { summarizeFeedback, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { VideoUploadCard } from './video-upload-card';
import { PoseAnalysisCard } from './pose-analysis-card';
import { FeedbackSubmissionCard } from './feedback-submission-card';
// RecommendedVideosCard import and YouTubeVideo type import removed
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Separator } from '@/components/ui/separator';

export function SnapYogaPageClient() {
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeYogaPoseOutput | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeFeedbackOutput | null>(null);
  // recommendedVideos state removed
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleVideoUpload = async (dataUri: string, fileName: string) => {
    setVideoDataUri(dataUri);
    setVideoFileName(fileName);
    setAnalysisResult(null); 
    setSummaryResult(null); 
    // setRecommendedVideos([]) removed
    setError(null);
    setIsLoadingAnalysis(true);

    try {
      const input: AnalyzeYogaPoseInput = { videoDataUri: dataUri };
      const result = await analyzeYogaPose(input);
      setAnalysisResult(result); // Result now includes score
      toast({
        title: "Analysis Complete",
        description: `Your yoga pose has been analyzed. Score: ${result.score !== undefined ? result.score + '/100' : 'N/A'}`,
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
      // Set a default error analysis result to show something went wrong
      setAnalysisResult({ feedback: "Analysis failed. Please try again.", score: 0 });
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

  // useEffect for recommended videos removed

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
          analysis={analysisResult} // This will now contain the score
          isLoading={isLoadingAnalysis}
        />
      </div>
      
      {analysisResult && <Separator className="my-8" />}

      {analysisResult && ( // Only show feedback card if analysis was at least attempted
        <FeedbackSubmissionCard
          onFeedbackSubmit={handleFeedbackSubmit}
          isLoading={isLoadingSummary}
          summary={summaryResult}
          isAnalysisDone={!!analysisResult && analysisResult.feedback !== "Analysis failed. Please try again."} // Ensure analysis didn't just fail
        />
      )}

      {/* Recommended Videos Section rendering removed */}
    </div>
  );
}
