"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { AnalyzeYogaPoseOutput } from '@/ai/flows/analyze-yoga-pose';
import { Activity, MessageSquareText, VideoOff, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from "@/components/ui/progress";


interface PoseAnalysisCardProps {
  videoDataUri: string | null;
  videoFileName: string | null;
  analysis: AnalyzeYogaPoseOutput | null;
  isLoading: boolean;
}

export function PoseAnalysisCard({ videoDataUri, videoFileName, analysis, isLoading }: PoseAnalysisCardProps) {
  const score = analysis?.score ?? null;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="h-7 w-7 text-primary" />
          Pose Analysis
        </CardTitle>
        <CardDescription>
          {videoDataUri ? `Showing analysis for ${videoFileName || 'your video'}.` : "Upload a video to see your pose analysis here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center border border-dashed">
          {isLoading && !videoDataUri && (
            <div className="flex flex-col items-center text-muted-foreground p-4">
              <Skeleton className="h-12 w-12 rounded-full bg-gray-300 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-gray-300 mb-1" />
              <Skeleton className="h-4 w-1/2 bg-gray-300" />
            </div>
          )}
          {!isLoading && videoDataUri ? (
            <video src={videoDataUri} controls className="w-full h-full object-contain" aria-label={videoFileName || "Uploaded yoga pose video"} />
          ) : !isLoading && (
            <div className="flex flex-col items-center text-muted-foreground p-8 text-center">
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
                    <Award className="h-6 w-6 text-primary" />
                    Pose Score
                </h3>
                <Skeleton className="h-8 w-1/4 bg-gray-300 mb-1" />
                <Skeleton className="h-4 w-full bg-gray-300" />
            </div>
            <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mt-4">
                <MessageSquareText className="h-6 w-6 text-primary" />
                Feedback
                </h3>
                <Skeleton className="h-6 w-1/4 bg-gray-300 mt-2" />
                <Skeleton className="h-4 w-full bg-gray-300 mt-1" />
                <Skeleton className="h-4 w-full bg-gray-300 mt-1" />
                <Skeleton className="h-4 w-3/4 bg-gray-300 mt-1" />
            </div>
          </div>
        )}

        {!isLoading && analysis && (
          <>
            {typeof score === 'number' && (
              <div className="space-y-2 p-4 bg-secondary/30 rounded-md border border-border">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                  <Award className="h-6 w-6" />
                  Pose Score
                </h3>
                <div className="flex items-center gap-3">
                  <Progress value={score} className="w-full h-3" />
                  <span className="text-2xl font-bold text-primary">{score}/100</span>
                </div>
                {score < 50 && <p className="text-sm text-destructive">Needs significant improvement. Keep practicing!</p>}
                {score >= 50 && score < 75 && <p className="text-sm text-orange-500">Good effort, but there's room to grow.</p>}
                {score >= 75 && score < 90 && <p className="text-sm text-yellow-500">Great job! Just a few minor adjustments.</p>}
                {score >= 90 && <p className="text-sm text-green-500">Excellent form! You're doing wonderfully.</p>}
              </div>
            )}
            <div className="space-y-3 p-4 bg-primary/5 rounded-md border border-primary/20">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                <MessageSquareText className="h-6 w-6" />
                AI Feedback
              </h3>
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {analysis.feedback}
              </p>
            </div>
          </>
        )}

        {!isLoading && !analysis && videoDataUri && (
           <div className="text-center text-muted-foreground p-4">
            <p>Analysis in progress or failed to retrieve full details. Waiting for feedback display.</p>
          </div>
        )}
      </CardContent>
      {analysis && (
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Remember, AI feedback and scores are guides. Listen to your body and consult a professional if needed.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
