
"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { AnalysisServiceOutput } from '@/app/actions/analyze-pose-action';
import { Button } from "@/components/ui/button";
import { Activity, MessageSquareText, VideoOff, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from "@/components/ui/progress";


interface PoseAnalysisCardProps {
  videoDataUri: string | null; // Can be a data URI or a public URL from storage
  videoFileName: string | null;
  analysis: AnalysisServiceOutput | null;
  isLoading: boolean;
}

export function PoseAnalysisCard({ videoDataUri, videoFileName, analysis, isLoading }: PoseAnalysisCardProps) {
  const rawScore = analysis?.score ?? null;
  const identifiedPose = analysis?.identifiedPose ?? null;

  // Check if score is between 0-1 and multiply by 100 if so.
  const scoreValue = typeof rawScore === 'number' && rawScore <= 1 && rawScore > 0 ? rawScore * 100 : rawScore;
  const score = typeof scoreValue === 'number' 
    ? Math.min(Math.round(scoreValue), 100) 
    : null;

  // Determine if the video source is a data URI or a URL
  // A simple check for "data:video" vs "https:"
  const isDataUri = videoDataUri?.startsWith('data:video');
  const videoSrc = videoDataUri;

  return (
    <div className="w-full shadow-xl p-6 bg-black/20 backdrop-blur-lg border-white/20 text-white rounded-2xl">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="h-7 w-7 text-white" />
          Pose Analysis
        </CardTitle>
        <CardDescription className="text-white/80">
          {videoSrc ? `Showing analysis for ${videoFileName || 'your video'}.` : "Upload a video to see your pose analysis here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-6 mt-6">
        <div className="aspect-video w-full bg-black/20 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-white/20">
          {isLoading && !videoSrc && (
            <div className="flex flex-col items-center text-white/70 p-4">
              <Skeleton className="h-12 w-12 rounded-full bg-white/20 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-white/20 mb-1" />
              <Skeleton className="h-4 w-1/2 bg-white/20" />
            </div>
          )}
          {!isLoading && videoSrc ? (
            <video key={videoSrc} src={videoSrc} controls className="w-full h-full object-contain" aria-label={videoFileName || "Uploaded yoga pose video"} />
          ) : !isLoading && (
            <div className="flex flex-col items-center text-white/70 p-8 text-center">
              <VideoOff className="h-16 w-16 mb-4" />
              <p className="font-semibold text-lg">No Video Uploaded</p>
              <p className="text-sm">Your video and analysis will appear here.</p>
            </div>
          )}
        </div>
        
        {isLoading && (
          <div className="space-y-4">
            <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
                    <Award className="h-6 w-6 text-white" />
                    Pose Score
                </h3>
                <Skeleton className="h-8 w-1/4 bg-white/20 mb-1" />
                <Skeleton className="h-4 w-full bg-white/20" />
            </div>
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2 mt-4">
                <Activity className="h-6 w-6 text-white" />
                Identified Pose
              </h3>
              <Skeleton className="h-6 w-1/4 bg-white/20 mt-2" />
            </div>
            <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mt-4">
                <MessageSquareText className="h-6 w-6 text-white" />
                Feedback
                </h3>
                <Skeleton className="h-6 w-1/4 bg-white/20 mt-2" />
                <Skeleton className="h-4 w-full bg-white/20 mt-1" />
                <Skeleton className="h-4 w-full bg-white/20 mt-1" />
                <Skeleton className="h-4 w-3/4 bg-white/20 mt-1" />
            </div>
          </div>
        )}

        {!isLoading && analysis && (
          <>
            {typeof score === 'number' && (
              <div className="space-y-2 p-4 bg-black/20 rounded-xl border border-white/20">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                  <Award className="h-6 w-6" />
                  Pose Score
                </h3>
                <div className="flex items-center gap-3">
                  <Progress value={score} className="w-full h-3 bg-white/20" />
                  <span className="text-2xl font-bold text-white">{score}/100</span>
                </div>
                {score < 50 && <p className="text-sm text-red-400">Needs significant improvement. Keep practicing!</p>}
                {score >= 50 && score < 75 && <p className="text-sm text-orange-400">Good effort, but there's room to grow.</p>}
                {score >= 75 && score < 90 && <p className="text-sm text-yellow-400">Great job! Just a few minor adjustments.</p>}
                {score >= 90 && <p className="text-sm text-green-400">Excellent form! You're doing wonderfully.</p>}
              </div>
            )}
            {identifiedPose && (
              <div className="space-y-2 p-4 bg-black/20 rounded-xl border border-white/20">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                  <Activity className="h-6 w-6" /> Identified Pose
                </h3>
                <p className="text-2xl font-bold text-white">{identifiedPose}</p>
                <p className="text-sm text-white/70">Does this correctly identify your pose?</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => console.log('Correct Pose clicked')} className="bg-transparent border-white/20 hover:bg-white/10">
                    Yes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => console.log('Incorrect Pose clicked')} className="bg-transparent border-white/20 hover:bg-white/10">No</Button>
                </div>
              </div>)}
            <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/20">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                <MessageSquareText className="h-6 w-6" />
                AI Feedback
              </h3>
              <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                {analysis.feedback}
              </p>
            </div>
          </>
        )}

        {!isLoading && !analysis && videoSrc && (
           <div className="text-center text-white/70 p-4">
            <p>Analysis in progress or failed to retrieve full details. Waiting for feedback display.</p>
          </div>
        )}
      </CardContent>
      {analysis && (
        <CardFooter className="p-0 pt-6">
            <p className="text-xs text-white/60">
                Remember, AI feedback and scores are guides. Listen to your body and consult a professional if needed.
            </p>
        </CardFooter>
      )}
    </div>
  );
}
