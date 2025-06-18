
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
import { Loader2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'; // Replaced Bone with Sparkles for a general feel

const yogaTypeSchema = z.object({
  preferredYogaType: z.string().min(1, { message: "Please select your preferred yoga type" }),
});

type YogaTypeFormValues = z.infer<typeof yogaTypeSchema>;

const yogaTypeOptions = [
  { value: "hatha", label: "Hatha Yoga" },
  { value: "vinyasa", label: "Vinyasa Yoga" },
  { value: "ashtanga", label: "Ashtanga Yoga" },
  { value: "restorative", label: "Restorative Yoga" },
  { value: "power", label: "Power Yoga" },
  { value: "yin", label: "Yin Yoga" },
  { value: "iyengar", label: "Iyengar Yoga" },
  { value: "not-sure", label: "Not sure yet / Beginner" },
  { value: "other", label: "Other" },
];

export default function YogaTypePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<YogaTypeFormValues>({
    resolver: zodResolver(yogaTypeSchema),
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<YogaTypeFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { preferredYogaType: data.preferredYogaType });
      router.push('/onboarding/current-body-shape');
    } catch (error) {
      console.error("Error saving preferred yoga type:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your preferred yoga type. Please try again.",
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
            <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Preferred Yoga Type</CardTitle>
            <CardDescription>What style of yoga are you most interested in?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="preferredYogaType">Yoga Type</Label>
                <Controller
                  name="preferredYogaType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="preferredYogaType" className="w-full">
                        <SelectValue placeholder="Select your preferred yoga type" />
                      </SelectTrigger>
                      <SelectContent>
                        {yogaTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.preferredYogaType && <p className="text-sm text-destructive">{errors.preferredYogaType.message}</p>}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                </Button>
                <Button 
                  type="submit" 
                  className="w-full text-lg py-6 flex-grow" 
                  isLoadingWithBar={isSubmitting}
                  disabled={isSubmitting || authLoading}
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

    
