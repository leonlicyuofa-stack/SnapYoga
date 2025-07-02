
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
import { Loader2, HeartPulse, ArrowRight, ArrowLeft } from 'lucide-react'; 
import Image from 'next/image';

const desiredBodyShapeSchema = z.object({
  desiredBodyShape: z.string().min(1, { message: "Please select your desired body shape or goal" }),
});

type DesiredBodyShapeFormValues = z.infer<typeof desiredBodyShapeSchema>;

const desiredShapeOptions = [
  { value: "leaner", label: "Leaner / More Defined", imageUrl: "https://placehold.co/200x300.png", hint: "lean body fitness" },
  { value: "toned", label: "More Toned", imageUrl: "https://placehold.co/200x300.png", hint: "toned body muscle" },
  { value: "stronger", label: "Stronger / More Muscular", imageUrl: "https://placehold.co/200x300.png", hint: "strong body muscular" },
  { value: "flexible", label: "More Flexible", imageUrl: "https://placehold.co/200x300.png", hint: "flexible body yoga" },
  { value: "maintain", label: "Maintain Current Shape", imageUrl: "https://placehold.co/200x300.png", hint: "healthy body maintain" },
  { value: "healthier", label: "Overall Healthier", imageUrl: "https://placehold.co/200x300.png", hint: "healthy lifestyle active" },
  { value: "prefer-not-to-say", label: "Prefer not to say / Not applicable", imageUrl: "https://placehold.co/200x300.png", hint: "yoga silhouette meditation" },
];

export default function DesiredBodyShapePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<DesiredBodyShapeFormValues>({
    resolver: zodResolver(desiredBodyShapeSchema),
  });

  const selectedShapeValue = watch("desiredBodyShape");
  const selectedShapeOption = desiredShapeOptions.find(option => option.value === selectedShapeValue);

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
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
      router.push('/onboarding/focus-areas');
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
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <HeartPulse className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Desired Body Shape</CardTitle>
            <CardDescription>What are your aspirations for your body? (Optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="desiredBodyShape">Desired Outcome</Label>
                <Controller
                  name="desiredBodyShape"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="desiredBodyShape" className="w-full">
                        <SelectValue placeholder="Select your desired outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        {desiredShapeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.desiredBodyShape && <p className="text-sm text-destructive">{errors.desiredBodyShape.message}</p>}
              </div>

              {selectedShapeOption && selectedShapeOption.imageUrl && (
                <div className="mt-6 flex justify-center">
                  <Image
                    src={selectedShapeOption.imageUrl}
                    alt={selectedShapeOption.label}
                    width={200} 
                    height={300} 
                    className="rounded-lg shadow-md object-cover"
                    data-ai-hint={selectedShapeOption.hint}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
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
              Your goals help us suggest relevant yoga practices.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
