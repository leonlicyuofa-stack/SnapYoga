
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
import { Loader2, CalendarRange, ArrowRight, ArrowLeft } from 'lucide-react';

const ageGroupSchema = z.object({
  ageGroup: z.string().min(1, { message: "Please select your age group" }),
});

type AgeGroupFormValues = z.infer<typeof ageGroupSchema>;

const ageGroupOptions = [
  { value: "18-24", label: "18-24 years" },
  { value: "25-34", label: "25-34 years" },
  { value: "35-44", label: "35-44 years" },
  { value: "45-54", label: "45-54 years" },
  { value: "55-64", label: "55-64 years" },
  { value: "65+", label: "65 years or older" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function AgeGroupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<AgeGroupFormValues>({
    resolver: zodResolver(ageGroupSchema),
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<AgeGroupFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { ageGroup: data.ageGroup });
      toast({
        title: "Age Group Saved",
        description: "Let's continue to the next step.",
      });
      router.push('/onboarding/yoga-goal');
    } catch (error) {
      console.error("Error saving age group:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your age group. Please try again.",
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
            <CalendarRange className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Your Age Group</CardTitle>
            <CardDescription>Step 2 of 14: This helps us suggest appropriate content.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Controller
                  name="ageGroup"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="ageGroup" className="w-full">
                        <SelectValue placeholder="Select your age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroupOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.ageGroup && <p className="text-sm text-destructive">{errors.ageGroup.message}</p>}
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
              Your privacy is important to us.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}

    