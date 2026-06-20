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
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { OnboardingScaffold } from '@/components/onboarding/onboarding-scaffold';
import placeholderImages from '@/lib/placeholder-images.json';

const interestedPosesSchema = z.object({
  interestedPoses: z.array(z.string()).min(1, { message: "Please select at least one category" }),
});

type InterestedPosesFormValues = z.infer<typeof interestedPosesSchema>;

const poseCategoryOptions = [
  {
    id: "standing",
    label: "Standing Poses",
    image: placeholderImages.onboardingPoseTypeImages.standing
  },
  {
    id: "seated",
    label: "Seated Poses",
    image: placeholderImages.onboardingPoseTypeImages.seated
  },
  {
    id: "backbends",
    label: "Backbends",
    image: placeholderImages.onboardingPoseTypeImages.backbends
  },
  {
    id: "inversions-balancing",
    label: "Inversions & Balancing",
    image: placeholderImages.onboardingPoseTypeImages.inversions
  }
];


export default function InterestedPosesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      onBack={handleBackNavigation}
      next={
        <Button
          type="submit"
          form="yoga-type-form"
          variant="ghost"
          className="rounded-full h-14 w-14 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20"
          aria-label="Next"
          disabled={isSubmitting || authLoading || !isValid}
        >
          {isSubmitting || authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-7 w-7" />}
        </Button>
      }
    >
                    <main>
                        <form id="yoga-type-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                          <Controller
                                name="interestedPoses"
                                control={control}
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4">
                                    {poseCategoryOptions.map((option) => {
                                        const isChecked = field.value?.includes(option.id);
                                        return (
                                            <div key={option.id} className="relative group">
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
                                                    className={cn(
                                                        "block cursor-pointer overflow-hidden rounded-2xl relative transition-all duration-300 aspect-square",
                                                        isChecked ? 'ring-2 ring-offset-2 ring-offset-transparent ring-[rgba(193,154,107,0.75)]' : 'ring-0'
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
                                                    <h3 className="sy-option-label absolute bottom-4 left-4 text-lg drop-shadow-sm" style={{ color: 'rgba(255,240,215,0.95)' }}>{option.label}</h3>
                                                    {isChecked && (
                                                        <div className="absolute top-3 right-3 h-6 w-6 bg-[rgba(193,154,107,0.95)] backdrop-blur-sm text-black rounded-full flex items-center justify-center shadow-lg">
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

                          {errors.interestedPoses && <p className="text-sm text-red-400 text-center">{errors.interestedPoses.message}</p>}
                        </form>
                        <p className="sy-body text-xs text-center w-full mt-6">
                          This helps us recommend suitable poses and challenges.
                        </p>
                    </main>
    </OnboardingScaffold>
  );
}
