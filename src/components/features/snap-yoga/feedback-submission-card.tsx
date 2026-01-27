
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { Send, MessageCircleQuestion, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

interface FeedbackSubmissionCardProps {
  onFeedbackSubmit: (feedback: string) => void;
  isLoading: boolean;
  summary: SummarizeFeedbackOutput | null;
  isAnalysisDone: boolean; 
}

export function FeedbackSubmissionCard({ onFeedbackSubmit, isLoading, summary, isAnalysisDone }: FeedbackSubmissionCardProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (feedbackText.trim()) {
      onFeedbackSubmit(feedbackText.trim());
    } else {
      toast({
        title: "Empty Feedback",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      });
    }
  };

  if (!isAnalysisDone) {
    return (
      <div className="w-full p-6 bg-black/20 backdrop-blur-lg border-white/20 text-white rounded-2xl shadow-xl opacity-50 cursor-not-allowed">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageCircleQuestion className="h-7 w-7 text-white" />
            Provide Feedback
          </CardTitle>
          <CardDescription className="text-white/80">
            Once your pose is analyzed, you can provide feedback on the suggestions here.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
            <Skeleton className="h-24 w-full bg-white/20" />
            <Skeleton className="h-10 w-full mt-4 bg-white/20" />
        </CardContent>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-black/20 backdrop-blur-lg border-white/20 text-white rounded-2xl shadow-xl">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MessageCircleQuestion className="h-7 w-7 text-white" />
          Provide Feedback on Suggestions
        </CardTitle>
        <CardDescription className="text-white/80">
          Let us know if the suggestions were helpful or if you have any comments.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-6 mt-6">
        <div>
          <Label htmlFor="feedback-text" className="text-base font-medium">Your Feedback</Label>
          <Textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="E.g., The cue about my shoulder alignment was very helpful!"
            rows={4}
            className="mt-1 rounded-lg text-base bg-black/20 border-white/20 placeholder:text-white/50"
            aria-describedby="feedback-text-help"
          />
          <p id="feedback-text-help" className="text-sm text-white/70 mt-1">
            Your input helps us improve!
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !feedbackText.trim()}
          className="w-full bg-white/90 hover:bg-white text-black text-lg py-6 rounded-lg shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
          aria-label="Submit Feedback"
        >
          {isLoading ? (
            <SmileyRockLoader />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Submitting...' : 'Submit Feedback'}
        </Button>

        {isLoading && summary === null && (
            <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-dashed border-white/20">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Sparkles className="h-6 w-6" />
                    Feedback Summary
                </h3>
                <Skeleton className="h-4 w-3/4 bg-white/20" />
                <Skeleton className="h-4 w-full bg-white/20" />
            </div>
        )}

        {summary && (
          <div className="mt-6 space-y-3 p-4 bg-black/20 rounded-xl border border-white/20">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
              <Sparkles className="h-6 w-6" />
              Feedback Summary
            </h3>
            <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
              {summary.summary}
            </p>
          </div>
        )}
      </CardContent>
      {summary && (
        <CardFooter className="p-0 pt-6">
            <p className="text-xs text-white/60">
                Thank you for your feedback! We've noted your comments.
            </p>
        </CardFooter>
      )}
    </div>
  );
}
