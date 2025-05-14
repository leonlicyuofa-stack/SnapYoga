"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SummarizeFeedbackOutput } from '@/ai/flows/summarize-feedback';
import { Loader2, Send, MessageCircleQuestion, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
      <Card className="w-full shadow-lg opacity-50 cursor-not-allowed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageCircleQuestion className="h-7 w-7" />
            Provide Feedback
          </CardTitle>
          <CardDescription>
            Once your pose is analyzed, you can provide feedback on the suggestions here.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MessageCircleQuestion className="h-7 w-7 text-primary" />
          Provide Feedback on Suggestions
        </CardTitle>
        <CardDescription>
          Let us know if the suggestions were helpful or if you have any comments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="feedback-text" className="text-base font-medium">Your Feedback</Label>
          <Textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="E.g., The cue about my shoulder alignment was very helpful!"
            rows={4}
            className="mt-1 focus:ring-primary focus:border-primary"
            aria-describedby="feedback-text-help"
          />
          <p id="feedback-text-help" className="text-sm text-muted-foreground mt-1">
            Your input helps us improve!
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !feedbackText.trim()}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-md shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
          aria-label="Submit Feedback"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Submitting...' : 'Submit Feedback'}
        </Button>

        {isLoading && summary === null && (
            <div className="space-y-3 p-4 bg-secondary/50 rounded-md border border-dashed">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                    <Sparkles className="h-6 w-6" />
                    Feedback Summary
                </h3>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        )}

        {summary && (
          <div className="mt-6 space-y-3 p-4 bg-primary/5 rounded-md border border-primary/20">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
              <Sparkles className="h-6 w-6" />
              Feedback Summary
            </h3>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {summary.summary}
            </p>
          </div>
        )}
      </CardContent>
      {summary && (
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Thank you for your feedback! We've noted your comments.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
