"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingScaffold } from '@/components/onboarding/onboarding-scaffold';
import { GlossyButton } from '@/components/ui/glossy-button';

const yogaGoalsSchema = z.object({
  mainGoals: z.array(z.string()).min(1, { message: "Please select at least one goal" }),
});

type YogaGoalsFormValues = z.infer<typeof yogaGoalsSchema>;

// "Pick your path" cards — an illustration on the art panel + caption below.
// Order is deliberate: Flexibility, Mobility, Balance, Strength.
const mainGoalOptions = [
  { value: "flexibility", label: "Flexibility", line: "Deepen your range",  image: "/images/flexibility.png" },
  { value: "mobility",    label: "Mobility",    line: "Move with ease",     image: "/images/mobility.png" },
  { value: "balance",     label: "Balance",     line: "Find your centre",   image: "/images/balance.png" },
  { value: "strength",    label: "Strength",    line: "Build steady power", image: "/images/strength.png" },
];


export default function YogaGoalPage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The illustrations read the same in both themes; only the caption panel —
  // which sits on the app ground — flips with the theme.
  const capBg      = isDark ? 'rgba(255,240,215,0.06)' : 'rgba(42,21,51,0.05)';
  const capName    = isDark ? 'rgba(255,240,215,0.95)' : 'rgba(42,21,51,0.95)';
  const capSub     = isDark ? 'rgba(255,240,215,0.5)'  : 'rgba(42,21,51,0.55)';
  // Selected cue: accent border + soft accent ring + lift — amethyst in light
  // (pops on the lavender ground), gold in dark.
  const selBorder  = isDark ? '#C19A6B' : '#320E3B';
  const selShadow  = isDark
    ? '0 0 0 4px rgba(193,154,107,0.22), 0 14px 30px rgba(0,0,0,0.5)'
    : '0 0 0 4px rgba(50,14,59,0.16), 0 14px 30px rgba(50,30,60,0.30)';

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
    <OnboardingScaffold
      title="Yoga goals"
      subtitle="What do you want to achieve?"
      step={2}
      totalSteps={5}
      onBack={handleBackNavigation}
      next={
        <GlossyButton
          type="submit"
          form="yoga-goal-form"
          variant="primary"
          icon={<ArrowRight className="h-4 w-4" />}
          loading={isSubmitting || authLoading}
          disabled={!isValid}
        >
          Next
        </GlossyButton>
      }
    >
                    <main>
                        <form id="yoga-goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                            <Controller
                                name="mainGoals"
                                control={control}
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    {mainGoalOptions.map((option) => {
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
                                                    className="block cursor-pointer overflow-hidden transition-all duration-300"
                                                    style={{
                                                        borderRadius: 20,
                                                        boxSizing: 'border-box',
                                                        border: isChecked ? `2px solid ${selBorder}` : '1px solid rgba(193,154,107,0.18)',
                                                        boxShadow: isChecked ? selShadow : 'none',
                                                    }}
                                                >
                                                    <div className="aspect-square">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div style={{ padding: '16px 18px', background: capBg }}>
                                                        <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.2, margin: 0, color: capName }}>{option.label}</p>
                                                        <p style={{ fontSize: 11.5, margin: '3px 0 0', color: capSub }}>{option.line}</p>
                                                    </div>
                                                </Label>
                                            </div>
                                        )
                                    })}
                                    </div>
                                )}
                            />
                            {errors.mainGoals && <p className="text-sm text-red-400 text-center">{errors.mainGoals.message}</p>}
                        </form>
                        <p className="sy-body text-xs text-center w-full mt-6 px-12">
                            This helps us personalize your journey.
                        </p>
                    </main>
    </OnboardingScaffold>
  );
}
