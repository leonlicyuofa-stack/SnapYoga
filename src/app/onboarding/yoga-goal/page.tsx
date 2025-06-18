
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, Target, ArrowRight, ArrowLeft } from 'lucide-react';

const yogaGoalSchema = z.object({
  mainGoal: z.string().min(1, { message: "Please select your main yoga goal" }),
});

type YogaGoalFormValues = z.infer<typeof yogaGoalSchema>;

const mainGoalOptions = [
  { value: "fitness", label: "Stay Fit" },
  { value: "stress-relief", label: "Stress Relief" },
  { value: "flexibility", label: "Improve Flexibility" },
  { value: "strength", label: "Build Strength" },
  { value: "mindfulness", label: "Practice Mindfulness" },
  { value: "other", label: "Other (please specify)" }, // You might need another input for this
];

export default function YogaGoalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<YogaGoalFormValues>({
    resolver: zodResolver(yogaGoalSchema),
  });

   if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
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
      router.push('/onboarding/measurements');
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

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <Target className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Your Main Yoga Goal</CardTitle>
            <CardDescription>What do you hope to achieve with yoga?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mainGoal">Main Goal</Label>
                <Controller
                  name="mainGoal"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="mainGoal" className="w-full">
                        <SelectValue placeholder="Select your primary goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {mainGoalOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.mainGoal && <p className="text-sm text-destructive">{errors.mainGoal.message}</p>}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                </Button>
                <Button type="submit" className="w-full text-lg py-6 flex-grow" disabled={isSubmitting || authLoading}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                    Next
                </Button>
              </div>
            </form>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Understanding your goals helps us personalize suggestions.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}

    
