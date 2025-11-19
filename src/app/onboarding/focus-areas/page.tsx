
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
import { Crosshair, MoveUpRight, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Progress } from '@/components/ui/progress';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Image from 'next/image';

const focusAreasSchema = z.object({
  focusBodyParts: z.array(z.string()).min(1, { message: "Please select at least one focus area" }),
});

type FocusAreasFormValues = z.infer<typeof focusAreasSchema>;

const physicalBodyParts = [
  { id: "shoulders", label: "Shoulders", imageUrl: "https://picsum.photos/seed/shoulders/300/200", imageHint: "shoulders stretching" },
  { id: "arms", label: "Arms", imageUrl: "https://picsum.photos/seed/arms/300/200", imageHint: "arm muscles" },
  { id: "core", label: "Core", imageUrl: "https://picsum.photos/seed/core/300/200", imageHint: "abdominal muscles" },
  { id: "hips", label: "Hips", imageUrl: "https://picsum.photos/seed/hips/300/200", imageHint: "hip flexibility" },
  { id: "legs", label: "Legs", imageUrl: "https://picsum.photos/seed/legs/300/200", imageHint: "leg muscles" },
  { id: "back", label: "Back", imageUrl: "https://picsum.photos/seed/back/300/200", imageHint: "back muscles" },
];

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

  const { control, handleSubmit, formState: { errors } } = useForm<FocusAreasFormValues>({
    resolver: zodResolver(focusAreasSchema),
    defaultValues: {
      focusBodyParts: [],
    }
  });

  if (authLoading) {
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
          
          <div className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg w-full">
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               <Controller
                name="focusBodyParts"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {physicalBodyParts.map((item) => {
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
                              "flex flex-col items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all h-full bg-card/80 backdrop-blur-sm overflow-hidden",
                              "hover:border-primary/50",
                              isChecked ? "border-primary bg-primary/10 shadow-md" : "border-muted"
                            )}
                          >
                            <div className="relative w-full h-24 rounded-md overflow-hidden mb-2">
                                <Image 
                                    src={item.imageUrl} 
                                    alt={item.label} 
                                    fill 
                                    className="object-cover"
                                    data-ai-hint={item.imageHint}
                                />
                                 {isChecked && (
                                    <div className="absolute inset-0 bg-primary/40"></div>
                                 )}
                            </div>
                            <h3 className="font-bold text-md text-primary">{item.label}</h3>
                            {isChecked && (
                                <div className="absolute top-3 right-3 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
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
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
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
