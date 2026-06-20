"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { Mail, KeyRound } from 'lucide-react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { useLanguage } from '@/contexts/LanguageContext';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { Checkbox } from '@/components/ui/checkbox';

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  remember: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { signInWithEmail, signInWithGoogle, signInWithApple, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  // Clear inline error when user edits email or password
  const watchedFields = watch(['email', 'password']);
  React.useEffect(() => {
    setAuthError(null);
  }, [watchedFields[0], watchedFields[1]]);

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signInWithEmail(data.email, data.password);
    } catch (error: any) {
      // Show inline error for wrong password / wrong email
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setAuthError('Incorrect email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError('Too many failed attempts. Please try again later or reset your password.');
      } else {
        setAuthError('Sign in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm space-y-7">
          <OnboardingHeader title={t('authWelcomeBack')} subtitle={t('authWelcomeBackDesc')} />
          <main className="space-y-6">
             <div className="flex justify-center gap-4">
                <Button variant="outline" size="icon" onClick={signInWithApple} disabled={isLoading} className="sy-option w-14 h-14 rounded-full hover:opacity-80">
                    <AppleIcon className="h-6 w-6" />
                     <span className="sr-only">Sign in with Apple</span>
                </Button>
                <Button variant="outline" size="icon" onClick={signInWithGoogle} disabled={isLoading} className="sy-option w-14 h-14 rounded-full hover:opacity-80">
                    <GoogleIcon className="h-6 w-6" />
                    <span className="sr-only">Sign in with Google</span>
                </Button>
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled
                    className="sy-option w-14 h-14 rounded-full opacity-40 cursor-not-allowed"
                  >
                    <TikTokIcon className="h-6 w-6" />
                    <span className="sr-only">TikTok login coming soon</span>
                  </Button>
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Coming soon
                  </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 sy-divider" style={{ width: 'auto' }} />
              <span className="sy-tagline" style={{ whiteSpace: 'nowrap' }}>{t('authOrContinueWithEmail')}</span>
              <div className="flex-1 sy-divider" style={{ width: 'auto' }} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="sy-accent absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email"
                    {...register("email")}
                    className="sy-input pl-12 h-12 text-base rounded-lg"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                 <div className="relative">
                  <KeyRound className="sy-accent absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="password"
                    {...register("password")}
                    className="sy-input pl-12 h-12 text-base rounded-lg"
                  />
                </div>
                {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
              </div>
               <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" className="border-[rgba(193,154,107,0.5)] data-[state=checked]:bg-[rgba(193,154,107,0.85)] data-[state=checked]:text-black" {...register("remember")} />
                  <Label htmlFor="remember-me" className="sy-subtitle text-sm font-medium leading-none">Remember me</Label>
                </div>
                <Link href="/auth/forgot-password" title="Go to password recovery" className="sy-accent text-sm font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>

              {authError && (
                <div className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-300 text-center">
                  {authError}
                </div>
              )}

              <Button type="submit" className="sy-cta w-full h-12 text-base rounded-xl" disabled={isLoading}>
                {isLoading ? <SmileyRockLoader /> : t('signIn')}
              </Button>
            </form>
          </main>
          <footer className="text-center">
            <p className="sy-subtitle" style={{ fontSize: 13 }}>
              {t('authNoAccount')}{' '}
              <Link href="/auth/signup" className="sy-accent font-medium hover:underline">
                {t('signUp')}
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
