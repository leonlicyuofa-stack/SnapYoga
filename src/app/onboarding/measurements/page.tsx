
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Ruler, Scale, ArrowRight, ArrowLeft, MoveUpRight, Loader2 } from 'lucide-react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

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
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MeasurementsFormValues>({
    resolver: zodResolver(measurementsSchema),
    defaultValues: {
      heightUnit: 'cm',
      weightUnit: 'kg',
    }
  });

  const heightUnit = watch('heightUnit');
  const weightUnit = watch('weightUnit');

  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><SmileyRockLoader /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
     return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
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
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 500); 
  };

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Ruler className="mx-auto h-10 w-10 text-primary mb-2" />
            <Scale className="mx-auto h-10 w-10 text-primary mb-4" />
            <h1 className="text-3xl font-bold">Your Measurements</h1>
            <p className="text-muted-foreground mt-2">Provide your height and weight (optional).</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Height */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="height">Height ({heightUnit})</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="heightUnitCm" className="text-sm">cm</Label>
                  <Switch
                    id="heightUnitSwitch"
                    checked={heightUnit === 'in'}
                    onCheckedChange={(checked) => setValue('heightUnit', checked ? 'in' : 'cm')}
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
              />
              {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
            </div>

            {/* Weight */}
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                <Label htmlFor="weight">Weight ({weightUnit})</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="weightUnitKg" className="text-sm">kg</Label>
                  <Switch
                    id="weightUnitSwitch"
                    checked={weightUnit === 'lbs'}
                    onCheckedChange={(checked) => setValue('weightUnit', checked ? 'lbs' : 'kg')}
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
              />
              {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackNavigation} 
                className="w-full sm:w-auto flex-grow"
                isLoadingWithBar={isNavigatingBack}
                loadingBarDirection="rtl"
                disabled={isSubmitting || isNavigatingBack}
              >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
              </Button>
              <Button 
                type="submit" 
                className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40" 
                disabled={isSubmitting || authLoading || isNavigatingBack}
              >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
              </Button>
            </div>
          </form>

          <p className="text-xs text-muted-foreground text-center w-full mt-6">
            This data helps in providing more relevant suggestions if you choose to share it.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
