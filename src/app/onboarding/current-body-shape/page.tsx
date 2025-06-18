
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
import { Loader2, Body, ArrowRight, ArrowLeft } from 'lucide-react'; // Using Body icon

const currentBodyShapeSchema = z.object({
  currentBodyShape: z.string().min(1, { message: "Please select your current body shape" }),
});

type CurrentBodyShapeFormValues = z.infer<typeof currentBodyShapeSchema>;

const bodyShapeOptions = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "average", label: "Average" },
  { value: "curvy", label: "Curvy" },
  { value: "full-figured", label: "Full-figured / Robust" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function CurrentBodyShapePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<CurrentBodyShapeFormValues>({
    resolver: zodResolver(currentBodyShapeSchema),
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
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
      toast({
        title: "Body Shape Saved",
        description: "Great! Let's move on.",
      });
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

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <Body className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Current Body Shape</CardTitle>
            <CardDescription>Step 6 of 14: How would you describe your current body shape? (Optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentBodyShape">Body Shape</Label>
                <Controller
                  name="currentBodyShape"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="currentBodyShape" className="w-full">
                        <SelectValue placeholder="Select your current body shape" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyShapeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currentBodyShape && <p className="text-sm text-destructive">{errors.currentBodyShape.message}</p>}
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
              This helps us understand your starting point.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}

    