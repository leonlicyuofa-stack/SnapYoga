"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const yogaGoalsSchema = z.object({
  mainGoals: z.array(z.string()).min(1, { message: "Please select at least one goal" }),
});

type YogaGoalsFormValues = z.infer<typeof yogaGoalsSchema>;

const mainGoalOptions = [
  { value: "fitness", label: "Stay Fit", image: { src: "https://picsum.photos/seed/fitnessgoal/400/600", width: 400, height: 600, hint: "woman stretching" } },
  { value: "stress-relief", label: "Stress Relief", image: { src: "https://picsum.photos/seed/stressgoal/400/500", width: 400, height: 500, hint: "calm meditation" } },
  { value: "flexibility", label: "Improve Flexibility", image: { src: "https://picsum.photos/seed/flexibilitygoal/400/700", width: 400, height: 700, hint: "yoga flexibility" } },
  { value: "strength", label: "Build Strength", image: { src: "https://picsum.photos/seed/strengthgoal/400/550", width: 400, height: 550, hint: "yoga strength" } },
  { value: "mindfulness", label: "Mindfulness", image: { src: "https://picsum.photos/seed/mindfulgoal/400/650", width: 400, height: 650, hint: "mindful yoga" } },
  { value: "other", label: "Other", image: { src: "https://picsum.photos/seed/othergoal/400/450", width: 400, height: 450, hint: "yoga journal" } },
];


export default function YogaGoalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors, isValid }, setValue, watch } = useForm<YogaGoalsFormValues>({
    resolver: zodResolver(yogaGoalsSchema),
    mode: 'onChange',
    defaultValues: {
        mainGoals: [],
    }
  });

  useEffect(() => {
    if (user && !authLoading) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists() && docSnap.data().mainGoals) {
                setValue('mainGoals', docSnap.data().mainGoals, { shouldValidate: true });
            }
        });
    }
  }, [user, authLoading, setValue]);


  if (authLoading && !user) {
    // Redirect or show loader if not authenticated
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  const onSubmit: SubmitHandler<YogaGoalsFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { mainGoals: data.mainGoals });
      router.push('/onboarding/yoga-type');
    } catch (error) {
      console.error("Error saving yoga goal:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your yoga goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen font-serif text-white bg-home-dark-bg">
        <Image
            src="https://picsum.photos/seed/yogawellness/1920/1080"
            alt="A tranquil, modern space for practicing yoga."
            fill
            className="object-cover"
            data-ai-hint="modern wellness room"
            priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-4xl bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
                <header className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Your Yoga Goal</h1>
                    <p className="text-sm text-white/80">What do you want to achieve?</p>
                </header>

                <main>
                    <form id="yoga-goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                        <Controller
                            name="mainGoals"
                            control={control}
                            render={({ field }) => (
                                <div className="columns-2 sm:columns-3 gap-4 space-y-4">
                                {mainGoalOptions.map((option) => {
                                    const isChecked = field.value?.includes(option.value);
                                    return (
                                        <div key={option.value} className="relative break-inside-avoid group">
                                            <Checkbox
                                                id={option.value}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                    const currentValue = field.value || [];
                                                    const updatedValue = checked
                                                        ? [...currentValue, option.value]
                                                        : currentValue.filter(v => v !== option.value);
                                                    field.onChange(updatedValue);
                                                }}
                                                className="sr-only"
                                            />
                                            <Label
                                                htmlFor={option.value}
                                                className={cn(
                                                    "block cursor-pointer overflow-hidden rounded-2xl relative transition-all duration-300",
                                                    isChecked ? 'ring-2 ring-offset-2 ring-offset-black/20 ring-white' : 'ring-0'
                                                )}
                                            >
                                                <Image 
                                                    src={option.image.src} 
                                                    alt={option.label}
                                                    width={option.image.width}
                                                    height={option.image.height}
                                                    data-ai-hint={option.image.hint}
                                                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/60 transition-colors" />
                                                <h3 className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow-sm">{option.label}</h3>
                                                {isChecked && (
                                                    <div className="absolute top-3 right-3 h-6 w-6 bg-white/90 backdrop-blur-sm text-black rounded-full flex items-center justify-center shadow-lg">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </Label>
                                        </div>
                                    )
                                })}
                                </div>
                            )}
                        />
                        {errors.mainGoals && <p className="text-sm text-red-400 text-center">{errors.mainGoals.message}</p>}

                        <Button type="submit" form="yoga-goal-form" className="w-full h-12 text-base rounded-full mt-8 bg-white/90 text-black hover:bg-white" disabled={isSubmitting || authLoading || !isValid}>
                            {isSubmitting || authLoading ? <Loader2 className="animate-spin" /> : <>Next <ArrowRight className="ml-2" /></>}
                        </Button>
                    </form>
                </main>
            </div>
        </div>
    </div>
  );
}
