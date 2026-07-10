"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { Mail, User, KeyRound, EyeOff, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';

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
            router.push('/auth/verify-email');
        }
    } catch(error) {
        // Error is handled in the context with a toast, so we don't need to show another one here.
        console.error("Sign up failed:", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const isLoading = authLoading || isSubmitting;
  
  const handleBackNavigation = () => {
    router.back();
  };

  return (
    <div className="relative min-h-screen">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-sm space-y-7">
                <OnboardingHeader />

                <main className="sy-card backdrop-blur-lg rounded-2xl p-6 space-y-6">
                     <div className="text-center">
                       <h1 className="sy-card-heading" style={{ fontSize: 18, margin: 0 }}>Create account</h1>
                       <p className="sy-subtitle" style={{ fontSize: 12, letterSpacing: '0.04em', margin: '3px 0 0' }}>{"Let's get started on your journey."}</p>
                     </div>
                     <div className="flex justify-center gap-4">
                        <Button variant="outline" size="icon" onClick={signInWithApple} disabled={authLoading} className="sy-option w-14 h-14 rounded-full hover:opacity-80">
                            <AppleIcon className="h-6 w-6" />
                             <span className="sr-only">Sign up with Apple</span>
                        </Button>
                        <Button variant="outline" size="icon" onClick={signInWithGoogle} disabled={authLoading} className="sy-option w-14 h-14 rounded-full hover:opacity-80">
                            <GoogleIcon className="h-6 w-6" />
                            <span className="sr-only">Sign up with Google</span>
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
                        <span className="sy-tagline" style={{ whiteSpace: 'nowrap' }}>or sign up with email</span>
                        <div className="flex-1 sy-divider" style={{ width: 'auto' }} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                        <div className="space-y-2">
                             <div className="relative">
                                  <User className="sy-accent absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                                  <Input
                                      id="username"
                                      type="text"
                                      placeholder="username"
                                      {...register("username")}
                                      className="sy-input rounded-lg h-12 pl-12 text-base"
                                  />
                             </div>
                            {errors.username && <p className="text-sm text-red-400 text-left mt-1 pl-4">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-2">
                             <div className="relative">
                                  <Mail className="sy-accent absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                                  <Input
                                      id="email"
                                      type="email"
                                      placeholder="email"
                                      {...register("email")}
                                      className="sy-input rounded-lg h-12 pl-12 text-base"
                                  />
                             </div>
                            {errors.email && <p className="text-sm text-red-400 text-left mt-1 pl-4">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <KeyRound className="sy-accent absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className="sy-input rounded-lg h-12 pl-12 pr-12 text-base"
                                    placeholder="password"
                                />
                                <Button type="button" variant="ghost" size="icon" className="sy-accent absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-white/10" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                             {errors.password && <p className="text-sm text-red-400 text-left mt-1 pl-4">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-end mt-8">
                          <Button
                            type="submit"
                            variant="ghost"
                            aria-label="Sign up"
                            disabled={isLoading || !isValid}
                            className="rounded-full h-12 w-12 p-0 bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-[rgba(50,14,59,0.4)] dark:border-white/20"
                          >
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
                          </Button>
                        </div>
                    </form>
                </main>
                <footer className="text-center">
                    <p className="sy-subtitle" style={{ fontSize: 13 }}>
                        {t('authAlreadyHaveAccount')}{' '}
                        <Link href="/auth/signin" className="sy-accent font-medium hover:underline">
                            {t('signIn')}
                        </Link>
                    </p>
                </footer>
            </div>
        </div>
    </div>
  );
}
