
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
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, MoveUpRight } from 'lucide-react';
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
    examples: "E.g., Warrior I, Triangle, Tree Pose."
  },
  {
    id: "seated",
    label: "Seated Poses",
    description: "Promote flexibility in hips and spine; encourage calm.",
    examples: "E.g., Staff Pose, Seated Forward Bend."
  },
  {
    id: "backbends",
    label: "Backbends",
    description: "Strengthen the back, open the chest and shoulders, boost energy.",
    examples: "E.g., Cobra, Bridge, Wheel Pose."
  },
  {
    id: "inversions-balancing",
    label: "Inversions & Balancing",
    description: "Improve circulation, build core strength, enhance focus.",
    examples: "E.g., Headstand, Crow Pose, Plank."
  }
];


export default function InterestedPosesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalOnboardingSteps = 7;
  const currentStep = 3;

  useEffect(() => {
    const calculatedProgress = (currentStep / totalOnboardingSteps) * 100;
    const timer = setTimeout(() => setProgress(calculatedProgress), 100);
    return () => clearTimeout(timer);
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<InterestedPosesFormValues>({
    resolver: zodResolver(interestedPosesSchema),
    defaultValues: {
      interestedPoses: [],
    }
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
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
      router.push('/onboarding/current-body-shape');
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

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <div className="w-full max-w-2xl z-10 px-4 flex flex-col items-center">
            <OnboardingHeader />
            <div className="text-center mb-8">
                
                <h1 className="text-3xl font-bold text-foreground">Interested Yoga Poses</h1>
                <p className="text-muted-foreground mt-2">Select the categories of poses you're interested in learning or improving.</p>
            </div>
        
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
              <Controller
                name="interestedPoses"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              "flex flex-col justify-between p-4 border-2 rounded-lg cursor-pointer transition-all h-full min-h-[160px] bg-card/80 backdrop-blur-sm",
                              "hover:border-primary/50",
                              isChecked ? "border-primary bg-primary/10 shadow-md" : "border-muted"
                            )}
                          >
                            <div>
                               <h3 className="font-bold text-lg text-primary">{item.label}</h3>
                               <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>
                            <p className="text-xs text-foreground/60 mt-3">{item.examples}</p>
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
                  disabled={isSubmitting || authLoading}
                >
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground text-center w-full mt-6">
              This helps us recommend suitable poses and challenges.
            </p>
        </div>
      </div>
    </AppShell>
  );
}
