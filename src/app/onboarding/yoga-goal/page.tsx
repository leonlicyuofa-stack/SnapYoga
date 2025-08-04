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
import { Loader2, Target, ArrowRight, ArrowLeft, HeartPulse, Wind, Spline, Dumbbell, BrainCircuit, MoreHorizontal } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const yogaGoalSchema = z.object({
  mainGoal: z.string().min(1, { message: "Please select your main yoga goal" }),
});

type YogaGoalFormValues = z.infer<typeof yogaGoalSchema>;

const mainGoalOptions = [
  { value: "fitness", label: "Stay Fit", icon: HeartPulse },
  { value: "stress-relief", label: "Stress Relief", icon: Wind },
  { value: "flexibility", label: "Improve Flexibility", icon: Spline },
  { value: "strength", label: "Build Strength", icon: Dumbbell },
  { value: "mindfulness", label: "Practice Mindfulness", icon: BrainCircuit },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export default function YogaGoalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<YogaGoalFormValues>({
    resolver: zodResolver(yogaGoalSchema),
  });

  useEffect(() => {
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
  }, [user, authLoading, reset]);


   if (authLoading || isLoadingProfile) {
    return (
        <AppShell>
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <SmileyRockLoader text="Loading your goal..." />
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
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <div className="absolute inset-0 z-0 bg-splash-background">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                    <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
                <path d="M 0,0 L 100,0 C 50,50 100,50 100,100 L 0,100 Z" fill="hsl(var(--splash-blob-1))" />
                <path d="M 0,100 C 50,50 0,50 0,0" fill="hsl(var(--splash-background))" />
                
                {/* Blue Cat */}
                <g transform="translate(-80, 20) scale(1.1)">
                    <path d="M 5,65 C 15,40 40,30 65,55 C 80,70 70,95 45,98 C 20,101 0,80 5,65 Z" fill="hsl(var(--splash-blob-2))" />
                    <ellipse cx="38" cy="78" rx="10" ry="7" fill="url(#blushGradient)" />
                    <ellipse cx="62" cy="78" rx="10" ry="7" fill="url(#blushGradient)" />
                    <ellipse cx="45" cy="70" rx="3" ry="6" fill="#2C3E50" />
                    <ellipse cx="62" cy="70" rx="3" ry="6" fill="#2C3E50" />
                    <path d="M 48,80 Q 52,85 56,80" stroke="#2C3E50" fill="none" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                
                {/* Green Cat */}
                 <g transform="translate(-70, -10) scale(0.9)">
                    <path d="M 5,65 C 15,40 40,30 65,55 C 80,70 70,95 45,98 C 20,101 0,80 5,65 Z" fill="hsl(var(--splash-blob-3))" />
                </g>

                {/* Grey Cat */}
                <g transform="translate(-60, -30) scale(0.7)">
                    <path d="M 5,65 C 15,40 40,30 65,55 C 80,70 70,95 45,98 C 20,101 0,80 5,65 Z" fill="hsl(var(--splash-blob-3))" />
                </g>
            </svg>
        </div>
        <div className="w-full max-w-2xl z-10 px-4">
            <div className="text-center mb-8">
                <Target className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-3xl font-bold text-foreground">Your Main Yoga Goal</h1>
                <p className="text-muted-foreground mt-2">What do you hope to achieve with yoga?</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        const Icon = option.icon;
                        return (
                            <Label
                            key={option.value}
                            htmlFor={`goal-${option.value}`}
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card/80 backdrop-blur-sm p-4 h-32 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all shadow-md"
                            >
                            <RadioGroupItem value={option.value} id={`goal-${option.value}`} className="sr-only" />
                            <Icon className="mb-2 h-8 w-8" />
                            <span className="text-center font-semibold">{option.label}</span>
                            </Label>
                        );
                        })}
                    </RadioGroup>
                    )}
                />
                {errors.mainGoal && <p className="text-sm text-destructive text-center">{errors.mainGoal.message}</p>}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBackNavigation} 
                    className="w-full flex-grow bg-card/80 backdrop-blur-sm"
                    isLoadingWithBar={isNavigatingBack}
                    loadingBarDirection="rtl"
                    disabled={isSubmitting || isNavigatingBack}
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                </Button>
                <Button 
                    type="submit" 
                    className="w-full flex-grow" 
                    isLoadingWithBar={isSubmitting}
                    disabled={isSubmitting || authLoading || isNavigatingBack}
                >
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Next
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
