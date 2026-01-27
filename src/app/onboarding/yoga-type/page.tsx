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
import { ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const interestedPosesSchema = z.object({
  interestedPoses: z.array(z.string()).min(1, { message: "Please select at least one category" }),
});

type InterestedPosesFormValues = z.infer<typeof interestedPosesSchema>;

const poseCategoryOptions = [
  {
    id: "standing",
    label: "Standing Poses",
    description: "Build strength, stability, and balance; energize the body.",
  },
  {
    id: "seated",
    label: "Seated Poses",
    description: "Promote flexibility in hips and spine; encourage calm.",
  },
  {
    id: "backbends",
    label: "Backbends",
    description: "Strengthen the back, open the chest and shoulders, boost energy.",
  },
  {
    id: "inversions-balancing",
    label: "Inversions & Balancing",
    description: "Improve circulation, build core strength, enhance focus.",
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
            <div className="w-full max-w-2xl">
                 <Button
                    onClick={handleBackNavigation}
                    variant="ghost"
                    className="mb-4 rounded-full h-12 w-12 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
                    <header className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Pose Interests</h1>
                        <p className="text-sm text-white/80">What poses excite you?</p>
                    </header>

                    <main>
                        <form id="yoga-type-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                          <Controller
                            name="interestedPoses"
                            control={control}
                            render={({ field }) => (
                              <div className="grid grid-cols-2 gap-4">
                                {poseCategoryOptions.map((item) => {
                                  const isChecked = field.value?.includes(item.id);
                                  return (
                                    <div key={item.id} className="relative">
                                      <Checkbox
                                        id={item.id}
                                        className="sr-only"
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          const updatedValue = checked
                                            ? [...currentValue, item.id]
                                            : currentValue.filter((value) => value !== item.id);
                                          field.onChange(updatedValue);
                                        }}
                                      />
                                      <Label
                                        htmlFor={item.id}
                                        className={cn(
                                          "flex flex-col justify-center p-4 border-2 rounded-lg cursor-pointer transition-all h-full min-h-[160px] bg-white/10",
                                          "hover:border-white/50",
                                          isChecked ? "border-white bg-white/20" : "border-white/20"
                                        )}
                                      >
                                        <div>
                                           <h3 className="font-bold text-lg text-white">{item.label}</h3>
                                           <p className="text-sm text-white/80 mt-1">{item.description}</p>
                                        </div>
                                        {isChecked && (
                                            <div className="absolute top-3 right-3 h-6 w-6 bg-white text-black rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4" />
                                            </div>
                                        )}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          />

                          {errors.interestedPoses && <p className="text-sm text-red-400 text-center">{errors.interestedPoses.message}</p>}
                          <Button type="submit" form="yoga-type-form" className="w-full h-12 text-base rounded-full mt-8 bg-white/90 text-black hover:bg-white" disabled={isSubmitting || authLoading || !isValid}>
                              {isSubmitting || authLoading ? <Loader2 className="animate-spin" /> : <>Next <ArrowRight className="ml-2" /></>}
                          </Button>
                        </form>
                        <p className="text-xs text-white/60 text-center w-full mt-6">
                          This helps us recommend suitable poses and challenges.
                        </p>
                    </main>
                </div>
            </div>
        </div>
    </div>
  );
}
