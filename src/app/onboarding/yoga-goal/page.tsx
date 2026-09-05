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
import { FlexibilityIcon, MobilityIcon, BalanceIcon, StrengthIcon } from '@/components/icons/PathIcons';

const yogaGoalsSchema = z.object({
  mainGoals: z.array(z.string()).min(1, { message: "Please select at least one goal" }),
});

type YogaGoalsFormValues = z.infer<typeof yogaGoalsSchema>;

// "Pick your path" cards — line-art icon on a coloured art panel + caption below.
// Order is deliberate: Flexibility, Mobility, Balance, Strength.
const mainGoalOptions = [
  { value: "flexibility", label: "Flexibility", line: "Deepen your range",  grad: "linear-gradient(135deg,#7a55a0,#3a2352)", Icon: FlexibilityIcon },
  { value: "mobility",    label: "Mobility",    line: "Move with ease",     grad: "linear-gradient(135deg,#9a7350,#4b2f52)", Icon: MobilityIcon },
  { value: "balance",     label: "Balance",     line: "Find your centre",   grad: "linear-gradient(135deg,#8a8455,#3f4028)", Icon: BalanceIcon },
  { value: "strength",    label: "Strength",    line: "Build steady power", grad: "linear-gradient(135deg,#4d8817,#1f3a08)", Icon: StrengthIcon },
];


export default function YogaGoalPage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The art panels are the same dark gradients in both modes, so the icon ink
  // stays cream in both for legibility (deep-purple ink was unreadable on them
  // in light mode). Only the caption panel — which sits on the app ground —
  // flips with the theme.
  const ink        = 'rgba(255,244,225,0.9)';
  const shadow     = 'rgba(255,244,225,0.16)';
  const capBg      = isDark ? 'rgba(255,240,215,0.06)' : 'rgba(42,21,51,0.05)';
  const capName    = isDark ? 'rgba(255,240,215,0.95)' : 'rgba(42,21,51,0.95)';
  const capSub     = isDark ? 'rgba(255,240,215,0.5)'  : 'rgba(42,21,51,0.55)';
  const liftShadow = isDark ? '0 14px 30px rgba(0,0,0,0.45)' : '0 14px 30px rgba(50,30,60,0.28)';

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
        <Button
          type="submit"
          form="yoga-goal-form"
          variant="ghost"
          className="rounded-full h-12 w-12 p-0 bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-[rgba(50,14,59,0.4)] dark:border-white/20"
          aria-label="Next"
          disabled={isSubmitting || authLoading || !isValid}
        >
          {isSubmitting || authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
        </Button>
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
                                        const Icon = option.Icon;
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
                                                        border: isChecked ? '3px solid #C19A6B' : '1px solid rgba(193,154,107,0.18)',
                                                        boxShadow: isChecked ? liftShadow : 'none',
                                                    }}
                                                >
                                                    <div className="aspect-square" style={{ background: option.grad }}>
                                                        <Icon ink={ink} shadow={shadow} />
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
