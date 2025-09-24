
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

const DatePickerColumn = ({ values, onSelect, selectedValue }: { values: (string|number)[], onSelect: (value: any) => void, selectedValue: any }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const selectedElement = container.querySelector(`[data-value="${selectedValue}"]`) as HTMLElement;
            if (selectedElement) {
                 const containerHeight = container.clientHeight;
                 const elementHeight = selectedElement.offsetHeight;
                 const scrollTop = selectedElement.offsetTop - (containerHeight / 2) + (elementHeight / 2);
                 container.scrollTop = scrollTop;
            }
        }
    }, [selectedValue]);

    return (
        <div ref={scrollContainerRef} className="h-48 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
            <div className="flex flex-col items-center">
                 {/* Padding elements to center the first and last items */}
                <div className="h-[calc(6rem)] flex-shrink-0"></div>
                {values.map((item, index) => (
                    <div
                        key={index}
                        data-value={item}
                        onClick={() => onSelect(item)}
                        className={cn(
                            "flex items-center justify-center w-full h-10 text-xl snap-center shrink-0 cursor-pointer transition-all duration-200",
                            selectedValue === item
                                ? "font-bold text-foreground text-2xl"
                                : "text-muted-foreground/50"
                        )}
                    >
                        {typeof item === 'number' ? item : format(new Date(0, item), 'MMMM')}
                    </div>
                ))}
                 <div className="h-[calc(6rem)] flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default function GenderProfilePage() {
  const { user, loading: authLoading, signUpWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
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
    if (part === 'month') newDate.setMonth(value);
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

      await signUpWithEmail(data.email, data.password, {
          gender: data.gender,
          displayName: data.username,
          birthday: data.birthday,
          age: age,
      });
    } catch (error) {
      console.error("Error during sign up from profile page:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-5rem)] items-center justify-center p-4 overflow-hidden">
        
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
            <OnboardingHeader />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full mt-[-2rem]">
              <div className="flex justify-around items-center pt-8">
                  <div 
                    className={cn(
                        "cursor-pointer p-4 rounded-2xl transition-all w-48 h-auto flex flex-col items-center justify-center space-y-2",
                        selectedGender === 'female' ? 'bg-white/50' : 'bg-card/20'
                    )}
                    onClick={() => setValue('gender', 'female', { shouldValidate: true })}
                  >
                    <FemaleAvatar className="w-32 h-32"/>
                    
                  </div>
                   <div 
                    className={cn(
                        "cursor-pointer p-4 rounded-2xl transition-all w-48 h-auto flex flex-col items-center justify-center space-y-2",
                        selectedGender === 'male' ? 'bg-white/50' : 'bg-card/20'
                    )}
                    onClick={() => setValue('gender', 'male', { shouldValidate: true })}
                  >
                    <MaleAvatar className="w-32 h-32"/>
                    
                  </div>
              </div>
              {errors.gender && <p className="text-sm text-destructive text-center -mt-4">{errors.gender.message}</p>}
              
              <div className="space-y-6">
                <div className="space-y-2">
                   <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            id="email" 
                            type="email"
                            placeholder="Email" 
                            {...register("email")}
                            className="bg-transparent border-0 border-b-2 rounded-none px-0 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary"
                        />
                   </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                   <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            id="username" 
                            placeholder="Username" 
                            {...register("username")}
                            className="bg-transparent border-0 border-b-2 rounded-none px-0 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary"
                        />
                   </div>
                  {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                </div>
                 <div className="space-y-2">
                   <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            id="password"
                            type="password"
                            placeholder="Password" 
                            {...register("password")}
                            className="bg-transparent border-0 border-b-2 rounded-none px-0 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary"
                        />
                   </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                
                <div className="space-y-2">
                    <Controller
                        name="birthday"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <button
                                            type="button"
                                            className="w-full text-left bg-transparent border-0 border-b-2 border-input rounded-none px-0 pl-10 h-10 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary"
                                        >
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        </button>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <div className="grid grid-cols-3 gap-2 relative h-48 w-80 p-4">
                                        <DatePickerColumn values={months} onSelect={(month) => handleDateChange('month', month)} selectedValue={field.value?.getMonth()} />
                                        <DatePickerColumn values={days} onSelect={(day) => handleDateChange('day', day)} selectedValue={field.value?.getDate()} />
                                        <DatePickerColumn values={years} onSelect={(year) => handleDateChange('year', year)} selectedValue={field.value?.getFullYear()} />
                                        <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 border-y-2 border-foreground/30 pointer-events-none"></div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.birthday && <p className="text-sm text-destructive">{errors.birthday.message}</p>}
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  type="submit"
                  className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting || authLoading ? <Loader2 className="animate-spin" /> : <><span>Next</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </div>
            </form>
        </div>
      </div>
    </AppShell>
  );
}

    

    