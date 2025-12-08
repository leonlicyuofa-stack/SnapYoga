
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Mail, User, KeyRound, EyeOff, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppShell } from '@/components/layout/app-shell';
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

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms & Conditions" }),
  }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, signUpWithEmail, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors, touchedFields }, watch } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
  });

  const nameValue = watch("name");
  const emailValue = watch("email");
  const passwordValue = watch("password");

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
        const userCredential = await signUpWithEmail(data.email, data.password, { name: data.name });
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
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-5rem)] items-center justify-center p-4 overflow-hidden text-center w-full max-w-sm mx-auto">
        <OnboardingHeader />
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8 mt-6">
            
            <p className="text-xs text-muted-foreground pb-4">
                Fill your information below or register with your social account.
            </p>
            
            <div className="form-group">
                <Input id="name" type="text" {...register("name")} className="form-input peer" placeholder=" " />
                <Label htmlFor="name" className={cn("form-label", errors.name && 'text-destructive')}>Name</Label>
                {errors.name && <p className="text-sm text-destructive text-left mt-1">{errors.name.message}</p>}
            </div>

            <div className="form-group">
                <Input id="email" type="email" {...register("email")} className="form-input peer" placeholder=" " />
                <Label htmlFor="email" className={cn("form-label", errors.email && 'text-destructive')}>Email</Label>
                {errors.email && <p className="text-sm text-destructive text-left mt-1">{errors.email.message}</p>}
            </div>
            
            <div className="form-group">
                <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="form-input peer" placeholder=" "/>
                    <Label htmlFor="password" className={cn("form-label", errors.password && 'text-destructive')}>Password</Label>
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
                 {errors.password && <p className="text-sm text-destructive text-left mt-1">{errors.password.message}</p>}
            </div>


            <div className="flex items-center space-x-2">
                <Checkbox id="terms" {...register("agreeToTerms")} />
                <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                    Agree with <Link href="#" className="underline font-medium text-primary">Terms & Condition</Link>
                </Label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-destructive text-left">{errors.agreeToTerms.message}</p>}


            <Button type="submit" className="w-full h-12 text-base rounded-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign Up'}
            </Button>

        </form>
        
        <div className="relative my-6 w-full">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
            </div>
        </div>

        <div className="flex justify-center gap-6 my-4">
            <Button variant="outline" size="icon" onClick={signInWithApple} disabled={authLoading} className="w-14 h-14 rounded-full border-2">
                <AppleIcon className="h-6 w-6" />
                 <span className="sr-only">Sign in with Apple</span>
            </Button>
            <Button variant="outline" size="icon" onClick={signInWithGoogle} disabled={authLoading} className="w-14 h-14 rounded-full border-2">
                <GoogleIcon className="h-6 w-6" />
                <span className="sr-only">Sign in with Google</span>
            </Button>
            {/* Facebook Icon Placeholder */}
            <Button variant="outline" size="icon" disabled className="w-14 h-14 rounded-full border-2">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                <span className="sr-only">Sign in with Facebook</span>
            </Button>
             <Button variant="outline" size="icon" disabled className="w-14 h-14 rounded-full border-2">
                <TikTokIcon className="h-6 w-6" />
                <span className="sr-only">Sign in with TikTok</span>
            </Button>
        </div>


        <p className="text-sm text-muted-foreground mt-8">
            {t('authAlreadyHaveAccount')}{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                {t('signIn')}
            </Link>
        </p>
      </div>
    </AppShell>
  );
}
