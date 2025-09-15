
"use client";

import { useState } from 'react';
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
    "stroke-background stroke-2",
    isSelected(partId)
      ? "fill-accent hover:fill-accent/80"
      : "fill-muted-foreground/20 hover:fill-accent/70"
  );
  
  return (
    <div className="flex justify-center items-center py-4">
      <svg width="150" height="300" viewBox="0 0 150 300" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive body figure for selecting focus areas">
        {/* Head (non-interactive) */}
        <circle cx="75" cy="40" r="20" fill="hsl(var(--muted))" />
        {/* Neck (non-interactive) */}
        <rect x="68" y="60" width="14" height="15" rx="4" fill="hsl(var(--muted))" />

        {/* Shoulders */}
        <path d="M45,75 h60 v15 h-60 z" rx="5" className={partClasses('shoulders')} onClick={() => onPartToggle('shoulders')}><title>Shoulders</title></path>
        
        {/* Arms */}
        <g onClick={() => onPartToggle('arms')} className="cursor-pointer" aria-label="Arms">
          <title>Arms</title>
          <path d="M25,80 l-10,80 h25 l-5,-80 z" className={partClasses('arms')} />
          <path d="M125,80 l10,80 h-25 l5,-80 z" className={partClasses('arms')} />
        </g>
        
        {/* Back (overlaying torso) */}
        <path d="M55,90 h40 v65 h-40 z" rx="5" className={partClasses('back')} onClick={() => onPartToggle('back')}><title>Back</title></path>
        {/* Core */}
        <path d="M50,90 h50 v65 h-50 z" rx="5" className={partClasses('core')} onClick={() => onPartToggle('core')}><title>Core</title></path>

        {/* Hips */}
        <path d="M48,155 l-5,25 h64 l-5,-25 z" rx="5" className={partClasses('hips')} onClick={() => onPartToggle('hips')}><title>Hips</title></path>

        {/* Legs */}
        <g onClick={() => onPartToggle('legs')} className="cursor-pointer" aria-label="Legs">
          <title>Legs</title>
          <path d="M43,180 l-15,110 h32 l5,-110 z" className={partClasses('legs')} />
          <path d="M107,180 l15,110 h-32 l-5,-110 z" className={partClasses('legs')} />
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
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

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

  const handleBackNavigation = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 500); 
  };

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4 text-center">
        
        <div className="relative z-10 w-full max-w-2xl">
          <div className="text-center mb-4">
            <Crosshair className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold">Focus Areas</h1>
            <p className="text-muted-foreground mt-2">Select body parts from the figure or choose a goal below.</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg">
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
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackNavigation} 
                  className="w-full"
                  isLoadingWithBar={isNavigatingBack}
                  loadingBarDirection="rtl"
                  disabled={isSubmitting || isNavigatingBack}
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                </Button>
                <Button 
                  type="submit" 
                  className="w-full rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                  disabled={isSubmitting || authLoading || isNavigatingBack}
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
