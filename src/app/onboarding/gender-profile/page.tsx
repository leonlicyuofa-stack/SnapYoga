
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, User, Users, ArrowRight } from 'lucide-react'; // Added Users icon

const genderProfileSchema = z.object({
  gender: z.string().min(1, { message: "Please select a gender option" }),
});

type GenderProfileFormValues = z.infer<typeof genderProfileSchema>;

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function GenderProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<GenderProfileFormValues>({
    resolver: zodResolver(genderProfileSchema),
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<GenderProfileFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { gender: data.gender });
      toast({
        title: "Gender Saved",
        description: "Let's move to the next step.",
      });
      router.push('/onboarding/age-group');
    } catch (error) {
      console.error("Error saving gender:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your gender. Please try again.",
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
            <Users className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Your Profile</CardTitle>
            <CardDescription>Step 1 of 14: Please select your gender.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    {genderOptions.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`gender-${option.value}`}
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={`gender-${option.value}`} className="sr-only" />
                        <User className="mb-3 h-6 w-6" />
                        {option.label}
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.gender && <p className="text-sm text-destructive text-center">{errors.gender.message}</p>}
              <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || authLoading}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                Next
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              This information helps us tailor your SnapYoga experience.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}

    