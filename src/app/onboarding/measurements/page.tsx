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
import { Ruler, Scale, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';

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
         <Button
            onClick={handleBackNavigation}
            variant="ghost"
            className="absolute top-8 left-8 rounded-full h-12 w-12 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
            aria-label="Go back"
        >
            <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
                <header className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Ruler className="h-10 w-10 text-white/80" />
                        <Scale className="h-10 w-10 text-white/80" />
                    </div>
                    <h1 className="text-3xl font-bold">Your Measurements</h1>
                    <p className="text-white/80 mt-2">Provide your height and weight (optional).</p>
                </header>

                <main>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-base rounded-full mt-8 bg-white/90 text-black hover:bg-white"
                            disabled={isSubmitting || authLoading}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><span>Next</span><ArrowRight className="ml-2 h-5 w-5" /></>}
                        </Button>
                    </form>
                    <p className="text-xs text-white/60 text-center w-full mt-6">
                        This data helps in providing more relevant suggestions.
                    </p>
                </main>
            </div>
        </div>
    </div>
  );
}
