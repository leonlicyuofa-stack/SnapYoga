"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { AnalysisServiceOutput } from '@/app/actions/analyze-pose-action';
import { Button } from "@/components/ui/button";
import { Activity, MessageSquareText, VideoOff, Award, Sparkles, ListChecks, Route, Lightbulb, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


interface PoseAnalysisCardProps {
  videoDataUri: string | null; // Can be a data URI or a public URL from storage
  videoFileName: string | null;
  userNotes?: string | null;
  analysis: AnalysisServiceOutput | null;
  isLoading: boolean;
}

function jointStatusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('good')) return 'border-green-500/40 bg-green-500/10';
  if (s.includes('adjust') || s.includes('improve')) return 'border-amber-500/40 bg-amber-500/10';
  return 'border-white/20 bg-black/20';
}

export function PoseAnalysisCard({ videoDataUri, videoFileName, userNotes, analysis, isLoading }: PoseAnalysisCardProps) {
  const rawScore = analysis?.score ?? null;
  const identifiedPose = analysis?.identifiedPose ?? null;

  // Check if score is between 0-1 and multiply by 100 if so.
  const scoreValue = typeof rawScore === 'number' && rawScore <= 1 && rawScore > 0 ? rawScore * 100 : rawScore;
  const score = typeof scoreValue === 'number' 
    ? Math.min(Math.round(scoreValue), 100) 
    : null;

  const videoSrc = videoDataUri;
  
  // Robust media type detection handling both Data URIs and Cloud URLs with query params
  const isImage = !!videoDataUri && (
      videoDataUri.startsWith('data:image/') || 
      /\.(jpg|jpeg|png|webp|gif|bmp)(\?|$)/i.test(videoDataUri)
  );

  const isMov = !!videoDataUri && (
      videoDataUri.startsWith('data:video/quicktime') || 
      /\.mov(\?|$)/i.test(videoDataUri)
  );

  const videoMimeType = isMov ? 'video/quicktime' : 'video/mp4';

  const hasV2Detail =
    !!analysis?.jointAssessment?.length ||
    !!analysis?.priorityCorrections?.length ||
    !!analysis?.strengths?.length ||
    !!analysis?.recommendedPreparatoryPoses?.length ||
    !!analysis?.progressionPath ||
    !!analysis?.motivationalNote ||
    !!analysis?.performanceGrade ||
    !!analysis?.poseConfidence;

  return (
    <div 
      className="w-full shadow-xl p-6 backdrop-blur-lg rounded-2xl bg-[rgba(193,154,107,0.045)] border-[rgba(193,154,107,0.18)]"
      style={{ borderWidth: '0.5px' }}
    >
      <CardHeader className="p-0">
        <CardTitle 
          style={{ 
            fontFamily: "'Cormorant Garamond', Georgia, serif", 
            fontWeight: 600, 
            color: 'rgba(255,240,215,0.92)' 
          }}
          className="flex items-center gap-2 text-2xl"
        >
          <Activity className="h-7 w-7" style={{ color: 'rgba(193,154,107,0.85)' }} />
          Pose Analysis
        </CardTitle>
        <CardDescription className="text-white/80">
          {videoSrc ? `Showing analysis for ${videoFileName || 'your file'}.` : "Upload a video or image to see your pose analysis here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-6 mt-6">
        <div className="aspect-video w-full bg-black/20 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-white/20">
          {videoSrc ? (
            isImage ? (
              <img 
                src={videoSrc} 
                alt={videoFileName || "Uploaded yoga pose"} 
                className="w-full h-full object-contain" 
              />
            ) : (
              <video 
                key={videoSrc} // Critical: forces re-render when switching from local data to cloud URL
                controls 
                playsInline 
                preload="metadata"
                className="w-full h-full object-contain" 
                aria-label={videoFileName || "Uploaded yoga pose video"}
              >
                <source src={videoSrc} type={videoMimeType} />
                {/* Fallback source for .mov files that might be standard mp4s */}
                {isMov && <source src={videoSrc} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            isLoading ? (
              <div className="flex flex-col items-center text-white/70 p-4 w-full">
                <Skeleton className="h-12 w-12 rounded-full bg-white/20 mb-2" />
                <Skeleton className="h-4 w-3/4 bg-white/20 mb-1" />
                <Skeleton className="h-4 w-1/2 bg-white/20" />
              </div>
            ) : (
              <div className="flex flex-col items-center text-white/70 p-8 text-center">
                <VideoOff className="h-16 w-16 mb-4" />
                <p className="font-semibold text-lg">No Media Uploaded</p>
                <p className="text-sm">Your video/image and analysis will appear here.</p>
              </div>
            )
          )}
        </div>
        
        {userNotes && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-1">
             <h3 className="text-sm font-semibold flex items-center gap-2 text-white/60 uppercase tracking-widest">
               <MessageCircle className="h-4 w-4" />
               Your Context
             </h3>
             <p className="text-white/90 text-sm italic">"{userNotes}"</p>
          </div>
        )}

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
              <div className="space-y-2 p-4 rounded-xl bg-[rgba(255,240,215,0.02)] border border-[rgba(193,154,107,0.14)]">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                  <Award className="h-6 w-6" />
                  Pose Score
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {analysis.performanceGrade && (
                    <Badge variant="secondary" className="text-sm">
                      {analysis.performanceGrade}
                    </Badge>
                  )}
                  {analysis.poseConfidence && (
                    <Badge variant="outline" className="border-white/30 text-white/90 text-xs capitalize">
                      Confidence: {analysis.poseConfidence}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={score} className="w-full h-3 bg-white/20" />
                  <span className="text-2xl font-bold text-white shrink-0">{score}/100</span>
                </div>
                {!hasV2Detail && (
                  <>
                    {score < 50 && <p className="text-sm text-red-400">Needs significant improvement. Keep practicing!</p>}
                    {score >= 50 && score < 75 && <p className="text-sm text-orange-400">Good effort, but there's room to grow.</p>}
                    {score >= 75 && score < 90 && <p className="text-sm text-yellow-400">Great job! Just a few minor adjustments.</p>}
                    {score >= 90 && <p className="text-sm text-green-400">Excellent form! You're doing wonderfully.</p>}
                  </>
                )}
              </div>
            )}
            {identifiedPose && (
              <div className="space-y-2 p-4 rounded-xl bg-[rgba(255,240,215,0.02)] border border-[rgba(193,154,107,0.14)]">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                  <Activity className="h-6 w-6" /> Identified Pose
                </h3>
                <p className="text-2xl font-bold text-white">{identifiedPose}</p>
                {analysis.identificationReasoning && (
                  <p className="text-sm text-white/75 leading-relaxed">{analysis.identificationReasoning}</p>
                )}
                <p className="text-sm text-white/70">Does this correctly identify your pose?</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => console.log('Correct Pose clicked')} className="bg-transparent border-white/20 hover:bg-white/10">
                    Yes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => console.log('Incorrect Pose clicked')} className="bg-transparent border-white/20 hover:bg-white/10">No</Button>
                </div>
              </div>)}

            {analysis.motivationalNote && (
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Encouragement
                </h3>
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{analysis.motivationalNote}</p>
              </div>
            )}

            <div className="space-y-3 p-4 rounded-xl bg-[rgba(255,240,215,0.02)] border border-[rgba(193,154,107,0.14)]">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                <MessageSquareText className="h-6 w-6" />
                AI Feedback
              </h3>
              <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                {analysis.feedback}
              </p>
            </div>

            {hasV2Detail && (
              <Accordion type="multiple" className="w-full space-y-2 rounded-xl border border-white/15 bg-black/10 p-2">
                {analysis.jointAssessment && analysis.jointAssessment.length > 0 && (
                  <AccordionItem value="joints" className="border-white/10 px-2">
                    <AccordionTrigger className="text-white hover:no-underline py-3">
                      <span className="flex items-center gap-2 font-semibold">
                        <ListChecks className="h-5 w-5" />
                        Joint assessment
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                      {analysis.jointAssessment.map((j) => (
                        <div
                          key={j.joint}
                          className={cn('rounded-lg border p-3 text-sm', jointStatusClass(j.status))}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-white">{j.joint}</span>
                            <Badge variant="outline" className="border-white/25 text-xs capitalize text-white/90">
                              {j.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-white/85 leading-relaxed">{j.observation}</p>
                          {j.correction && (
                            <p className="mt-2 text-white/90 border-t border-white/10 pt-2">
                              <span className="font-medium text-amber-200/90">Correction: </span>
                              {j.correction}
                            </p>
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {analysis.priorityCorrections && analysis.priorityCorrections.length > 0 && (
                  <AccordionItem value="priority" className="border-white/10 px-2">
                    <AccordionTrigger className="text-white hover:no-underline py-3">
                      <span className="flex items-center gap-2 font-semibold">
                        <Lightbulb className="h-5 w-5" />
                        Priority corrections
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                      {analysis.priorityCorrections.map((p, i) => (
                        <div key={`${p.joint}-${i}`} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm space-y-1">
                          <p className="font-semibold text-white">{p.joint}</p>
                          <p className="text-white/80"><span className="text-white/60">Issue: </span>{p.issue}</p>
                          <p className="text-white/90"><span className="text-white/60">Fix: </span>{p.correction}</p>
                          <p className="text-white/85 italic border-t border-white/10 pt-2 mt-2">&ldquo;{p.cue}&rdquo;</p>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {analysis.strengths && analysis.strengths.length > 0 && (
                  <AccordionItem value="strengths" className="border-white/10 px-2">
                    <AccordionTrigger className="text-white hover:no-underline py-3">
                      <span className="flex items-center gap-2 font-semibold">
                        <Award className="h-5 w-5" />
                        Strengths
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <ul className="list-disc list-inside space-y-1 text-sm text-white/90">
                        {analysis.strengths.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {analysis.recommendedPreparatoryPoses && analysis.recommendedPreparatoryPoses.length > 0 && (
                  <AccordionItem value="prep" className="border-white/10 px-2">
                    <AccordionTrigger className="text-white hover:no-underline py-3">
                      <span className="flex items-center gap-2 font-semibold">
                        <Route className="h-5 w-5" />
                        Recommended preparatory poses
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                      {analysis.recommendedPreparatoryPoses.map((r) => (
                        <div key={r.pose} className="rounded-lg border border-white/15 bg-black/20 p-3 text-sm">
                          <p className="font-semibold text-white">{r.pose}</p>
                          <p className="text-white/80 mt-1 leading-relaxed">{r.reason}</p>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {analysis.progressionPath && (
                  <AccordionItem value="progression" className="border-white/10 px-2">
                    <AccordionTrigger className="text-white hover:no-underline py-3">
                      <span className="flex items-center gap-2 font-semibold">
                        <Route className="h-5 w-5" />
                        Progression path
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{analysis.progressionPath}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            )}
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
