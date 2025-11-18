"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Crosshair, ArrowRight, ArrowLeft, MoveUpRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Progress } from '@/components/ui/progress';

const focusAreasSchema = z.object({
  focusBodyParts: z.array(z.string()).min(1, { message: "Please select at least one focus area" }),
});

type FocusAreasFormValues = z.infer<typeof focusAreasSchema>;

const physicalBodyParts = [
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms" },
  { id: "core", label: "Core" },
  { id: "hips", label: "Hips" },
  { id: "legs", label: "Legs" },
  { id: "back", label: "Back" },
];

// Interactive SVG Body Figure Component
const BodyFigure = ({ selectedParts, onPartToggle }: { selectedParts: string[], onPartToggle: (part: string) => void }) => {
    
    const bodyPartsConfig = {
        front: {
            arms: { path: "M60,130 L50,200 L65,200 L70,130 Z M140,130 L150,200 L135,200 L130,130 Z", label: "Arms" },
            core: { path: "M78,135 L122,135 L118,175 L82,175 Z", label: "Core" },
            legs: { path: "M80,210 L70,290 L95,290 L90,210 Z M120,210 L130,290 L105,290 L110,210 Z", label: "Legs" },
        },
        back: {
            shoulders: { path: "M75,108 C70,105,65,110,65,115 L60,130 L140,130 L135,115 C135,110,130,105,125,108 Z", label: "Shoulders" },
            back: { path: "M75,130 L125,130 L125,180 L75,180 Z", label: "Back" },
            // The visual path for hips is removed, but the label and click area remain for functionality.
            hips: { path: "M75,180 L125,180 L120,210 L80,210 Z", label: "Hips" },
        }
    };

    return (
        <div className="flex justify-center items-start gap-8">
            {/* Front View */}
            <div className="flex flex-col items-center">
                <h3 className="font-semibold mb-2 text-foreground">Front</h3>
                <svg width="200" height="320" viewBox="0 60 200 280" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive body figure for selecting focus areas - Front View">
                    <g className="text-foreground/80">
                        {/* Head */}
                        <circle cx="100" cy="85" r="20" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
                        <path d="M100,105 L100,110" stroke="hsl(var(--border))" strokeWidth="1.5" strokeLinecap="round" />
                        {/* Body Outline for context */}
                        <path d="M65,115 L60,130 L75,130 L75,210 L70,290 L95,290 L90,210 L110,210 L105,290 L130,290 L135,210 L125,210 L125,130 L140,130 L135,115 C135,110,130,105,125,108 Z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
                        
                        {Object.entries(bodyPartsConfig.front).map(([part, config]) => {
                            const isPartSelected = selectedParts.includes(part);
                            return (
                                <g key={`front-${part}`} data-part={part} onClick={() => onPartToggle(part)} className="cursor-pointer group">
                                    <path d={config.path} className={cn("transition-all duration-200 fill-muted group-hover:fill-accent/50 stroke-border stroke-1", isPartSelected && "fill-primary/20 stroke-primary stroke-2")} />
                                    <text x={100} y={part === 'arms' ? 165 : part === 'core' ? 158 : 250} textAnchor="middle" alignmentBaseline="middle" className={cn("text-sm font-semibold pointer-events-none fill-muted-foreground transition-all duration-200 group-hover:fill-accent-foreground", isPartSelected && "fill-primary")}>
                                        {config.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* Back View */}
            <div className="flex flex-col items-center">
                <h3 className="font-semibold mb-2 text-foreground">Back</h3>
                 <svg width="200" height="320" viewBox="0 60 200 280" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive body figure for selecting focus areas - Back View">
                    <g className="text-foreground/80">
                        {/* Head */}
                        <circle cx="100" cy="85" r="20" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
                        <path d="M100,105 L100,110" stroke="hsl(var(--border))" strokeWidth="1.5" strokeLinecap="round" />
                        {/* Body Outline for context */}
                        <path d="M65,115 L60,130 L75,130 L75,210 L70,290 L95,290 L90,210 L110,210 L105,290 L130,290 L135,210 L125,210 L125,130 L140,130 L135,115 C135,110,130,105,125,108 Z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />

                        {Object.entries(bodyPartsConfig.back).map(([part, config]) => {
                            const isPartSelected = selectedParts.includes(part);
                            // Do not render the visible path for 'hips' on the back view
                            const isVisiblePath = part !== 'hips';
                            return (
                                <g key={`back-${part}`} data-part={part} onClick={() => onPartToggle(part)} className="cursor-pointer group">
                                    {isVisiblePath && (
                                      <path d={config.path} className={cn("transition-all duration-200 fill-muted group-hover:fill-accent/50 stroke-border stroke-1", isPartSelected && "fill-primary/20 stroke-primary stroke-2")} />
                                    )}
                                    {/* Create a transparent but clickable area for hips */}
                                    {!isVisiblePath && (
                                       <path d={config.path} className="fill-transparent" />
                                    )}
                                    <text x={100} y={part === 'shoulders' ? 120 : part === 'back' ? 155 : 195} textAnchor="middle" alignmentBaseline="middle" className={cn("text-sm font-semibold pointer-events-none fill-muted-foreground transition-all duration-200 group-hover:fill-accent-foreground", isPartSelected && "fill-primary")}>
                                        {config.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};


export default function FocusAreasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalOnboardingSteps = 5;
  const currentStep = 4;

  useEffect(() => {
    const calculatedProgress = (currentStep / totalOnboardingSteps) * 100;
    const timer = setTimeout(() => setProgress(calculatedProgress), 100);
    return () => clearTimeout(timer);
  }, []);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FocusAreasFormValues>({
    resolver: zodResolver(focusAreasSchema),
    defaultValues: {
      focusBodyParts: [],
    }
  });

  const selectedParts = watch('focusBodyParts', []);

  const handlePartToggle = (partId: string) => {
    const currentSelection = selectedParts || [];
    let newSelection = currentSelection;
    
    // Toggle 'back' and 'core' together
    if (partId === 'back' || partId === 'core') {
        const hasBack = currentSelection.includes('back');
        const hasCore = currentSelection.includes('core');
        if (hasBack || hasCore) {
            newSelection = currentSelection.filter(p => p !== 'back' && p !== 'core');
        } else {
            newSelection = [...currentSelection, 'back', 'core'];
        }
    } else {
        newSelection = currentSelection.includes(partId)
          ? currentSelection.filter(p => p !== partId)
          : [...currentSelection, partId];
    }
    
    setValue('focusBodyParts', newSelection, { shouldValidate: true });
  };

  if (authLoading) {
      return (
          <AppShell>
              <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                  <SmileyRockLoader />
              </div>
          </AppShell>
      );
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return null;
  }

  const onSubmit: SubmitHandler<FocusAreasFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { focusBodyParts: data.focusBodyParts });
      router.push('/onboarding/profile-summary');
    } catch (error) {
      console.error("Error saving focus areas:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your focus areas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4 text-center">
        
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <OnboardingHeader />
          
          <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg w-full">
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               <BodyFigure selectedParts={selectedParts} onPartToggle={handlePartToggle} />
              
              {selectedParts.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-foreground">Your Selection</Label>
                    <div className="flex flex-wrap justify-center gap-2 p-3 border rounded-md min-h-[40px] bg-background/50">
                        {selectedParts.map(partId => {
                            const option = physicalBodyParts.find(opt => opt.id === partId);
                            return <Badge key={partId} variant="secondary">{option ? option.label.split(' (')[0] : partId}</Badge>
                        })}
                    </div>
                </div>
              )}

              {errors.focusBodyParts && <p className="text-sm text-destructive text-center">{errors.focusBodyParts.message}</p>}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="w-full sm:w-1/4">
                    <Progress value={progress} className="w-full h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
                        {Math.round(progress)}% Complete
                    </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </div>
            </form>
          </div>
          <p className="text-xs text-muted-foreground text-center w-full mt-6">
            This helps us tailor content for you.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
