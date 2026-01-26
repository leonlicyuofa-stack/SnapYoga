"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
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
  { value: "fitness", label: "Stay Fit", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'stay fit' },
  { value: "stress-relief", label: "Stress Relief", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'stress relief' },
  { value: "flexibility", label: "Improve Flexibility", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'flexibility' },
  { value: "strength", label: "Build Strength", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'strength' },
  { value: "mindfulness", label: "Mindfulness", icon: 'image', imagePath: '/images/stayfit_1.png', imageHint: 'mindfulness' },
  { value: "other", label: "Other", icon: MoreHorizontal },
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
            <div className="w-full max-w-lg bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
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
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {mainGoalOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isChecked = field.value?.includes(option.value);
                                    return (
                                        <div key={option.value} className="relative">
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
                                                "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all h-32 bg-white/10",
                                                "hover:border-white/50",
                                                isChecked ? "border-white bg-white/20" : "border-white/20"
                                            )}
                                            >
                                            {option.icon === 'image' && option.imagePath ? (
                                                <Image src={option.imagePath} alt={option.label} width={48} height={48} data-ai-hint={option.imageHint} className="opacity-80" />
                                            ) : (
                                                <Icon className="h-12 w-12 text-white/80" />
                                            )}
                                            <span className="mt-2 text-center font-semibold text-sm">{option.label}</span>
                                            {isChecked && (
                                                <div className="absolute top-2 right-2 h-5 w-5 bg-white text-black rounded-full flex items-center justify-center">
                                                    <CheckCircle className="h-4 w-4" />
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
