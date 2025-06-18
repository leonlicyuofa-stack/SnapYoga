
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
import { Loader2, Crosshair, ArrowRight, ArrowLeft } from 'lucide-react';

const focusAreasSchema = z.object({
  focusBodyParts: z.array(z.string()).min(1, { message: "Please select at least one focus area" }),
});

type FocusAreasFormValues = z.infer<typeof focusAreasSchema>;

const bodyPartOptions = [
  { id: "arms", label: "Arms (Strength, Toning)" },
  { id: "legs", label: "Legs (Strength, Flexibility)" },
  { id: "core", label: "Core (Stability, Strength)" },
  { id: "back", label: "Back (Flexibility, Pain Relief)" },
  { id: "shoulders", label: "Shoulders (Mobility, Opening)" },
  { id: "hips", label: "Hips (Opening, Flexibility)" },
  { id: "full-body", label: "Full Body (Overall Fitness)" },
  { id: "balance", label: "Balance & Coordination" },
  { id: "mindfulness", label: "Mindfulness & Relaxation" },
];

export default function FocusAreasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FocusAreasFormValues>({
    resolver: zodResolver(focusAreasSchema),
    defaultValues: {
      focusBodyParts: [],
    }
  });

  const selectedParts = watch('focusBodyParts');

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<FocusAreasFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { focusBodyParts: data.focusBodyParts });
      toast({
        title: "Focus Areas Saved",
        description: "Almost done with personalization!",
      });
      router.push('/onboarding/app-features');
    } catch (error) {
      console.error("Error saving focus areas:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your focus areas. Please try again.",
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
            <Crosshair className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Focus Body Parts/Areas</CardTitle>
            <CardDescription>Step 8 of 14: Which areas would you like to focus on? (Select all that apply)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bodyPartOptions.map((item) => (
                  <Controller
                    key={item.id}
                    name="focusBodyParts"
                    control={control}
                    render={({ field }) => {
                      return (
                        <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={item.id}
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item.id
                                    )
                                  );
                            }}
                          />
                          <Label htmlFor={item.id} className="font-normal cursor-pointer flex-grow">
                            {item.label}
                          </Label>
                        </div>
                      );
                    }}
                  />
                ))}
              </div>
              {errors.focusBodyParts && <p className="text-sm text-destructive text-center">{errors.focusBodyParts.message}</p>}
              
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
              This helps us tailor content for you.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}

    