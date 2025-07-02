
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext'; // Adjusted import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck, Bone, Target, TrendingUp, Activity, Weight, User } from 'lucide-react'; // Added User icon
import { AppShell } from '@/components/layout/app-shell';

const profileDetailsSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }), // Added name field
  gender: z.string().min(1, { message: "Gender is required" }),
  yogaInterest: z.string().min(1, { message: "Yoga interest is required" }),
  mainGoal: z.string().min(1, { message: "Main goal is required" }),
  height: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Height must be a number" }).positive({ message: "Height must be positive" }).optional()
  ),
  weight: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Weight must be a number" }).positive({ message: "Weight must be positive" }).optional()
  ),
});

type ProfileDetailsFormValues = z.infer<typeof profileDetailsSchema>;

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const yogaInterestOptions = [
  { value: "hatha", label: "Hatha Yoga" },
  { value: "vinyasa", label: "Vinyasa Yoga" },
  { value: "ashtanga", label: "Ashtanga Yoga" },
  { value: "restorative", label: "Restorative Yoga" },
  { value: "power", label: "Power Yoga" },
  { value: "not-sure", label: "Not sure yet" },
];

const mainGoalOptions = [
  { value: "fitness", label: "Stay Fit" },
  { value: "stress-relief", label: "Stress Relief" },
  { value: "flexibility", label: "Improve Flexibility" },
  { value: "strength", label: "Build Strength" },
  { value: "mindfulness", label: "Practice Mindfulness" },
];

export default function OnboardingDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, register, handleSubmit, formState: { errors } } = useForm<ProfileDetailsFormValues>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      name: user?.displayName || '', // Pre-fill with displayName if available
      gender: '',
      yogaInterest: '',
      mainGoal: '',
    }
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user) {
    // Redirect to sign-in if no user is found (e.g., direct navigation to this page)
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<ProfileDetailsFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found. Please sign in again.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Update additionalData to include displayName as the entered name
      await createUserProfileDocument(user, { ...data, displayName: data.name });
      toast({
        title: "Profile Details Saved!",
        description: "Let's continue to the next step.",
      });
      router.push('/auth/onboarding/app-info');
    } catch (error) {
      console.error("Error saving profile details:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your profile details. Please try again.",
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
            <UserCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Tell Us About Yourself</CardTitle>
            <CardDescription>This will help us personalize your SnapYoga experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    {...register("name")}
                    className="pl-10"
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
              </div>

              {/* Yoga Interest */}
              <div className="space-y-2">
                <Label htmlFor="yogaInterest">Yoga Interest</Label>
                 <Controller
                  name="yogaInterest"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="yogaInterest" className="w-full">
                         <div className="flex items-center">
                           <Bone className="mr-2 h-4 w-4 text-muted-foreground" />
                           <SelectValue placeholder="What type of yoga interests you?" />
                         </div>
                      </SelectTrigger>
                      <SelectContent>
                        {yogaInterestOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.yogaInterest && <p className="text-sm text-destructive">{errors.yogaInterest.message}</p>}
              </div>

              {/* Main Goal */}
              <div className="space-y-2">
                <Label htmlFor="mainGoal">Main Goal for Yoga</Label>
                <Controller
                  name="mainGoal"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="mainGoal" className="w-full">
                        <div className="flex items-center">
                          <Target className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="What's your primary goal?" />
                        </div>
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
              
              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="height"
                    type="number"
                    placeholder="e.g., 170"
                    {...register("height")}
                    className="pl-10"
                  />
                </div>
                {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                 <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 65"
                    {...register("weight")}
                    className="pl-10"
                  />
                </div>
                {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <TrendingUp className="mr-2 h-5 w-5"/>}
                Save and Continue
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Your information helps us tailor SnapYoga for you.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}

