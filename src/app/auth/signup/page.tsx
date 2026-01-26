"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Mail, User, KeyRound, EyeOff, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import Image from 'next/image';

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
    <div className="relative min-h-screen font-serif text-white bg-home-dark-bg">
        {/* Background Image */}
        <Image
            src="https://picsum.photos/seed/yogawellness/1920/1080"
            alt="A tranquil, modern space for practicing yoga."
            fill
            className="object-cover"
            data-ai-hint="modern wellness room"
            priority
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay for contrast */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-6">
                <header className="text-center">
                    <div className="mx-auto mb-4 inline-block">
                        <SnapYogaLogo />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                    <p className="text-sm text-white/80">Let's get started on your journey.</p>
                </header>
                
                <main className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                        <div className="space-y-2">
                             <div className="relative">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                  <Input 
                                      id="username"
                                      type="text" 
                                      placeholder="Username" 
                                      {...register("username")}
                                      className="bg-white/10 border-white/20 rounded-lg h-12 pl-12 text-base text-white placeholder:text-white/50 focus:bg-white/20"
                                  />
                             </div>
                            {errors.username && <p className="text-sm text-red-400 text-left mt-1 pl-4">{errors.username.message}</p>}
                        </div>

                        <div className="space-y-2">
                             <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                  <Input 
                                      id="email" 
                                      type="email" 
                                      placeholder="Email" 
                                      {...register("email")}
                                      className="bg-white/10 border-white/20 rounded-lg h-12 pl-12 text-base text-white placeholder:text-white/50 focus:bg-white/20"
                                  />
                             </div>
                            {errors.email && <p className="text-sm text-red-400 text-left mt-1 pl-4">{errors.email.message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    {...register("password")} 
                                    className="bg-white/10 border-white/20 rounded-lg h-12 pl-12 pr-12 text-base text-white placeholder:text-white/50 focus:bg-white/20"
                                    placeholder="Password"
                                />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white/50 hover:bg-white/20 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                             {errors.password && <p className="text-sm text-red-400 text-left mt-1 pl-4">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" className="w-full h-12 text-base rounded-lg mt-8 bg-white/90 text-black hover:bg-white" disabled={isLoading || !isValid}>
                              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign Up'}
                        </Button>
                    </form>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/20 px-2 text-white/80">Or sign up with</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button variant="outline" size="icon" onClick={signInWithApple} disabled={authLoading} className="w-14 h-14 rounded-full bg-white/10 border-white/20 hover:bg-white/20">
                            <AppleIcon className="h-6 w-6" />
                             <span className="sr-only">Sign in with Apple</span>
                        </Button>
                        <Button variant="outline" size="icon" onClick={signInWithGoogle} disabled={authLoading} className="w-14 h-14 rounded-full bg-white/10 border-white/20 hover:bg-white/20">
                            <GoogleIcon className="h-6 w-6" />
                            <span className="sr-only">Sign in with Google</span>
                        </Button>
                    </div>
                </main>
                <footer className="text-center">
                    <p className="text-sm text-white/80">
                        {t('authAlreadyHaveAccount')}{' '}
                        <Link href="/auth/signin" className="font-medium text-white hover:underline">
                            {t('signIn')}
                        </Link>
                    </p>
                </footer>
            </div>
        </div>
    </div>
  );
}
