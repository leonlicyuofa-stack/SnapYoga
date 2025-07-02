
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const interestedPosesSchema = z.object({
  interestedPoses: z.array(z.string()).min(1, { message: "Please select at least one pose" }),
});

type InterestedPosesFormValues = z.infer<typeof interestedPosesSchema>;

const poseCategories = [
  {
    name: "Standing Poses",
    poses: [
      { id: "warrior-1", label: "Warrior I (Virabhadrasana I)" },
      { id: "triangle-pose", label: "Triangle (Trikonasana)" },
      { id: "tree-pose", label: "Tree Pose (Vrikshasana)" },
    ],
  },
  {
    name: "Seated Poses",
    poses: [
      { id: "staff-pose", label: "Staff Pose (Dandasana)" },
      { id: "seated-forward-bend", label: "Seated Forward Bend (Paschimottanasana)" },
      { id: "easy-pose", label: "Easy Pose (Sukhasana)" },
    ],
  },
  {
    name: "Backbends",
    poses: [
      { id: "cobra-pose", label: "Cobra (Bhujangasana)" },
      { id: "bridge-pose", label: "Bridge (Setu Bandhasana)" },
      { id: "wheel-pose", label: "Wheel (Urdhva Dhanurasana)" },
    ],
  },
    {
    name: "Inversions and Balancing Poses",
    poses: [
      { id: "shoulder-stand", label: "Shoulder Stand (Sarvangasana)" },
      { id: "headstand", label: "Headstand (Sirsasana)" },
      { id: "crow-pose", label: "Crow Pose (Bakasana)" },
      { id: "plank-pose", label: "Plank" },
    ],
  },
];


export default function InterestedPosesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<InterestedPosesFormValues>({
    resolver: zodResolver(interestedPosesSchema),
    defaultValues: {
      interestedPoses: [],
    }
  });

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<InterestedPosesFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { interestedPoses: data.interestedPoses });
      router.push('/onboarding/current-body-shape');
    } catch (error) {
      console.error("Error saving interested poses:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your interested poses. Please try again.",
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
            <CardTitle className="text-3xl font-bold">Interested Yoga Poses</CardTitle>
            <CardDescription>Select some poses you're interested in learning or improving.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {poseCategories.map((category) => (
                  <div key={category.name}>
                    <h3 className="font-semibold text-lg mb-2 text-primary">{category.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {category.poses.map((item) => (
                        <Controller
                          key={item.id}
                          name="interestedPoses"
                          control={control}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                              <Checkbox
                                id={item.id}
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  const updatedValue = checked
                                    ? [...currentValue, item.id]
                                    : currentValue.filter((value) => value !== item.id);
                                  field.onChange(updatedValue);
                                }}
                              />
                              <Label htmlFor={item.id} className="font-normal cursor-pointer flex-grow">
                                {item.label}
                              </Label>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {errors.interestedPoses && <p className="text-sm text-destructive text-center">{errors.interestedPoses.message}</p>}
              
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
