
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


// Interactive Body Figure Component
const BodyFigure = ({ selectedParts, onPartToggle }: { selectedParts: string[]; onPartToggle: (partId: string) => void }) => {
  const isSelected = (partId: string) => selectedParts.includes(partId);

  const partClasses = (partId: string) => cn(
    "cursor-pointer transition-all duration-200 ease-in-out",
    "stroke-black stroke-[10]", // Use a thicker stroke for the sketch-like feel
    "stroke-linejoin-round stroke-linecap-round",
    isSelected(partId)
      ? "fill-accent"
      : "fill-muted-foreground/20 hover:fill-accent/70"
  );
  
  return (
    <div className="flex justify-center items-center py-4">
      <svg width="150" height="300" viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive body figure for selecting focus areas">
          {/* Non-interactive Face */}
          <g fill="hsl(var(--foreground))" stroke="none">
              <path d="M92 110 C 90 115, 92 117, 94 117" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
              <path d="M108 110 C 110 115, 108 117, 106 117" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
              <path d="M95 125 Q 100 130, 105 125" stroke="hsl(var(--foreground))" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          
          {/* Interactive Body Parts */}
          <g onClick={() => onPartToggle('shoulders')} className={partClasses('shoulders')}><title>Shoulders</title><path d="M100 140 Q 80 140, 70 120" fill="none" /><path d="M100 140 Q 120 140, 130 120" fill="none" /></g>
          <g onClick={() => onPartToggle('arms')} className={partClasses('arms')}><title>Arms</title><path d="M130 120 V 50 L 100 30" fill="none" /><path d="M70 120 V 50 L 100 30" fill="none" /></g>
          <g onClick={() => onPartToggle('back')} className={partClasses('back')}><title>Back</title><path d="M100 140 V 250" fill="none" /></g>
          <g onClick={() => onPartToggle('core')} className={partClasses('core')}><title>Core</title><path d="M100 160 V 230" fill="none" /></g>
          <g onClick={() => onPartToggle('hips')} className={partClasses('hips')}><title>Hips</title><path d="M100 250 C 80 250, 70 260, 70 260" fill="none" /></g>
          <g onClick={() => onPartToggle('legs')} className={partClasses('legs')}><title>Legs</title><path d="M100 250 V 340" fill="none" /><path d="M70 260 L 100 280 V 300" fill="none"/></g>
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
