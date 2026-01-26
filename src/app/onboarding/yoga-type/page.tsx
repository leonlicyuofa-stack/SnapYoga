
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
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, ArrowLeft, CheckCircle, MoveUpRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Progress } from '@/components/ui/progress';

const interestedPosesSchema = z.object({
  interestedPoses: z.array(z.string()).min(1, { message: "Please select at least one category" }),
});

type InterestedPosesFormValues = z.infer<typeof interestedPosesSchema>;

const poseCategoryOptions = [
  {
    id: "standing",
    label: "Standing Poses",
    description: "Build strength, stability, and balance; energize the body.",
  },
  {
    id: "seated",
    label: "Seated Poses",
    description: "Promote flexibility in hips and spine; encourage calm.",
  },
  {
    id: "backbends",
    label: "Backbends",
    description: "Strengthen the back, open the chest and shoulders, boost energy.",
  },
  {
    id: "inversions-balancing",
    label: "Inversions & Balancing",
    description: "Improve circulation, build core strength, enhance focus.",
  }
];


export default function InterestedPosesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalOnboardingSteps = 6;
  const currentStep = 2;

  useEffect(() => {
    const calculatedProgress = (currentStep / totalOnboardingSteps) * 100;
    const timer = setTimeout(() => setProgress(calculatedProgress), 100);
    return () => clearTimeout(timer);
  }, []);

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<InterestedPosesFormValues>({
    resolver: zodResolver(interestedPosesSchema),
    mode: 'onChange',
    defaultValues: {
      interestedPoses: [],
    }
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<InterestedPosesFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { interestedPoses: data.interestedPoses });
      router.push('/onboarding/profile-summary');
    } catch (error) {
      console.error("Error saving interested poses:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your interested poses. Please try again.",
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
       <Button
            onClick={handleBackNavigation}
            className="fixed top-8 left-8 rounded-full h-12 w-12 p-0 bg-white/30 hover:bg-white/50 text-splash-foreground shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40 z-20"
            aria-label="Go back"
        >
            <ArrowLeft className="h-6 w-6" />
        </Button>
      <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 m-4">
        <OnboardingHeader />
        
        <form id="yoga-type-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full mt-8">
          <Controller
            name="interestedPoses"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-4">
                {poseCategoryOptions.map((item) => {
                  const isChecked = field.value?.includes(item.id);
                  return (
                    <div key={item.id} className="relative">
                      <Checkbox
                        id={item.id}
                        className="sr-only"
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const updatedValue = checked
                            ? [...currentValue, item.id]
                            : currentValue.filter((value) => value !== item.id);
                          field.onChange(updatedValue);
                        }}
                      />
                      <Label
                        htmlFor={item.id}
                        className={cn(
                          "flex flex-col justify-center p-4 border-2 rounded-lg cursor-pointer transition-all h-full min-h-[160px] bg-card/80 backdrop-blur-sm",
                          "hover:border-primary/50",
                          isChecked ? "border-primary bg-primary/10 shadow-md" : "border-muted"
                        )}
                      >
                        <div>
                           <h3 className="font-bold text-lg text-primary">{item.label}</h3>
                           <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                        {isChecked && (
                            <div className="absolute top-3 right-3 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          />

          {errors.interestedPoses && <p className="text-sm text-destructive text-center">{errors.interestedPoses.message}</p>}
        </form>
         <div className="px-8 pt-4">
            <Button type="submit" form="yoga-type-form" className="w-full h-12 text-base rounded-full" disabled={isSubmitting || authLoading || !isValid}>
                {isSubmitting || authLoading ? <Loader2 className="animate-spin" /> : 'Next'}
            </Button>
        </div>
         <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center mt-4">
            <div className="w-full sm:w-1/4">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
                    {Math.round(progress)}% Complete
                </p>
            </div>
        </div>
        <p className="text-xs text-muted-foreground text-center w-full mt-6">
          This helps us recommend suitable poses and challenges.
        </p>
      </div>
    </div>
  );
}
