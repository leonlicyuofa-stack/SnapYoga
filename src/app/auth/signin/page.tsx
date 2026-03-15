
"use client";

import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { Mail, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { useLanguage } from '@/contexts/LanguageContext';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import Image from 'next/image';
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

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    setIsSubmitting(true);
    await signInWithEmail(data.email, data.password);
    setIsSubmitting(false);
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="relative min-h-screen font-serif text-white bg-black">
      {/* Background Image */}
      <Image
        src="/images/background.png"
        alt="A tranquil, modern yoga space."
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
            <h1 className="text-3xl font-bold">{t('authWelcomeBack')}</h1>
            <p className="text-white/80">{t('authWelcomeBackDesc')}</p>
          </header>
          <main className="space-y-6">
             <div className="flex justify-center gap-4">
                <Button variant="outline" size="icon" onClick={signInWithApple} disabled={isLoading} className="w-14 h-14 rounded-full bg-white/10 border-white/20 hover:bg-white/20">
                    <AppleIcon className="h-6 w-6" />
                     <span className="sr-only">Sign in with Apple</span>
                </Button>
                <Button variant="outline" size="icon" onClick={signInWithGoogle} disabled={isLoading} className="w-14 h-14 rounded-full bg-white/10 border-white/20 hover:bg-white/20">
                    <GoogleIcon className="h-6 w-6" />
                    <span className="sr-only">Sign in with Google</span>
                </Button>
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled
                    className="w-14 h-14 rounded-full bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                  >
                    <TikTokIcon className="h-6 w-6" />
                    <span className="sr-only">TikTok login coming soon</span>
                  </Button>
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Coming soon
                  </div>
                </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="bg-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/20 px-2 text-white/80">{t('authOrContinueWithEmail')}</span>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('authEmailLabel')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    {...register("email")}
                    className="pl-10 h-12 text-base rounded-lg bg-white/10 border-white/20 focus:bg-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('authPasswordLabel')}</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...register("password")}
                    className="pl-10 h-12 text-base rounded-lg bg-white/10 border-white/20 focus:bg-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
              </div>
               <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" className="border-white/50 data-[state=checked]:bg-white/80 data-[state=checked]:text-black" {...register("remember")} />
                  <Label htmlFor="remember-me" className="text-sm font-medium leading-none text-white/80 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Remember me</Label>
                </div>
                <Link href="#" className="text-sm font-medium text-white/80 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full h-12 text-base rounded-lg bg-white/90 text-black hover:bg-white" disabled={isLoading}>
                {isLoading ? <SmileyRockLoader /> : t('signIn')}
              </Button>
            </form>
          </main>
          <footer className="text-center">
            <p className="text-sm text-white/80">
              {t('authNoAccount')}{' '}
              <Link href="/auth/signup" className="font-medium text-white hover:underline">
                {t('signUp')}
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
