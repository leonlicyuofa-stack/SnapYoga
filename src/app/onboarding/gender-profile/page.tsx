
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
import { ArrowRight, ArrowLeft, CalendarIcon, MoveUpRight, Loader2, UserCircle, Mail, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FemaleAvatar } from '@/components/icons/FemaleAvatar';
import { MaleAvatar } from '@/components/icons/MaleAvatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const profileSchema = z.object({
  gender: z.string().min(1, { message: "Please select a gender" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  age: z.string().refine(val => !isNaN(parseInt(val, 10)), {
      message: "Age is required"
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ageOptions = Array.from({ length: 83 }, (_, i) => (i + 18).toString()); // Ages 18 to 100

export default function GenderProfilePage() {
  const { user, loading: authLoading, signUpWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema)
  });

  const selectedGender = watch('gender');
  const ageValue = watch('age');


  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      // Since this is the sign-up-with-email flow, we create the user here.
      // The useAuth hook will handle navigation on successful user creation.
      await signUpWithEmail(data.email, data.password, {
          gender: data.gender,
          displayName: data.username,
          age: parseInt(data.age, 10),
      });
      // The router push will happen from the AuthContext after user is created.
    } catch (error) {
      console.error("Error during sign up from profile page:", error);
      // The toast is already handled in the AuthContext, so we don't need to show another one here.
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
                      name="age"
                      control={control}
                      render={({ field }) => (
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                             <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full bg-transparent border-0 border-b-2 rounded-none px-0 pl-10 focus:ring-0 focus-visible:ring-offset-0 focus:border-primary">
                                  <SelectValue placeholder="Your age" />
                              </SelectTrigger>
                              <SelectContent>
                                  <ScrollArea className="h-72">
                                      {ageOptions.map(age => (
                                          <SelectItem key={age} value={age}>{age}</SelectItem>
                                      ))}
                                  </ScrollArea>
                              </SelectContent>
                          </Select>
                          </div>
                      )}
                  />
                  {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
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
