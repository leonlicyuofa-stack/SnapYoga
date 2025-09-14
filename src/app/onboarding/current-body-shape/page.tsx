
"use client";

import { useState } from 'react';
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
import { Loader2, PersonStanding, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react'; 
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FemaleAvatar } from '@/components/icons/FemaleAvatar';
import { MaleAvatar } from '@/components/icons/MaleAvatar';


const currentBodyShapeSchema = z.object({
  currentBodyShape: z.string().min(1, { message: "Please select your current body shape" }),
});

type CurrentBodyShapeFormValues = z.infer<typeof currentBodyShapeSchema>;

const bodyShapeOptions = [
  { value: "slim", label: "Slim", icon: PersonStanding },
  { value: "athletic", label: "Athletic", icon: PersonStanding },
  { value: "average", label: "Average", icon: PersonStanding },
  { value: "curvy", label: "Curvy", icon: PersonStanding },
  { value: "full-figured", label: "Full-figured", icon: PersonStanding },
  { value: "prefer-not-to-say", label: "Prefer not to say", icon: HelpCircle },
];

export default function CurrentBodyShapePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

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

  const handleBackNavigation = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 500); 
  };

  return (
    <AppShell>
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4 overflow-hidden">
        
        <div className="w-full max-w-2xl z-10">
          <div className="text-center mb-8">
            <PersonStanding className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold">Current Body Shape</h1>
            <p className="text-muted-foreground mt-2">How would you describe your current body shape? (Optional)</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      const femaleIcon = <FemaleAvatar className="h-10 w-10 mb-2 opacity-70" />;
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
              <div className="flex flex-col sm:flex-row gap-2">
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
            This helps us understand your starting point.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
