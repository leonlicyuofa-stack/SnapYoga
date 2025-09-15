
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, HeartPulse, ArrowRight, ArrowLeft, Dumbbell, Spline, Anchor, HelpCircle, Mountain, Zap, Activity, MoveUpRight } from 'lucide-react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const desiredBodyShapeSchema = z.object({
  desiredBodyShape: z.string().min(1, { message: "Please select your desired body shape or goal" }),
});

type DesiredBodyShapeFormValues = z.infer<typeof desiredBodyShapeSchema>;

const desiredShapeOptions = [
  { value: "leaner", label: "Leaner / Defined", icon: Mountain },
  { value: "toned", label: "More Toned", icon: Zap },
  { value: "stronger", label: "Stronger / Muscular", icon: Dumbbell },
  { value: "athletic", label: "More Athletic", icon: Activity },
  { value: "flexible", label: "More Flexible", icon: Spline },
  { value: "maintain", label: "Maintain Current Shape", icon: Anchor },
  { value: "healthier", label: "Overall Healthier", icon: HeartPulse },
  { value: "prefer-not-to-say", label: "Prefer not to say", icon: HelpCircle },
];


export default function DesiredBodyShapePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<DesiredBodyShapeFormValues>({
    resolver: zodResolver(desiredBodyShapeSchema),
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><SmileyRockLoader text="Loading..." /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<DesiredBodyShapeFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { desiredBodyShape: data.desiredBodyShape });
      router.push('/onboarding/almost-there');
    } catch (error) {
      console.error("Error saving desired body shape:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your desired body shape. Please try again.",
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
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4 overflow-hidden">
        
        <div className="w-full max-w-3xl z-10">
            <div className="text-center mb-8">
                <HeartPulse className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-3xl font-bold">Desired Body Shape</h1>
                <p className="text-muted-foreground mt-2">What are your aspirations for your body?</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Controller
                name="desiredBodyShape"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {desiredShapeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Label
                          key={option.value}
                          htmlFor={`shape-${option.value}`}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card/80 backdrop-blur-sm p-4 h-32 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all shadow-md"
                        >
                          <RadioGroupItem value={option.value} id={`shape-${option.value}`} className="sr-only" />
                          <Icon className="mb-2 h-8 w-8" />
                          <span className="text-center text-sm">{option.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                )}
              />
              {errors.desiredBodyShape && <p className="text-sm text-destructive text-center">{errors.desiredBodyShape.message}</p>}

              <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackNavigation} 
                  className="w-full sm:w-auto flex-grow bg-card/80 backdrop-blur-sm"
                  isLoadingWithBar={isNavigatingBack}
                  loadingBarDirection="rtl"
                  disabled={isSubmitting || isNavigatingBack}
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                </Button>
                <Button 
                  type="submit" 
                  className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40" 
                  disabled={isSubmitting || authLoading || isNavigatingBack}
                >
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </div>
            </form>
             <p className="text-xs text-muted-foreground text-center w-full mt-6">
              Your goals help us suggest relevant yoga practices.
            </p>
        </div>
      </div>
    </AppShell>
  );
}

    