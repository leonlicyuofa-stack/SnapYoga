"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';
import { OnboardingScaffold } from '@/components/onboarding/onboarding-scaffold';
import { GlossyButton } from '@/components/ui/glossy-button';

const interestedPosesSchema = z.object({
  interestedPoses: z.array(z.string()).min(1, { message: "Please select at least one category" }),
});

type InterestedPosesFormValues = z.infer<typeof interestedPosesSchema>;

// Pose-interest cards — an illustration on the art panel + caption below, matching
// the "Pick your path" (yoga goals) cards.
const poseCategoryOptions = [
  { id: "dynamic-flow",         label: "Dynamic Flow",           line: "Move with your breath",  image: "/images/dynamic_flow.png" },
  { id: "structural-alignment", label: "Structural Alignment",   line: "Build precise control",  image: "/images/structural_alignment.png" },
  { id: "inversions-balancing", label: "Inversions & Balancing", line: "Find strength and lift", image: "/images/arm_balancing.png" },
  { id: "backbend",             label: "Backbend",               line: "Open with confidence",   image: "/images/backbend_alignment.png" },
];


export default function InterestedPosesPage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Illustrations read the same in both themes; only the caption panel — which
  // sits on the app ground — flips with the theme.
  const capBg      = isDark ? 'rgba(255,240,215,0.06)' : 'rgba(42,21,51,0.05)';
  const capName    = isDark ? 'rgba(255,240,215,0.95)' : 'rgba(42,21,51,0.95)';
  const capSub     = isDark ? 'rgba(255,240,215,0.5)'  : 'rgba(42,21,51,0.55)';
  // Selected cue: accent border + soft accent ring + lift — amethyst in light, gold in dark.
  const selBorder  = isDark ? '#C19A6B' : '#320E3B';
  const selShadow  = isDark
    ? '0 0 0 4px rgba(193,154,107,0.22), 0 14px 30px rgba(0,0,0,0.5)'
    : '0 0 0 4px rgba(50,14,59,0.16), 0 14px 30px rgba(50,30,60,0.30)';

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<InterestedPosesFormValues>({
    resolver: zodResolver(interestedPosesSchema),
    mode: 'onChange',
    defaultValues: {
      interestedPoses: [],
    }
  });

  if (authLoading && !user) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  const onSubmit: SubmitHandler<InterestedPosesFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, { interestedPoses: data.interestedPoses });
      router.push('/onboarding/profile-summary');
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

  const handleBackNavigation = () => {
    router.back();
  };


  return (
    <OnboardingScaffold
      title="Pose interests"
      subtitle="What poses excite you?"
      step={3}
      totalSteps={5}
      onBack={handleBackNavigation}
      next={
        <GlossyButton
          type="submit"
          form="yoga-type-form"
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
        <form id="yoga-type-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <Controller
            name="interestedPoses"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5" style={{ gridAutoRows: '1fr' }}>
                {poseCategoryOptions.map((option) => {
                  const isChecked = field.value?.includes(option.id);
                  return (
                    <div key={option.id} className="relative h-full">
                      <Checkbox
                        id={option.id}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const updatedValue = checked
                            ? [...currentValue, option.id]
                            : currentValue.filter(v => v !== option.id);
                          field.onChange(updatedValue);
                        }}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex flex-col h-full cursor-pointer overflow-hidden transition-all duration-300"
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
                        <div style={{ padding: '14px 13px', background: capBg, flexGrow: 1 }}>
                          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2, margin: 0, color: capName, overflowWrap: 'break-word' }}>{option.label}</p>
                          <p style={{ fontSize: 12, margin: '3px 0 0', color: capSub, overflowWrap: 'break-word' }}>{option.line}</p>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          />

          {errors.interestedPoses && <p className="text-sm text-red-400 text-center">{errors.interestedPoses.message}</p>}
        </form>
        <p className="sy-body text-xs text-center w-full mt-6">
          This helps us recommend suitable poses and challenges.
        </p>
      </main>
    </OnboardingScaffold>
  );
}
