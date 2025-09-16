"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, PersonStanding, ArrowRight, ArrowLeft, HelpCircle, MoveUpRight } from 'lucide-react'; 
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FemaleAvatar } from '@/components/icons/FemaleAvatar';
import { MaleAvatar } from '@/components/icons/MaleAvatar';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Progress } from '@/components/ui/progress';


const currentBodyShapeSchema = z.object({
  currentBodyShape: z.string().min(1, { message: "Please select your current body shape" }),
});

type CurrentBodyShapeFormValues = z.infer<typeof currentBodyShapeSchema>;

const bodyShapeOptions = [
  { value: "inverted-triangle", label: "Inverted Triangle", icon: PersonStanding },
  { value: "hourglass", label: "Hourglass", icon: PersonStanding },
  { value: "triangle", label: "Triangle", icon: PersonStanding },
  { value: "round", label: "Round", icon: PersonStanding },
  { value: "rectangle", label: "Rectangle", icon: PersonStanding },
  { value: "prefer-not-to-say", label: "Prefer not to say", icon: HelpCircle },
];

export default function CurrentBodyShapePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalOnboardingSteps = 7;
  const currentStep = 4;

  useEffect(() => {
    const calculatedProgress = (currentStep / totalOnboardingSteps) * 100;
    const timer = setTimeout(() => setProgress(calculatedProgress), 100);
    return () => clearTimeout(timer);
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<CurrentBodyShapeFormValues>({
    resolver: zodResolver(currentBodyShapeSchema),
  });

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
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<CurrentBodyShapeFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { currentBodyShape: data.currentBodyShape });
      router.push('/onboarding/desired-body-shape');
    } catch (error) {
      console.error("Error saving current body shape:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your current body shape. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4 overflow-hidden">
        
        <div className="w-full max-w-2xl z-10 flex flex-col items-center">
          <OnboardingHeader />
          <div className="text-center mb-8">
            
            
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
             <Controller
                name="currentBodyShape"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {bodyShapeOptions.map((option) => {
                      const Icon = option.icon;
                      // A simple way to slightly vary the icon for visual distinction
                      const femaleIcon = <FemaleAvatar className="h-20 w-20 mb-2 opacity-70" />;
                      const maleIcon = <MaleAvatar className="h-10 w-10 mb-2 opacity-70" />;
                      
                      let displayIcon;
                      if(option.value === 'slim') displayIcon = femaleIcon;
                      else if(option.value === 'athletic') displayIcon = maleIcon;
                      else if(option.value === 'curvy') displayIcon = femaleIcon;
                      else if(option.value === 'full-figured') displayIcon = femaleIcon;
                      else displayIcon = <Icon className="mb-2 h-10 w-10 opacity-70" />;

                      return (
                        <Label
                          key={option.value}
                          htmlFor={`shape-${option.value}`}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card/80 backdrop-blur-sm p-4 h-32 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all shadow-md"
                        >
                          <RadioGroupItem value={option.value} id={`shape-${option.value}`} className="sr-only" />
                          {displayIcon}
                          <span className="text-center font-semibold">{option.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                )}
              />
              {errors.currentBodyShape && <p className="text-sm text-destructive text-center">{errors.currentBodyShape.message}</p>}
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
          <p className="text-xs text-muted-foreground text-center w-full mt-6">
            This helps us understand your starting point.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
