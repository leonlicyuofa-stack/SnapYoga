
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
import { OnboardingBackground } from '@/components/layout/OnboardingBackground';

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
    <div className="relative flex flex-col min-h-screen items-center justify-center p-4 overflow-hidden text-center">
      <div className="relative flex flex-col items-center justify-center p-4 overflow-hidden text-center w-full max-w-sm mx-auto">
        <OnboardingBackground />
        <OnboardingHeader />
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 mt-6">
            
            <div className="space-y-2">
                 <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                          id="username"
                          type="text" 
                          placeholder="Username" 
                          {...register("username")}
                          className="bg-background/80 backdrop-blur-sm border-border/50 rounded-full h-12 pl-12 shadow-inner"
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
                          className="bg-background/80 backdrop-blur-sm border-border/50 rounded-full h-12 pl-12 shadow-inner"
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
                        className="bg-background/80 backdrop-blur-sm border-border/50 rounded-full h-12 pl-12 pr-12 shadow-inner" 
                        placeholder="Password"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                </div>
                 {errors.password && <p className="text-sm text-destructive text-left mt-1 pl-4">{errors.password.message}</p>}
            </div>

            <div className="px-8">
              <Button type="submit" className="w-full h-12 text-base rounded-full mt-8" disabled={isLoading || !isValid}>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign Up'}
              </Button>
            </div>

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
    </div>
  );
}
