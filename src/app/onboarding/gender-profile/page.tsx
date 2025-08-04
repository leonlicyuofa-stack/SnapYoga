
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
import { Loader2, ArrowRight, X, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FemaleAvatar } from '@/components/icons/FemaleAvatar';
import { MaleAvatar } from '@/components/icons/MaleAvatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInYears } from 'date-fns';

const profileSchema = z.object({
  gender: z.string().min(1, { message: "Please select a gender" }),
  nickname: z.string().min(2, { message: "Nickname must be at least 2 characters" }),
  birthday: z.date({
    required_error: "A date of birth is required.",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function GenderProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [age, setAge] = useState<number | null>(null);

  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
     defaultValues: {
      nickname: "",
    },
  });

  const selectedGender = watch('gender');
  const birthdayValue = watch('birthday');

  useEffect(() => {
    if (birthdayValue) {
      try {
        const calculatedAge = differenceInYears(new Date(), birthdayValue);
        setAge(calculatedAge);
      } catch (error) {
        setAge(null); // Reset if date is invalid
      }
    } else {
      setAge(null);
    }
  }, [birthdayValue]);


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
          birthday: data.birthday.toISOString().split('T')[0], // Store as YYYY-MM-DD string
      });
      router.push('/onboarding/affirmation');
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
      <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center p-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 bg-splash-background">
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                    <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
                <path d="M 0,0 L 100,0 C 50,50 100,50 100,100 L 0,100 Z" fill="hsl(var(--splash-blob-1))" />
                <path d="M 0,100 C 50,50 0,50 0,0" fill="hsl(var(--splash-background))" />
                <path d="M 100,0 L 0,0 C 50,50 0,50 0,100 L 100,100 Z" fill="hsl(var(--splash-blob-2))" style={{ opacity: 0.5 }}/>
            </svg>
        </div>
        
        <Card className="relative z-10 w-full max-w-sm shadow-xl rounded-3xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
             <div className="flex justify-start mb-6">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <CardTitle className="text-2xl font-bold">Who are you?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex justify-around items-center">
                  <div 
                    className={cn(
                        "cursor-pointer p-4 border-2 rounded-2xl transition-all w-32 h-32 flex flex-col items-center justify-center space-y-2",
                        selectedGender === 'female' ? 'border-transparent bg-pink-50' : 'border-transparent'
                    )}
                    onClick={() => setValue('gender', 'female', { shouldValidate: true })}
                  >
                    <span className={cn("font-semibold", selectedGender === 'female' ? 'text-pink-500' : 'text-muted-foreground')}>Female</span>
                    <FemaleAvatar className="w-16 h-16"/>
                  </div>
                   <div 
                    className={cn(
                        "cursor-pointer p-4 border-2 rounded-2xl transition-all w-32 h-32 flex flex-col items-center justify-center space-y-2",
                        selectedGender === 'male' ? 'border-transparent bg-blue-50' : 'border-transparent'
                    )}
                    onClick={() => setValue('gender', 'male', { shouldValidate: true })}
                  >
                    <span className={cn("font-semibold", selectedGender === 'male' ? 'text-blue-500' : 'text-muted-foreground')}>Male</span>
                    <MaleAvatar className="w-16 h-16"/>
                  </div>
              </div>
              {errors.gender && <p className="text-sm text-destructive text-center -mt-4">{errors.gender.message}</p>}

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Label htmlFor="nickname" className="font-semibold text-base">Nickname</Label>
                    <Input
                        id="nickname"
                        {...register("nickname")}
                        className="w-1/2 text-right border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary"
                        placeholder="e.g. Chahua"
                    />
                </div>
                 {errors.nickname && <p className="text-sm text-destructive text-right -mt-4">{errors.nickname.message}</p>}

                 <div className="flex justify-between items-start flex-col">
                    <div className="flex justify-between items-center w-full">
                        <Label className="font-semibold text-base">Birthday</Label>
                         <Controller
                            name="birthday"
                            control={control}
                            render={({ field }) => (
                               <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-1/2 justify-end text-right font-normal border-0 border-b-2 rounded-none",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "dd/MM/yyyy")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    captionLayout="dropdown-buttons"
                                    fromYear={new Date().getFullYear() - 100}
                                    toYear={new Date().getFullYear()}
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                            )}
                            />
                    </div>
                    <div className="w-full text-right">
                        {errors.birthday && <p className="text-sm text-destructive -mt-4">{errors.birthday.message}</p>}
                        {age !== null && !errors.birthday && (
                          <p className="text-xs text-muted-foreground mt-1">Age: {age}</p>
                        )}
                    </div>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="default"
                className="w-full rounded-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground" 
                disabled={isSubmitting || authLoading}
              >
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Next'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
