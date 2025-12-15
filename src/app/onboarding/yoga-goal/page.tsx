
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AppShell } from '@/components/layout/app-shell';
import { Target, ArrowRight, ArrowLeft, Wind, Spline, BrainCircuit, MoreHorizontal, Sparkles, MoveUpRight, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Progress } from '@/components/ui/progress';
import { BuildStrengthIcon } from '@/components/icons/BuildStrengthIcon';
import { StressReliefIcon } from '@/components/icons/StressReliefIcon';
import { ImproveFlexibilityIcon } from '@/components/icons/ImproveFlexibilityIcon';
import Image from 'next/image';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';

const yogaGoalSchema = z.object({
  mainGoal: z.string().min(1, { message: "Please select your main yoga goal" }),
});

type YogaGoalFormValues = z.infer<typeof yogaGoalSchema>;

const mainGoalOptions = [
  { value: "fitness", label: "Stay Fit", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'stay fit' },
  { value: "stress-relief", label: "Stress Relief", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'stress relief' },
  { value: "flexibility", label: "Improve Flexibility", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'flexibility' },
  { value: "strength", label: "Build Strength", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'strength' },
  { value: "mindfulness", label: "Practice Mindfulness", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'mindfulness' },
  { value: "other", label: "Other", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'other' },
];


export default function YogaGoalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [progress, setProgress] = useState(0);

  // Define total steps in your onboarding flow
  const totalOnboardingSteps = 6;
  // This page is roughly step 1
  const currentStep = 1;


  const { control, handleSubmit, formState: { errors, isValid }, reset } = useForm<YogaGoalFormValues>({
    resolver: zodResolver(yogaGoalSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    // Calculate progress and animate it
    const calculatedProgress = (currentStep / totalOnboardingSteps) * 100;
    const timer = setTimeout(() => setProgress(calculatedProgress), 100);

    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.mainGoal) {
            reset({ mainGoal: userData.mainGoal });
          }
        }
      }).catch(error => {
        console.error("Error fetching user profile for default value:", error);
      }).finally(() => {
        setIsLoadingProfile(false);
      });
    } else if (!authLoading) {
      setIsLoadingProfile(false);
    }
     return () => clearTimeout(timer);
  }, [user, authLoading, reset]);


   if (authLoading || isLoadingProfile) {
    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
             <QuadrantBackground />
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
     return (
        <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
             <QuadrantBackground />
             <p>Redirecting to sign in...</p>
        </div>
     );
  }

  const onSubmit: SubmitHandler<YogaGoalFormValues> = async (data) => {
     if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { mainGoal: data.mainGoal });
      router.push('/onboarding/yoga-type');
    } catch (error) {
      console.error("Error saving main goal:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your main goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackNavigation = () => {
    router.back();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
        <QuadrantBackground />
        <Button
            onClick={handleBackNavigation}
            className="fixed top-8 left-8 rounded-full h-16 w-16 p-0 bg-white/30 hover:bg-white/50 text-splash-foreground shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
            aria-label="Go back"
        >
            <ArrowLeft className="h-8 w-8" />
        </Button>
      <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 m-4">
        <OnboardingHeader />
        
        <form id="yoga-goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full mt-8">
            <Controller
                name="mainGoal"
                control={control}
                render={({ field }) => (
                <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                    {mainGoalOptions.map((option) => {
                    
                    return (
                        <Label
                        key={option.value}
                        htmlFor={`goal-${option.value}`}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card/80 backdrop-blur-sm p-4 h-24 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all shadow-md"
                        >
                        <RadioGroupItem value={option.value} id={`goal-${option.value}`} className="sr-only" />
                         <div className="mb-2 h-8 w-8 relative">
                            <Image src={option.imagePath} alt={option.label} layout="fill" objectFit="contain" data-ai-hint={option.imageHint} />
                         </div>
                        <span className="text-center font-semibold">{option.label}</span>
                        </Label>
                    );                        
                    })}
                </RadioGroup>
                )}
            />
            {errors.mainGoal && <p className="text-sm text-destructive text-center">{errors.mainGoal.message}</p>}
        </form>
         <p className="text-xs text-muted-foreground text-center w-full mt-6">
          Understanding your goals helps us personalize suggestions.
        </p>
      </div>
       <Button
            type="submit"
            form="yoga-goal-form"
            className="fixed bottom-8 right-8 rounded-full h-16 w-16 p-0 bg-white/30 hover:bg-white/50 text-splash-foreground shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
            aria-label="Next"
            disabled={isSubmitting || authLoading || isNavigatingBack || !isValid}
        >
            {isSubmitting ? <Loader2 className="h-8 w-8 animate-spin" /> : <MoveUpRight className="h-8 w-8" />}
        </Button>
    </div>
  );
}
