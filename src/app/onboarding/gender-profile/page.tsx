
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, ArrowRight, ArrowLeft, CalendarIcon, MoveUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FemaleAvatar } from '@/components/icons/FemaleAvatar';
import { MaleAvatar } from '@/components/icons/MaleAvatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';

const profileSchema = z.object({
  gender: z.string().min(1, { message: "Please select a gender" }),
  nickname: z.string().min(2, { message: "Nickname must be at least 2 characters" }),
  age: z.string().refine(val => !isNaN(parseInt(val, 10)), {
      message: "Age is required"
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ageOptions = Array.from({ length: 83 }, (_, i) => (i + 18).toString()); // Ages 18 to 100

export default function GenderProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
     defaultValues: {
      nickname: "",
    },
  });

  const selectedGender = watch('gender');
  const ageValue = watch('age');


  if (authLoading) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user && !authLoading) {
    router.replace('/auth/signin');
    return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting to sign in...</p></div></AppShell>;
  }

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) {
      toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // We are using 'nickname' for the 'displayName' field in Firestore
      await createUserProfileDocument(user, { 
          gender: data.gender,
          displayName: data.nickname,
          age: parseInt(data.age, 10),
      });
      router.push('/onboarding/yoga-goal');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-5rem)] items-center justify-center p-4 overflow-hidden">
        
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
            <OnboardingHeader />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full mt-[-2rem]">
              <div className="flex justify-around items-center pt-8">
                  <div 
                    className={cn(
                        "cursor-pointer p-4 rounded-2xl transition-all w-48 h-auto flex flex-col items-center justify-center space-y-2 bg-card/20",
                        selectedGender === 'female' ? 'bg-white/50' : ''
                    )}
                    onClick={() => setValue('gender', 'female', { shouldValidate: true })}
                  >
                    <FemaleAvatar className="w-32 h-32"/>
                    
                  </div>
                   <div 
                    className={cn(
                        "cursor-pointer p-4 rounded-2xl transition-all w-48 h-auto flex flex-col items-center justify-center space-y-2 bg-card/20",
                        selectedGender === 'male' ? 'bg-white/50' : ''
                    )}
                    onClick={() => setValue('gender', 'male', { shouldValidate: true })}
                  >
                    <MaleAvatar className="w-32 h-32"/>
                    
                  </div>
              </div>
              
              <div className="space-y-6 p-4 rounded-2xl -mt-4">
                <div className="flex justify-between items-start">
                    <div>
                        <Label htmlFor="nickname" className="font-semibold text-base">Nickname</Label>
                        <p className="text-xs italic text-muted-foreground mt-2">required</p>
                    </div>
                    <Input
                        id="nickname"
                        {...register("nickname")}
                        className="w-1/2 text-right border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        placeholder="e.g. Chahua"
                    />
                </div>

                 <div className="flex justify-between items-start w-full">
                    <div>
                        <Label className="font-semibold text-base">Age</Label>
                        <p className="text-xs italic text-muted-foreground mt-2">required</p>
                    </div>
                    <Controller
                        name="age"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-1/2 justify-end text-right font-normal border-0 rounded-none bg-transparent hover:bg-card/20 focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select age" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-72">
                                        {ageOptions.map(age => (
                                            <SelectItem key={age} value={age}>{age}</SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  type="submit"
                  className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </div>
            </form>
        </div>
      </div>
    </AppShell>
  );
}
