
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Mail, User, KeyRound, EyeOff, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { cn } from '@/lib/utils';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

const signUpSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, signUpWithEmail, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
        const userCredential = await signUpWithEmail(data.email, data.password, { displayName: data.username });
        if (userCredential) {
            router.push('/onboarding/gender-profile');
        }
    } catch(error) {
        // Error is handled in the context with a toast, so we don't need to show another one here.
        console.error("Sign up failed:", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const isLoading = authLoading || isSubmitting;

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
      <QuadrantBackground />
      <div className="relative z-10 w-full max-w-md bg-card/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 m-4">
        
        <div className="mx-auto mb-4 flex justify-center">
            <SnapYogaLogo />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground mb-2">Create Account</h2>
        <p className="text-center text-sm text-muted-foreground mb-8">Let's get started on your journey.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            
            <div className="space-y-2">
                 <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                          id="username"
                          type="text" 
                          placeholder="Username" 
                          {...register("username")}
                          className="bg-input/80 border-border/50 rounded-lg h-12 pl-12 shadow-inner text-base"
                      />
                 </div>
                {errors.username && <p className="text-sm text-destructive text-left mt-1 pl-4">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
                 <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                          id="email" 
                          type="email" 
                          placeholder="Email" 
                          {...register("email")}
                          className="bg-input/80 border-border/50 rounded-lg h-12 pl-12 shadow-inner text-base"
                      />
                 </div>
                {errors.email && <p className="text-sm text-destructive text-left mt-1 pl-4">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
                <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        {...register("password")} 
                        className="bg-input/80 border-border/50 rounded-lg h-12 pl-12 pr-12 shadow-inner text-base" 
                        placeholder="Password"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
                 {errors.password && <p className="text-sm text-destructive text-left mt-1 pl-4">{errors.password.message}</p>}
            </div>

            <div className="px-8">
              <Button type="submit" className="w-full h-12 text-base rounded-lg mt-8" disabled={isLoading || !isValid}>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign Up'}
              </Button>
            </div>

        </form>
        
        <div className="relative my-6 w-full">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
            </div>
        </div>

        <div className="flex justify-center gap-4 my-4">
            <Button variant="outline" size="icon" onClick={signInWithApple} disabled={authLoading} className="w-14 h-14 rounded-full border-2">
                <AppleIcon className="h-6 w-6" />
                 <span className="sr-only">Sign in with Apple</span>
            </Button>
            <Button variant="outline" size="icon" onClick={signInWithGoogle} disabled={authLoading} className="w-14 h-14 rounded-full border-2">
                <GoogleIcon className="h-6 w-6" />
                <span className="sr-only">Sign in with Google</span>
            </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8 text-center">
            {t('authAlreadyHaveAccount')}{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                {t('signIn')}
            </Link>
        </p>
      </div>
    </div>
  );
}
