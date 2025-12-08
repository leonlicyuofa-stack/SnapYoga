
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { ArrowRight, ArrowLeft, CalendarIcon, MoveUpRight, Loader2, UserCircle, Mail, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FemaleAvatar } from '@/components/icons/FemaleAvatar';
import { MaleAvatar } from '@/components/icons/MaleAvatar';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, getDaysInMonth } from 'date-fns';

const profileSchema = z.object({
  gender: z.string().min(1, { message: "Please select a gender" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  birthday: z.date({
    required_error: "A date of birth is required.",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 18 - i);
const months = Array.from({ length: 12 }, (_, i) => i);

const DatePickerColumn = ({ title, values, onSelect, selectedValue }: { title: string; values: (string|number)[], onSelect: (value: any) => void, selectedValue: any }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemHeight = 28; // h-7
    const containerHeight = 160; // h-40

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container && selectedValue !== undefined) {
            const selectedElement = container.querySelector(`[data-value="${selectedValue}"]`) as HTMLElement;
            if (selectedElement) {
                 const scrollTop = selectedElement.offsetTop - (containerHeight / 2) + (itemHeight / 2);
                 container.scrollTop = scrollTop;
            }
        }
    }, [selectedValue, values, containerHeight, itemHeight]);

    const paddingTop = `calc(50% - ${itemHeight / 2}px)`;
    const paddingBottom = `calc(50% - ${itemHeight / 2}px)`;

    return (
        <div className="flex flex-col items-center">
            <div className={cn("text-xs text-muted-foreground mb-2", selectedValue !== undefined && "font-bold text-foreground")}>
                {title}
            </div>
            <div ref={scrollContainerRef} className="h-40 overflow-y-scroll snap-y snap-mandatory no-scrollbar w-full">
                <div className="flex flex-col items-center" style={{paddingTop, paddingBottom}}>
                    {values.map((item, index) => (
                        <div
                            key={index}
                            data-value={item}
                            onClick={() => onSelect(item)}
                            className={cn(
                                "flex items-center justify-center w-full h-7 text-sm snap-center shrink-0 cursor-pointer transition-all duration-200",
                                selectedValue === item
                                    ? "font-bold text-foreground text-base"
                                    : "text-muted-foreground/50"
                            )}
                        >
                            {title === 'Month' ? format(new Date(0, item as number), 'MMM') : item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function GenderProfilePage() {
  const { user, loading: authLoading, signUpWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
        birthday: new Date(new Date().getFullYear() - 25, 0, 1)
    }
  });

  const selectedGender = watch('gender');
  const birthday = watch('birthday');

  const daysInMonth = birthday ? getDaysInMonth(birthday) : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDateChange = (part: 'year' | 'month' | 'day', value: number) => {
    const newDate = new Date(birthday || new Date());
    if (part === 'year') newDate.setFullYear(value);
    if (part === 'month') {
        const currentDay = newDate.getDate();
        newDate.setMonth(value);
        // If the new month has fewer days, adjust the day to the last day of the new month.
        if (newDate.getDate() !== currentDay) {
            newDate.setDate(0); 
        }
    }
    if (part === 'day') newDate.setDate(value);
    
    setValue('birthday', newDate, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const today = new Date();
      const birthDate = new Date(data.birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const userCredential = await signUpWithEmail(data.email, data.password, {
          gender: data.gender,
          displayName: data.username,
          birthday: data.birthday,
          age: age,
      });

      if (userCredential) {
          router.push('/onboarding/yoga-goal');
      }
      
    } catch (error) {
      console.error("Error during sign up from profile page:", error);
      // The signUpWithEmail function already shows a toast on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="relative flex flex-col items-center p-4 overflow-hidden">
        
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
            <div className="relative z-20 w-full">
              <OnboardingHeader />
            </div>
            <Card className="bg-card/80 backdrop-blur-sm w-full p-6 -mt-8 rounded-3xl shadow-xl pt-16">
              <form id="gender-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                <div className="flex justify-around items-center">
                    <div 
                      className={cn(
                          "cursor-pointer p-4 rounded-2xl transition-all w-36 h-auto flex flex-col items-center justify-center space-y-2",
                          selectedGender === 'female' ? 'bg-white/50' : 'bg-card/20'
                      )}
                      onClick={() => setValue('gender', 'female', { shouldValidate: true })}
                    >
                      <FemaleAvatar className="w-24 h-24"/>
                      
                    </div>
                     <div 
                      className={cn(
                          "cursor-pointer p-4 rounded-2xl transition-all w-36 h-auto flex flex-col items-center justify-center space-y-2",
                          selectedGender === 'male' ? 'bg-white/50' : 'bg-card/20'
                      )}
                      onClick={() => setValue('gender', 'male', { shouldValidate: true })}
                    >
                      <MaleAvatar className="w-24 h-24"/>
                      
                    </div>
                </div>
                {errors.gender && <p className="text-sm text-destructive text-center -mt-4">{errors.gender.message}</p>}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                     <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                              id="email" 
                              type="email"
                              placeholder="Email" 
                              {...register("email")}
                              className="bg-background/80 backdrop-blur-sm border-border/50 rounded-full h-12 pl-12 shadow-inner"
                          />
                     </div>
                    {errors.email && <p className="text-sm text-destructive pl-4">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <div className="relative">
                          <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                              id="username" 
                              placeholder="Username" 
                              {...register("username")}
                              className="bg-background/80 backdrop-blur-sm border-border/50 rounded-full h-12 pl-12 shadow-inner"
                          />
                     </div>
                    {errors.username && <p className="text-sm text-destructive pl-4">{errors.username.message}</p>}
                  </div>
                   <div className="space-y-2">
                     <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                              id="password"
                              type="password"
                              placeholder="Password" 
                              {...register("password")}
                              className="bg-background/80 backdrop-blur-sm border-border/50 rounded-full h-12 pl-12 shadow-inner"
                          />
                     </div>
                    {errors.password && <p className="text-sm text-destructive pl-4">{errors.password.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                      <Controller
                          name="birthday"
                          control={control}
                          render={({ field }) => (
                              <Popover>
                                  <PopoverTrigger asChild>
                                      <div className="relative">
                                          <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                          <button
                                              type="button"
                                              className={cn(
                                                  "w-full text-left bg-background/80 backdrop-blur-sm border border-border/50 rounded-full h-12 pl-12 shadow-inner text-base",
                                                  !field.value && "text-muted-foreground"
                                              )}
                                          >
                                              {field.value ? format(field.value, "PPP") : <span>Birthday</span>}
                                          </button>
                                      </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                      <div className="grid grid-cols-3 gap-4 relative h-48 p-2">
                                          <DatePickerColumn title="Day" values={days} onSelect={(day) => handleDateChange('day', day)} selectedValue={field.value?.getDate()} />
                                          <DatePickerColumn title="Month" values={months} onSelect={(month) => handleDateChange('month', month)} selectedValue={field.value?.getMonth()} />
                                          <DatePickerColumn title="Year" values={years} onSelect={(year) => handleDateChange('year', year)} selectedValue={field.value?.getFullYear()} />
                                      </div>
                                  </PopoverContent>
                              </Popover>
                          )}
                      />
                      {errors.birthday && <p className="text-sm text-destructive pl-4">{errors.birthday.message}</p>}
                  </div>
                </div>

              </form>
            </Card>
        </div>
        <Button
            type="submit"
            form="gender-profile-form"
            className="fixed bottom-8 right-8 rounded-full h-16 w-16 p-0 bg-white/30 hover:bg-white/50 text-splash-foreground shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
            aria-label="Next"
            disabled={isSubmitting || authLoading || !isValid}
        >
            {isSubmitting || authLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <MoveUpRight className="h-8 w-8" />}
        </Button>
      </div>
    </AppShell>
  );
}
