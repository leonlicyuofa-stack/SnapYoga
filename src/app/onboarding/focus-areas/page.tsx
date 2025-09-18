
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
import { Loader2, Crosshair, ArrowRight, ArrowLeft, MoveUpRight } from 'lucide-react';
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
        back: {
            path: "M 80 145 L 80 200 L 120 200 L 120 145 Z",
            labelPos: { x: 100, y: 172.5 }
        },
        shoulders: {
            path: "M 75,130 C 70,125 70,115 75,110 L 125,110 C 130,115 130,125 125,130 Z",
            labelPos: { x: 100, y: 120 }
        },
        arms: {
            path: "M 50 115 L 70 115 L 70 210 L 50 210 Z M 130 115 L 150 115 L 150 210 L 130 210 Z",
            labelPos: { x: 60, y: 162.5 }
        },
        core: {
            path: "M 80 145 L 120 145 L 120 200 L 80 200", // This is part of the back, for selection logic
            labelPos: { x: 100, y: 172.5 }
        },
        hips: {
            path: "M 80 200 L 120 200 L 120 230 L 80 230 Z",
            labelPos: { x: 100, y: 215 }
        },
        legs: {
            path: "M 80 230 L 120 230 L 120 300 L 80 300 Z", // Simplified
            labelPos: { x: 100, y: 265 }
        }
    };


    return (
        <div className="flex justify-center items-start gap-4">
             <svg width="150" height="300" viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive body figure for selecting focus areas">
                <g strokeWidth="2" className="text-foreground/80">
                     {/* Head - Not interactive */}
                    <circle cx="100" cy="80" r="25" fill="hsl(var(--muted))" stroke="none" />
                    
                    {Object.entries(bodyPartsConfig).map(([part, config]) => {
                        const isSelected = selectedParts.includes(part);
                        return (
                            <g
                                key={part}
                                data-part={part}
                                onClick={() => onPartToggle(part)}
                                className={cn(
                                    "cursor-pointer transition-all duration-200",
                                    isSelected ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <path
                                    d={config.path}
                                    strokeDasharray={isSelected ? "none" : "4 4"}
                                    className={cn(
                                        "stroke-current",
                                        isSelected ? "fill-primary/20 stroke-2" : "fill-muted-foreground/20 stroke-1"
                                    )}
                                />
                                {part !== 'arms' &&
                                  <text
                                    x={config.labelPos.x}
                                    y={config.labelPos.y}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    className={cn(
                                        "text-sm font-semibold pointer-events-none",
                                        isSelected ? "fill-primary" : "fill-muted-foreground"
                                    )}
                                  >
                                    {part.charAt(0).toUpperCase() + part.slice(1)}
                                  </text>
                                }
                                {part === 'arms' &&
                                <>
                                 <text x={60} y={162.5} textAnchor="middle" alignmentBaseline="middle" className={cn( "text-sm font-semibold pointer-events-none", isSelected ? "fill-primary" : "fill-muted-foreground" )}>Arm</text>
                                 <text x={140} y={162.5} textAnchor="middle" alignmentBaseline="middle" className={cn( "text-sm font-semibold pointer-events-none", isSelected ? "fill-primary" : "fill-muted-foreground" )}>Arm</text>
                                </>
                                }
                            </g>
                        );
                    })}
                </g>
            </svg>
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
    const newSelection = currentSelection.includes(partId)
      ? currentSelection.filter(p => p !== partId)
      : [...currentSelection, partId];
    setValue('focusBodyParts', newSelection, { shouldValidate: true });
  };

  if (authLoading) {
      return (
          <AppShell>
              <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                  <SmileyRockLoader text="Loading..." />
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
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
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
