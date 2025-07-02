
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
import { Loader2, Sparkles, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

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

  const handleBackNavigation = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 500); 
  };

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Interested Yoga Poses</CardTitle>
            <CardDescription>Select the categories of poses you're interested in learning or improving.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                              "flex flex-col justify-between p-4 border-2 rounded-lg cursor-pointer transition-all h-full min-h-[160px]",
                              "hover:border-primary/50",
                              isChecked ? "border-primary bg-primary/5 shadow-md" : "border-muted bg-background"
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
              
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackNavigation} 
                  className="w-full flex-grow"
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
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              This helps us recommend suitable poses and challenges.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
