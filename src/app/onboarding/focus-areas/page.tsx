
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
    "stroke-black/50 stroke-[10]",
    "stroke-linejoin-round stroke-linecap-round",
    isSelected(partId)
      ? "fill-accent stroke-accent"
      : "fill-muted-foreground/20 hover:fill-accent/70 hover:stroke-accent/70"
  );

  return (
    <div className="flex justify-center items-center py-4">
      <svg width="150" height="300" viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive body figure for selecting focus areas">
        {/* Non-interactive Head */}
        <g fill="hsl(var(--foreground))" opacity="0.6">
          <circle cx="100" cy="65" r="20" fill="hsl(var(--muted))" />
          <path d="M90 62 C 92 60, 96 60, 98 62" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
          <path d="M110 62 C 112 60, 116 60, 118 62" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
          <path d="M100 75 Q 105 80, 110 75" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
        </g>
        
        {/* Interactive Body Parts */}
        <g onClick={() => onPartToggle('back')} className={partClasses('back')}><title>Back</title><path d="M100 85 V 200" fill="none" /></g>
        <g onClick={() => onPartToggle('shoulders')} className={partClasses('shoulders')}><title>Shoulders</title><path d="M100 110 C 80 110, 70 90, 70 90 M100 110 C 120 110, 130 90, 130 90" fill="none" /></g>
        <g onClick={() => onPartToggle('arms')} className={partClasses('arms')}><title>Arms</title><path d="M70 90 L 40 180 M130 90 L 160 180" fill="none" /></g>
        <g onClick={() => onPartToggle('core')} className={partClasses('core')}><title>Core</title><path d="M100 120 V 180" fill="none" strokeWidth="20" /></g>
        <g onClick={() => onPartToggle('hips')} className={partClasses('hips')}><title>Hips</title><path d="M100 200 C 80 200, 70 210, 70 210 M100 200 C 120 200, 130 210, 130 210" fill="none" /></g>
        <g onClick={() => onPartToggle('legs')} className={partClasses('legs')}><title>Legs</title><path d="M70 210 L 80 320 M130 210 L 120 320" fill="none" /></g>
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
