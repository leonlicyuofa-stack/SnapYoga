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
import { Mail, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { useLanguage } from '@/contexts/LanguageContext';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import Image from 'next/image';

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
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
            <h1 className="text-3xl font-bold">{t('authWelcomeBack')}</h1>
            <p className="text-white/80">{t('authWelcomeBackDesc')}</p>
          </header>
          <main className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={signInWithGoogle} disabled={isLoading} className="py-6 text-base h-auto rounded-lg bg-white/10 border-white/20 hover:bg-white/20">
                <GoogleIcon className="mr-2 h-5 w-5" /> {t('authGoogle')}
              </Button>
              <Button variant="outline" onClick={signInWithApple} disabled={isLoading} className="py-6 text-base h-auto rounded-lg bg-white/10 border-white/20 hover:bg-white/20">
                 <AppleIcon className="mr-2 h-5 w-5" /> {t('authApple')}
              </Button>
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
              <Button type="submit" className="w-full text-lg py-6 h-auto rounded-lg bg-white/90 text-black hover:bg-white" disabled={isLoading}>
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
