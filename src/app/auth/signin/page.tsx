
"use client";

import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Mail, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { WelcomeRock } from '@/components/icons/rocks/welcome-rock';
import { useLanguage } from '@/contexts/LanguageContext';

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { signInWithEmail, signInWithGoogle, signInWithApple, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    setIsSubmitting(true);
    await signInWithEmail(data.email, data.password);
    setIsSubmitting(false);
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="relative flex min-h-screen items-center justify-center py-12 bg-background overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-breathing-bg">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full animate-pebble-float-1"></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/20 rounded-full animate-pebble-float-2"></div>
            <div className="absolute bottom-1/2 right-1/3 w-16 h-16 bg-secondary/30 rounded-full animate-pebble-float-3"></div>
        </div>
        <Card className="relative z-10 w-full max-w-md shadow-xl border-border/60 bg-card/80 backdrop-blur-sm">
           <CardHeader className="text-center">
            <WelcomeRock className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">{t('authWelcomeBack')}</CardTitle>
            <CardDescription>{t('authWelcomeBackDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={signInWithGoogle} disabled={isLoading} className="py-6 text-base h-auto">
                {isLoading ? <SmileyRockLoader /> : <><GoogleIcon className="mr-2 h-5 w-5" /> {t('authGoogle')}</>}
              </Button>
              <Button variant="outline" onClick={signInWithApple} disabled={isLoading} className="py-6 text-base h-auto">
                 {isLoading ? <SmileyRockLoader /> : <><AppleIcon className="mr-2 h-5 w-5" /> {t('authApple')}</>}
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('authOrContinueWithEmail')}</span>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('authEmailLabel')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    {...register("email")}
                    className="pl-10" 
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('authPasswordLabel')}</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...register("password")}
                    className="pl-10"
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? <SmileyRockLoader /> : t('signIn')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {t('authNoAccount')}{' '}
              <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                {t('signUp')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
  );
}
