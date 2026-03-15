"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

const measurementsSchema = z.object({
  height: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Height must be a number" }).positive({ message: "Height must be positive" }).optional()
  ),
  heightUnit: z.enum(['cm', 'in']).default('cm'),
  weight: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Weight must be a number" }).positive({ message: "Weight must be positive" }).optional()
  ),
  weightUnit: z.enum(['kg', 'lbs']).default('kg'),
});

type MeasurementsFormValues = z.infer<typeof measurementsSchema>;

export default function MeasurementsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MeasurementsFormValues>({
    resolver: zodResolver(measurementsSchema),
    defaultValues: {
      heightUnit: 'cm',
      weightUnit: 'kg',
    }
  });

  const heightUnit = watch('heightUnit');
  const weightUnit = watch('weightUnit');

  if (authLoading && !user) {
    router.replace('/auth/signin');
     return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin"/></div>;
  }

  const onSubmit: SubmitHandler<MeasurementsFormValues> = async (data) => {
     if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const profileData: any = {};
      if (data.height) profileData.height = data.height;
      profileData.heightUnit = data.heightUnit;
      if (data.weight) profileData.weight = data.weight;
      profileData.weightUnit = data.weightUnit;
      
      await createUserProfileDocument(user, profileData);
      router.push('/onboarding/yoga-type');
    } catch (error) {
      console.error("Error saving measurements:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your measurements. Please try again.",
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
            <div className="w-full max-w-md relative">
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
                        <h1 className="text-3xl font-bold">Your Measurements</h1>
                        <p className="text-white/80 mt-2">Provide your height and weight (optional).</p>
                    </header>

                    <main>
                        <form id="measurements-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label htmlFor="height">Height ({heightUnit})</Label>
                                <div className="flex items-center space-x-2">
                                  <Label htmlFor="heightUnitCm" className="text-sm">cm</Label>
                                  <Switch
                                    id="heightUnitSwitch"
                                    checked={heightUnit === 'in'}
                                    onCheckedChange={(checked) => setValue('heightUnit', checked ? 'in' : 'cm')}
                                    className="data-[state=checked]:bg-white/80 data-[state=unchecked]:bg-white/30"
                                  />
                                  <Label htmlFor="heightUnitIn" className="text-sm">inches</Label>
                                </div>
                              </div>
                              <Input
                                id="height"
                                type="number"
                                step="any"
                                placeholder={heightUnit === 'cm' ? "e.g., 170" : "e.g., 67"}
                                {...register("height")}
                                className="bg-white/10 border-white/20 rounded-lg h-12 text-base text-white placeholder:text-white/50 focus:bg-white/20"
                              />
                              {errors.height && <p className="text-sm text-red-400">{errors.height.message}</p>}
                            </div>

                            <div className="space-y-2">
                               <div className="flex justify-between items-center">
                                <Label htmlFor="weight">Weight ({weightUnit})</Label>
                                <div className="flex items-center space-x-2">
                                  <Label htmlFor="weightUnitKg" className="text-sm">kg</Label>
                                  <Switch
                                    id="weightUnitSwitch"
                                    checked={weightUnit === 'lbs'}
                                    onCheckedChange={(checked) => setValue('weightUnit', checked ? 'lbs' : 'kg')}
                                    className="data-[state=checked]:bg-white/80 data-[state=unchecked]:bg-white/30"
                                  />
                                  <Label htmlFor="weightUnitLbs" className="text-sm">lbs</Label>
                                </div>
                              </div>
                              <Input
                                id="weight"
                                type="number"
                                step="any"
                                placeholder={weightUnit === 'kg' ? "e.g., 65" : "e.g., 143"}
                                {...register("weight")}
                                 className="bg-white/10 border-white/20 rounded-lg h-12 text-base text-white placeholder:text-white/50 focus:bg-white/20"
                              />
                              {errors.weight && <p className="text-sm text-red-400">{errors.weight.message}</p>}
                            </div>
                        </form>
                        <p className="text-xs text-white/60 text-center w-full mt-6">
                            This data helps in providing more relevant suggestions.
                        </p>
                    </main>
                </div>
                 <Button
                    type="submit"
                    form="measurements-form"
                    variant="ghost"
                    className="absolute bottom-4 right-4 rounded-full h-14 w-14 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
                    aria-label="Next"
                    disabled={isSubmitting || authLoading}
                >
                    {isSubmitting || authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-7 w-7" />}
                </Button>
            </div>
        </div>
    </div>
  );
}
