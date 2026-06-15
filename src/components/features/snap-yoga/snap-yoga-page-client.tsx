"use client";

import { useState, useRef } from 'react';
import { performPoseAnalysis, type AnalysisServiceOutput } from '@/app/actions/analyze-pose-action';
import { summarizeFeedback, type SummarizeFeedbackInput, type SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { PoseAnalysisCard, getScoreLevel } from './pose-analysis-card';
import { FeedbackSubmissionCard } from './feedback-submission-card';
import { RecommendedVideosCard, type StorageVideo } from './recommended-videos-card';
import { FollowUpPracticeCard } from './follow-up-practice-card';
import { AnalysisLoader } from './analysis-loader';
import { UpgradeSheet } from '@/components/features/upgrade/upgrade-sheet';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Sun, Moon, Video, Play, ArrowRight, MessageCircle } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '@/contexts/ThemeContext';
import { Textarea } from '@/components/ui/textarea';

export function SnapYogaPageClient() {
  const { user: currentUser, isGold } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [showFullResults, setShowFullResults] = useState(false);
  const [isUpgradeSheetOpen, setIsUpgradeSheetOpen] = useState(false);

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

  const handleFollowUpTap = () => {
    if (isGold) {
      console.log("Gold member access: playing follow-up video...");
      toast({
        title: "Starting Practice",
        description: "Your guided hip opening flow is starting.",
      });
    } else {
      setIsUpgradeSheetOpen(true);
    }
  };

  const handleMockUpgrade = async () => {
    if (!currentUser) return;
    try {
      await createUserProfileDocument(currentUser, { membershipTier: 'gold' });
      setIsUpgradeSheetOpen(false);
      toast({
        title: "Welcome to Gold! ♛",
        description: "Your unlimited access is now active.",
      });
    } catch (e) {
      console.error("Failed to upgrade:", e);
      toast({
        title: "Upgrade Failed",
        description: "Could not complete the mock upgrade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setVideoDataUri(null);
    setVideoFileName(null);
    setUserNotes("");
    setAnalysisResult(null);
    setSummaryResult(null);
    setShowFullResults(false);
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      
      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 12rem)' }}>
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

        {isLoadingAnalysis ? (
          <AnalysisLoader />
        ) : (
          <div className="flex-1">
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
                  <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(193,154,107,0.55)', fontWeight: 600 }}>ADDITIONAL CONTEXT (OPTIONAL)</label>
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
                  style={{ color: 'rgba(25,16,8,0.95)', background: 'rgba(193,154,107,0.85)', borderRadius: 999, padding: '12px 32px', fontSize: 14, fontWeight: 600 }}
                  className="w-full flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  Analyze Pose <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div>
                  <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.55)', fontWeight: 500 }}>Step 3 of 3 · Results</p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 600, color: 'rgba(255,240,215,0.92)', marginTop: 4 }}>Your Analysis</h2>
                </div>

                {analysisResult && (
                  <>
                    {/* Score Summary */}
                    <div className="flex flex-col items-center justify-center py-6">
                      {(() => {
                        const score = Math.round(analysisResult.score);
                        const level = getScoreLevel(score);
                        const offset = 251 - (251 * score / 100);
                        return (
                          <>
                            <svg width="96" height="96" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,240,215,0.07)" strokeWidth="8"/>
                              <circle cx="50" cy="50" r="40" fill="none" stroke={level.color} strokeWidth="8"
                                strokeDasharray="251" strokeDashoffset={offset} strokeLinecap="round"
                                transform="rotate(-90 50 50)"/>
                              <text x="50" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill="rgba(255,240,215,0.92)" fontFamily="Cormorant Garamond, serif">{score}</text>
                            </svg>
                            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 600, fontStyle: 'italic', color: level.color, marginTop: 8 }}>{level.label}</p>
                          </>
                        );
                      })()}
                    </div>

                    {/* Identified Pose Summary Card */}
                    <div style={{ borderRadius: 16, border: '0.5px solid rgba(193,154,107,0.18)', background: 'rgba(255,240,215,0.02)', padding: 20 }} className="text-center">
                      <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.55)', fontWeight: 600 }}>Identified Pose</p>
                      <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginTop: 4 }}>{analysisResult.identifiedPose}</h3>
                      <p style={{ fontSize: 12, color: 'rgba(255,240,215,0.40)', marginTop: 12 }}>Does this correctly identify your pose?</p>
                      <div className="flex justify-center gap-3 mt-4">
                        <button style={{ borderRadius: 99, border: '0.5px solid rgba(193,154,107,0.40)', padding: '6px 20px', fontSize: 12, color: 'white', background: 'rgba(255,255,255,0.05)' }} className="hover:bg-white/10 transition-colors">Yes</button>
                        <button style={{ borderRadius: 99, border: '0.5px solid rgba(193,154,107,0.40)', padding: '6px 20px', fontSize: 12, color: 'white', background: 'rgba(255,255,255,0.05)' }} className="hover:bg-white/10 transition-colors">No</button>
                      </div>
                    </div>

                    {/* View Full Feedback Trigger */}
                    <button 
                      onClick={() => setShowFullResults(!showFullResults)}
                      style={{ color: 'rgba(193,154,107,0.92)', background: 'rgba(193,154,107,0.12)', border: '0.5px solid rgba(193,154,107,0.40)', borderRadius: 999, padding: '8px 20px', fontSize: 13, fontWeight: 500 }}
                      className="flex items-center gap-2 hover:bg-[rgba(193,154,107,0.18)] transition-all mx-auto"
                    >
                      {showFullResults ? "Hide Full Report" : "View Full Feedback →"}
                    </button>

                    {showFullResults && (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <PoseAnalysisCard
                          videoDataUri={videoDataUri}
                          videoFileName={videoFileName}
                          userNotes={userNotes}
                          analysis={analysisResult}
                          isLoading={isLoadingAnalysis}
                        />
                      </div>
                    )}

                    <Separator className="bg-white/10 my-8" />
                    
                    <FeedbackSubmissionCard
                      onFeedbackSubmit={handleFeedbackSubmit}
                      isLoading={isLoadingSummary}
                      summary={summaryResult}
                      isAnalysisDone={!!analysisResult && analysisResult.feedback !== "Analysis failed. Please try again."}
                    />
                    
                    <Separator className="bg-white/10 my-8" />

                    <FollowUpPracticeCard onTap={handleFollowUpTap} />
                    
                    <Separator className="bg-white/10 my-8" />
                    
                    <RecommendedVideosCard videos={[]} isLoading={isLoadingRecommendations} />

                    <button 
                      onClick={handleReset}
                      className="text-white/40 hover:text-white/60 text-xs italic w-full text-center mt-8 pb-12 transition-colors"
                    >
                      Analyze another pose
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Gating Sheet */}
      <UpgradeSheet 
        isOpen={isUpgradeSheetOpen} 
        onClose={() => setIsUpgradeSheetOpen(false)}
        onUpgrade={handleMockUpgrade}
      />

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
