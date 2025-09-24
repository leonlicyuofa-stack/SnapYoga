
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
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Progress } from '@/components/ui/progress';
import { BuildStrengthIcon } from '@/components/icons/BuildStrengthIcon';
import { StayFitIcon } from '@/components/icons/StayFitIcon';
import { StressReliefIcon } from '@/components/icons/StressReliefIcon';
import { ImproveFlexibilityIcon } from '@/components/icons/ImproveFlexibilityIcon';
import Image from 'next/image';

const yogaGoalSchema = z.object({
  mainGoal: z.string().min(1, { message: "Please select your main yoga goal" }),
});

type YogaGoalFormValues = z.infer<typeof yogaGoalSchema>;

const mainGoalOptions = [
  { value: "fitness", label: "Stay Fit", icon: StressReliefIcon },
  { value: "stress-relief", label: "Stress Relief", icon: StressReliefIcon },
  { value: "flexibility", label: "Improve Flexibility", icon: ImproveFlexibilityIcon },
  { value: "strength", label: "Build Strength", icon: StressReliefIcon },
  { value: "mindfulness", label: "Practice Mindfulness", icon: StressReliefIcon },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

const affirmations = [
    "I am becoming everything I’m meant to be, one small step at a time.",
    "Today, I choose peace over pressure.",
    "I don’t need to rush. What’s meant for me will find me.",
    "I am allowed to take up space, rest, and breathe deeply.",
    "Progress is quiet, gentle, and still counts.",
    "I trust myself to grow through what I go through.",
    "Even slow blooms still become flowers.",
    "I honor where I am, even if it’s not where I thought I’d be.",
    "Every breath is a reset. I start fresh now."
];

// Affirmation Dialog Component
function AffirmationDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const [affirmation, setAffirmation] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const randomIndex = Math.floor(Math.random() * affirmations.length);
            setAffirmation(affirmations[randomIndex]);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    
                    <DialogTitle className="text-2xl font-bold">Your Daily Affirmation</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {affirmation ? (
                        <p className="text-xl font-medium text-primary/90 animate-in zoom-in-125 duration-500">
                           &ldquo;{affirmation}&rdquo;
                        </p>
                    ) : (
                        <SmileyRockLoader />
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function YogaGoalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [progress, setProgress] = useState(0);

  // Define total steps in your onboarding flow
  const totalOnboardingSteps = 6;
  // This page is roughly step 1
  const currentStep = 1;


  const { control, handleSubmit, formState: { errors }, reset } = useForm<YogaGoalFormValues>({
    resolver: zodResolver(yogaGoalSchema),
  });

  useEffect(() => {
    // Calculate progress and animate it
    const calculatedProgress = (currentStep / totalOnboardingSteps) * 100;
    const timer = setTimeout(() => setProgress(calculatedProgress), 100);

    // Show affirmation dialog on first load of this page
    const hasSeenAffirmation = sessionStorage.getItem('seenOnboardingAffirmation');
    if (!hasSeenAffirmation) {
        setShowAffirmation(true);
        sessionStorage.setItem('seenOnboardingAffirmation', 'true');
    }

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
        <AppShell>
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <SmileyRockLoader />
            </div>
        </AppShell>
    );
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
     return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
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
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 500); 
  };

  return (
    <AppShell>
      <AffirmationDialog isOpen={showAffirmation} onOpenChange={setShowAffirmation} />
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <div className="w-full max-w-2xl z-10 px-4 flex flex-col items-center">
            <OnboardingHeader />
            <div className="text-center mb-2">
                
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
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
                          if (option.icon === 'image' && option.imagePath) {
                              return (
                                <Label
                                  key={option.value}
                                  htmlFor={`goal-${option.value}`}
                                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 h-32 hover:bg-accent/20 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all shadow-md"
                                >
                                  <RadioGroupItem value={option.value} id={`goal-${option.value}`} className="sr-only" />
                                  <div className="mb-2 h-16 w-16 relative">
                                    <Image src={option.imagePath} alt={option.label} layout="fill" objectFit="contain" />
                                  </div>
                                </Label>
                              );
                          }

                          let Icon = option.icon as React.ElementType;
                          let iconClassName = "mb-2 h-16 w-16";
                          
                          return (
                              <Label
                              key={option.value}
                              htmlFor={`goal-${option.value}`}
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card/80 backdrop-blur-sm p-4 h-32 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all shadow-md"
                              >
                              <RadioGroupItem value={option.value} id={`goal-${option.value}`} className="sr-only" />
                              <Icon className={iconClassName} />
                              <span className="text-center font-semibold">{option.label}</span>
                              </Label>
                          );
                        })}
                    </RadioGroup>
                    )}
                />
                {errors.mainGoal && <p className="text-sm text-destructive text-center">{errors.mainGoal.message}</p>}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center">
                <div className="w-full sm:w-1/4">
                    <Progress value={progress} className="w-full h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
                        {Math.round(progress)}% Complete
                    </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40" 
                  disabled={isSubmitting || authLoading || isNavigatingBack}
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
                </div>
            </form>
             <p className="text-xs text-muted-foreground text-center w-full mt-6">
              Understanding your goals helps us personalize suggestions.
            </p>
        </div>
      </div>
    </AppShell>
  );
}
