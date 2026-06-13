"use client";

import { useState, useRef } from 'react';
import { performPoseAnalysis, type AnalysisServiceOutput } from '@/app/actions/analyze-pose-action';
import { summarizeFeedback, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { PoseAnalysisCard } from './pose-analysis-card';
import { FeedbackSubmissionCard } from './feedback-submission-card';
import { RecommendedVideosCard, type StorageVideo } from './recommended-videos-card';
import { AnalysisLoader } from './analysis-loader';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Sun, Moon, Video, Play, ArrowRight, MessageCircle } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '@/contexts/ThemeContext';
import { Textarea } from '@/components/ui/textarea';

export function SnapYogaPageClient() {
  const { user: currentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisServiceOutput | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummarizeFeedbackOutput | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<StorageVideo[]>([]);
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoDataUri(reader.result as string);
          setVideoFileName(file.name);
          setCurrentStep(2);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a video file.",
          variant: "destructive",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (!currentUser || !videoDataUri) {
        toast({
            title: "Error",
            description: "Missing video data or authentication.",
            variant: "destructive",
        });
        return;
    }

    setAnalysisResult(null); 
    setSummaryResult(null); 
    setRecommendedVideos([]);
    setError(null);
    setIsLoadingAnalysis(true);
    setIsLoadingRecommendations(true);

    try {
      const result = await performPoseAnalysis({ 
          videoDataUri: videoDataUri,
          userId: currentUser.uid,
          userNotes: userNotes,
      });
      
      if (result.videoUrl) {
          setVideoDataUri(result.videoUrl);
      }
      
      setAnalysisResult(result);

      try {
        const analysisDataToSave = {
          videoFileName: videoFileName,
          userNotes: userNotes || null,
          ...result,
          createdAt: serverTimestamp(),
        };
        const userAnalysesCollectionRef = collection(firestore, 'users', currentUser.uid, 'poseAnalyses');
        await addDoc(userAnalysesCollectionRef, analysisDataToSave);
      } catch (saveError: any) {
        console.error("Error saving analysis to Firestore:", saveError);
      }

      setIsLoadingRecommendations(false);
      setCurrentStep(3);

    } catch (e: any) {
      console.error("Error analyzing pose:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`Failed to analyze pose: ${errorMessage}`);
      toast({
        title: "Analysis Failed",
        description: `${errorMessage}`,
        variant: "destructive",
      });
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      
      {isLoadingAnalysis && <AnalysisLoader />}
      
      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          {currentStep > 1 && !isLoadingAnalysis ? (
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

        <div style={{ display: 'flex', gap: 5, marginBottom: 24 }}>
          {[1, 2, 3].map((seg) => (
            <div key={seg} style={{ flex: 1, height: 3, borderRadius: 2, background: currentStep >= seg ? 'rgba(193,154,107,0.85)' : 'rgba(255,240,215,0.10)' }} />
          ))}
        </div>

        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.55)', fontWeight: 500 }}>Step 1 of 3</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 600, color: 'rgba(255,240,215,0.92)', marginTop: 4 }}>Upload Your Video</h2>
              <p style={{ fontSize: 10, fontStyle: 'italic', color: 'rgba(255,240,215,0.42)', marginTop: 2 }}>Record or select a video of your yoga pose for AI analysis.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                border: '1px dashed rgba(193,154,107,0.35)', 
                borderRadius: 18, 
                background: 'rgba(193,154,107,0.04)', 
                minHeight: '240px' 
              }}
              className="flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-[rgba(193,154,107,0.07)] transition-colors text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-[rgba(193,154,107,0.12)] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Video style={{ color: 'rgba(193,154,107,0.85)' }} className="w-8 h-8" />
              </div>
              <p className="text-white/80 font-medium mb-1">Tap to upload a video of your practice</p>
              <p className="text-white/40 text-xs">MP4, MOV · Max 50MB</p>
              
              <div className="mt-6">
                <span style={{ color: 'rgba(193,154,107,0.92)', background: 'rgba(193,154,107,0.12)', border: '0.5px solid rgba(193,154,107,0.40)', borderRadius: 999, padding: '8px 24px', fontSize: 13, fontWeight: 500 }}>
                  Choose Video
                </span>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.55)', fontWeight: 500 }}>Step 2 of 3</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 600, color: 'rgba(255,240,215,0.92)', marginTop: 4 }}>Review & Add Context</h2>
              <p style={{ fontSize: 10, fontStyle: 'italic', color: 'rgba(255,240,215,0.42)', marginTop: 2 }}>Confirm your video and add any notes before analysis.</p>
            </div>

            {videoDataUri && (
              <div style={{ height: '150px', borderRadius: 16, border: '0.5px solid rgba(193,154,107,0.18)', overflow: 'hidden', background: 'black' }}>
                <video src={videoDataUri} controls className="w-full h-full object-contain" />
              </div>
            )}

            <div className="space-y-2">
              <label style={{ fontSize: 10, uppercase: 'true', letterSpacing: '0.08em', color: 'rgba(193,154,107,0.55)', fontWeight: 600 }}>ADDITIONAL CONTEXT (OPTIONAL)</label>
              <Textarea 
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="E.g., I'm feeling stiffness in my hamstrings..."
                style={{ 
                  border: '0.5px solid rgba(193,154,107,0.14)', 
                  background: 'rgba(255,240,215,0.02)',
                  minHeight: '120px'
                }}
                className="text-white placeholder:text-[rgba(255,240,215,0.30)] rounded-xl"
              />
            </div>

            <button 
              onClick={handleStartAnalysis}
              disabled={isLoadingAnalysis}
              style={{ color: 'rgba(193,154,107,0.92)', background: 'rgba(193,154,107,0.12)', border: '0.5px solid rgba(193,154,107,0.40)', borderRadius: 999, padding: '12px 32px', fontSize: 14, fontWeight: 600 }}
              className="w-full flex items-center justify-center gap-2 hover:bg-[rgba(193,154,107,0.18)] transition-all active:scale-95"
            >
              Analyze Pose <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.55)', fontWeight: 500 }}>Step 3 of 3</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 600, color: 'rgba(255,240,215,0.92)', marginTop: 4 }}>Analysis Results</h2>
              </div>
              <button 
                onClick={() => setCurrentStep(1)}
                style={{ fontSize: 11, color: 'rgba(193,154,107,0.85)', background: 'rgba(193,154,107,0.05)', padding: '6px 12px', borderRadius: 99, border: '0.5px solid rgba(193,154,107,0.20)' }}
              >
                Analyze Another
              </button>
            </div>

            <PoseAnalysisCard
              videoDataUri={videoDataUri}
              videoFileName={videoFileName}
              userNotes={userNotes}
              analysis={analysisResult}
              isLoading={isLoadingAnalysis}
            />

            {analysisResult && (
              <>
                <Separator className="bg-white/10" />
                <FeedbackSubmissionCard
                  onFeedbackSubmit={handleFeedbackSubmit}
                  isLoading={isLoadingSummary}
                  summary={summaryResult}
                  isAnalysisDone={!!analysisResult && analysisResult.feedback !== "Analysis failed. Please try again."}
                />
                <Separator className="bg-white/10" />
                <RecommendedVideosCard videos={[]} isLoading={isLoadingRecommendations} />
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="shadow-md mx-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

