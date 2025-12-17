
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
import { Target, ArrowRight, ArrowLeft, Wind, Spline, BrainCircuit, MoreHorizontal, Sparkles, MoveUpRight, Loader2, CheckCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const yogaGoalsSchema = z.object({
  mainGoals: z.array(z.string()).min(1, { message: "Please select at least one goal" }),
});

type YogaGoalsFormValues = z.infer<typeof yogaGoalsSchema>;

const mainGoalOptions = [
  { value: "fitness", label: "Stay Fit", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'stay fit' },
  { value: "stress-relief", label: "Stress Relief", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'stress relief' },
  { value: "flexibility", label: "Improve Flexibility", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'flexibility' },
  { value: "strength", label: "Build Strength", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'strength' },
  { value: "mindfulness", label: "Mindfulness", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'mindfulness' },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export default function YogaGoalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalOnboardingSteps = 6;
  const currentStep = 1;

  useEffect(() => {
    const calculatedProgress = (currentStep / totalOnboardingSteps) * 100;
    const timer = setTimeout(() => setProgress(calculatedProgress), 100);
    return () => clearTimeout(timer);
  }, []);

  const { control, handleSubmit, formState: { errors, isValid }, setValue, watch } = useForm<YogaGoalsFormValues>({
    resolver: zodResolver(yogaGoalsSchema),
    mode: 'onChange',
    defaultValues: {
        mainGoals: [],
    }
  });

  const selectedGoals = watch('mainGoals');

  useEffect(() => {
    if (user && !authLoading) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists() && docSnap.data().mainGoals) {
                setValue('mainGoals', docSnap.data().mainGoals, { shouldValidate: true });
            }
        });
    }
  }, [user, authLoading, setValue]);


  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<YogaGoalsFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { mainGoals: data.mainGoals });
      router.push('/onboarding/yoga-type');
    } catch (error) {
      console.error("Error saving yoga goal:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your yoga goal. Please try again.",
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
            className="fixed top-8 left-8 rounded-full h-12 w-12 p-0 bg-white/30 hover:bg-white/50 text-splash-foreground shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40 z-20"
            aria-label="Go back"
        >
            <ArrowLeft className="h-6 w-6" />
        </Button>
      <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 m-4">
        <OnboardingHeader />
        
        <form id="yoga-goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full mt-8">
            <Controller
                name="mainGoals"
                control={control}
                render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {mainGoalOptions.map((option) => {
                        const Icon = option.icon;
                        const isChecked = field.value?.includes(option.value);
                        return (
                            <div key={option.value} className="relative">
                                <Checkbox
                                    id={option.value}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        const updatedValue = checked
                                            ? [...currentValue, option.value]
                                            : currentValue.filter(v => v !== option.value);
                                        field.onChange(updatedValue);
                                    }}
                                    className="sr-only"
                                />
                                <Label
                                htmlFor={option.value}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all h-32",
                                    "hover:border-primary/50",
                                    isChecked ? "border-primary bg-primary/10 shadow-md" : "border-muted"
                                )}
                                >
                                {option.icon === 'image' && option.imagePath ? (
                                    <Image src={option.imagePath} alt={option.label} width={48} height={48} data-ai-hint={option.imageHint} />
                                ) : (
                                    <Icon className="h-12 w-12 text-primary/80" />
                                )}
                                <span className="mt-2 text-center font-semibold text-sm">{option.label}</span>
                                {isChecked && (
                                    <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                )}
                                </Label>
                            </div>
                        )
                    })}
                    </div>
                )}
            />
            {errors.mainGoals && <p className="text-sm text-destructive text-center">{errors.mainGoals.message}</p>}

             <div className="px-8 pt-4">
                <Button type="submit" form="yoga-goal-form" className="w-full h-12 text-base rounded-full" disabled={isSubmitting || authLoading || !isValid}>
                    {isSubmitting || authLoading ? <Loader2 className="animate-spin" /> : 'Next'}
                </Button>
            </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center mt-4">
            <div className="w-full sm:w-1/4">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
                    {Math.round(progress)}% Complete
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
