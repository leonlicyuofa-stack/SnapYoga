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
import { Terminal, Sun, Moon } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '@/contexts/ThemeContext';

export function SnapYogaPageClient() {
  const { user: currentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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
      if (result.videoUrl) {
          setVideoDataUri(result.videoUrl);
      }
      
      setAnalysisResult(result);

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
      
      {/* WIZARD STRUCTURE */}
      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar: back arrow (steps 2-3 only) + theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((s) => (s - 1) as 1 | 2 | 3)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'rgba(255,240,215,0.70)' }}
              aria-label="Go back"
            >←</button>
          ) : <span />}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid rgba(193,154,107,0.30)', background: 'rgba(193,154,107,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {isDark
              ? <Sun style={{ width: 13, height: 13, color: 'rgba(193,154,107,0.75)' }} />
              : <Moon style={{ width: 13, height: 13, color: 'rgba(193,154,107,0.75)' }} />}
          </button>
        </div>

        {/* Progress bar — 3 segments */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
          {[1, 2, 3].map((seg) => (
            <div key={seg} style={{ flex: 1, height: 3, borderRadius: 2, background: currentStep >= seg ? 'rgba(193,154,107,0.85)' : 'rgba(255,240,215,0.10)' }} />
          ))}
        </div>

        {/* Step content placeholders */}
        {currentStep === 1 && (
          <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
            <h2 className="text-white mb-4">Step 1: Upload Pose</h2>
            <button 
              onClick={() => setCurrentStep(2)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
            >
              Go to Step 2 (Demo)
            </button>
          </div>
        )}
        {currentStep === 2 && (
          <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
            <h2 className="text-white mb-4">Step 2: Processing</h2>
            <button 
              onClick={() => setCurrentStep(3)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
            >
              Go to Step 3 (Demo)
            </button>
          </div>
        )}
        {currentStep === 3 && (
          <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
            <h2 className="text-white mb-4">Step 3: Results</h2>
            <p className="text-white/60 italic">Your analysis results will appear here.</p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Legacy layout for now — will be integrated into steps in next prompts */}
      <div className="flex flex-col gap-8 items-start opacity-50">
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
