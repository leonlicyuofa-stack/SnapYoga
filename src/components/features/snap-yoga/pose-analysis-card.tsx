"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { AnalyzeYogaPoseOutput } from '@/ai/flows/analyze-yoga-pose';
import { Activity, MessageSquareText, VideoOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PoseAnalysisCardProps {
  videoDataUri: string | null;
  videoFileName: string | null;
  analysis: AnalyzeYogaPoseOutput | null;
  isLoading: boolean;
}

export function PoseAnalysisCard({ videoDataUri, videoFileName, analysis, isLoading }: PoseAnalysisCardProps) {
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
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquareText className="h-6 w-6 text-primary" />
              Feedback
            </h3>
            <Skeleton className="h-6 w-1/4 bg-gray-300" />
            <Skeleton className="h-4 w-full bg-gray-300" />
            <Skeleton className="h-4 w-full bg-gray-300" />
            <Skeleton className="h-4 w-3/4 bg-gray-300" />
          </div>
        )}

        {!isLoading && analysis && (
          <div className="space-y-3 p-4 bg-primary/5 rounded-md border border-primary/20">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
              <MessageSquareText className="h-6 w-6" />
              AI Feedback
            </h3>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {analysis.feedback}
            </p>
          </div>
        )}

        {!isLoading && !analysis && videoDataUri && (
           <div className="text-center text-muted-foreground p-4">
            <p>Analysis complete. Waiting for feedback display.</p>
          </div>
        )}
      </CardContent>
      {analysis && (
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Remember, AI feedback is a guide. Listen to your body and consult a professional if needed.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
