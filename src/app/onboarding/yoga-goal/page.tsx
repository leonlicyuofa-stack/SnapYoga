"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import placeholderImages from '@/lib/placeholder-images.json';

const yogaGoalsSchema = z.object({
  mainGoals: z.array(z.string()).min(1, { message: "Please select at least one goal" }),
});

type YogaGoalsFormValues = z.infer<typeof yogaGoalsSchema>;

const mainGoalOptions = [
  { value: "mobility", label: "Mobility", image: placeholderImages.onboardingGoalImages.mobility },
  { value: "nourishment", label: "Nourishment", image: placeholderImages.onboardingGoalImages.nourishment },
  { value: "flexibility", label: "Flexibility", image: { src: "/images/flexibility.png", width: 400, height: 400, hint: "yoga flexibility" } },
  { value: "strength", label: "Strength", image: placeholderImages.onboardingGoalImages.strength },
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
  
  const handleBackNavigation = () => {
    router.back();
  };

  return (
    <div className="relative min-h-screen font-serif text-white">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-2xl relative">
                 <Button
                    onClick={handleBackNavigation}
                    variant="ghost"
                    className="absolute top-4 left-4 rounded-full h-12 w-12 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
                    <header className="text-center">
                         <div className="mx-auto mb-4 inline-block">
                            <SnapYogaLogo />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Your Yoga Goal</h1>
                        <p className="text-sm text-white/80">What do you want to achieve?</p>
                    </header>

                    <main>
                        <form id="yoga-goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                            <Controller
                                name="mainGoals"
                                control={control}
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4">
                                    {mainGoalOptions.map((option) => {
                                        const isChecked = field.value?.includes(option.value);
                                        return (
                                            <div key={option.value} className="relative group">
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
                                                        "block cursor-pointer overflow-hidden rounded-2xl relative transition-all duration-300 aspect-square",
                                                        isChecked ? 'ring-2 ring-offset-2 ring-offset-black/20 ring-white' : 'ring-0'
                                                    )}
                                                >
                                                    <Image 
                                                        src={option.image.src} 
                                                        alt={option.label}
                                                        width={option.image.width}
                                                        height={option.image.height}
                                                        data-ai-hint={option.image.hint}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                        </form>
                        <p className="text-xs text-white/60 text-center w-full mt-6 px-12">
                            This helps us personalize your journey.
                        </p>
                    </main>
                </div>
                <Button
                    type="submit"
                    form="yoga-goal-form"
                    variant="ghost"
                    className="absolute bottom-4 right-4 rounded-full h-14 w-14 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
                    aria-label="Next"
                    disabled={isSubmitting || authLoading || !isValid}
                >
                    {isSubmitting || authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-7 w-7" />}
                </Button>
            </div>
        </div>
    </div>
  );
}
