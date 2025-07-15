
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
import { Mail, KeyRound, UserPlus, Check, Sparkles, BarChart, HeartPulse, Users, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ZenRock } from '@/components/icons/rocks/zen-rock';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const featureItems = [
    { text: "AI Pose Analysis", icon: Sparkles },
    { text: "Personalized Feedback", icon: HeartPulse },
    { text: "Progress Tracking", icon: BarChart },
    { text: "Friends Challenge", icon: Users },
];

function FeaturesDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Flame className="h-6 w-6 text-accent" />
                Here's what you'll unlock:
            </DialogTitle>
        </DialogHeader>
        <div className="py-4">
             <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                {featureItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.text} className="flex flex-col items-center gap-1.5 text-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Icon className="h-6 w-6 text-primary"/>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.text}</p>
                        </div>
                    )
                })}
            </div>
        </div>
        <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function SignUpPage() {
  const { signUpWithEmail, signInWithGoogle, signInWithApple, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, touchedFields, isValid } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  useEffect(() => {
    const filledCount = [emailValue, passwordValue, confirmPasswordValue].filter(Boolean).length;
    setFormProgress((filledCount / 3) * 100);
  }, [emailValue, passwordValue, confirmPasswordValue]);

  useEffect(() => {
    // Show the features dialog a bit after the page loads
    const timer = setTimeout(() => {
        setShowFeaturesDialog(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);


  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    setIsSubmitting(true);
    // Simulate network delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    await signUpWithEmail(data.email, data.password);
    setIsSuccess(true);
    // Don't reset isSubmitting to keep success state
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-breathing-bg">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full animate-pebble-float-1"></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/20 rounded-full animate-pebble-float-2"></div>
            <div className="absolute bottom-1/2 right-1/3 w-16 h-16 bg-secondary/30 rounded-full animate-pebble-float-3"></div>
        </div>
        
        <FeaturesDialog isOpen={showFeaturesDialog} onOpenChange={setShowFeaturesDialog} />
        
        <main className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Left Side: Welcome Text & Mascot */}
            <div className="w-full md:w-1/2 text-center md:text-left animate-fade-in-up">
                <ZenRock progress={formProgress} isSuccess={isSuccess} />
                <h1 className="text-3xl md:text-4xl font-bold text-primary mt-4">
                    Join{' '}
                    <span className="relative inline-block">
                        SnapYoga
                        <svg
                            className="absolute -bottom-1 -left-2 -right-2 h-[120%] w-[110%] text-accent/70 -z-10"
                            viewBox="0 0 200 60"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M3.5 31.9731C51.6667 12.3065 120 -15.0269 190.5 24.9731C159.5 35.4731 106.667 52.8065 83 58.9731C58.2 62.2731 11.5 54.9731 3.5 49.4731"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className="animate-brush-stroke"
                            />
                        </svg>
                    </span>
                    {' '}to begin your journey.
                </h1>
            </div>

            {/* Right Side: Signup Form */}
            <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm border-border/20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <CardHeader className="text-center p-4">
                     {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-1.5 mb-4">
                        <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${formProgress}%` }}
                        ></div>
                    </div>
                    <CardTitle className="text-2xl font-bold">{t('authCreateAccount')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 animate-form-item" style={{ animationDelay: '300ms' }}>
                        <Button variant="outline" onClick={signInWithGoogle} disabled={isLoading} className="py-3 h-auto">
                            <GoogleIcon className="mr-2 h-5 w-5" /> {t('authGoogle')}
                        </Button>
                        <Button variant="outline" onClick={signInWithApple} disabled={isLoading} className="py-3 h-auto">
                            <AppleIcon className="mr-2 h-5 w-5" /> {t('authApple')}
                        </Button>
                    </div>
                    <div className="relative animate-form-item" style={{ animationDelay: '400ms' }}>
                        <div className="absolute inset-0 flex items-center"><Separator /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">{t('authOrSignUpWithEmail')}</span>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="space-y-1 animate-form-item" style={{ animationDelay: '500ms' }}>
                            <Label htmlFor="email">{t('authEmailLabel')}</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className={cn("pl-10 transition-all focus:scale-[1.02]", errors.email ? "border-destructive focus:ring-destructive" : touchedFields.email && "border-green-500 focus:ring-green-500" )}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-1 animate-form-item" style={{ animationDelay: '600ms' }}>
                            <Label htmlFor="password">{t('authPasswordLabel')}</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className={cn("pl-10 transition-all focus:scale-[1.02]", errors.password ? "border-destructive focus:ring-destructive" : touchedFields.password && "border-green-500 focus:ring-green-500")}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-1 animate-form-item" style={{ animationDelay: '700ms' }}>
                            <Label htmlFor="confirmPassword">{t('authConfirmPasswordLabel')}</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("confirmPassword")}
                                    className={cn("pl-10 transition-all focus:scale-[1.02]", errors.confirmPassword ? "border-destructive focus:ring-destructive" : touchedFields.confirmPassword && !errors.confirmPassword && "border-green-500 focus:ring-green-500" )}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                        </div>
                        <div className="pt-2 animate-form-item" style={{ animationDelay: '800ms' }}>
                            <Button
                                type="submit"
                                className={cn(
                                    "w-full text-lg py-5 transition-all duration-300 transform active:scale-95",
                                    isSuccess ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                                )}
                                disabled={isLoading || !isValid}
                            >
                                <div className={cn("transition-transform duration-300", isLoading && "animate-button-press")}>
                                {isSuccess ? (
                                    <Check className="mr-2 h-5 w-5 animate-scale-in" />
                                ) : (
                                    <UserPlus className="mr-2 h-5 w-5" />
                                )}
                                </div>
                                {isSuccess ? 'Success!' : isLoading ? 'Creating...' : t('authCreateAccount')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="justify-center p-4">
                    <p className="text-sm text-muted-foreground">
                        {t('authAlreadyHaveAccount')}{' '}
                        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                            {t('signIn')}
                        </Link>
                    </p>
                </CardFooter>
            </Card>

        </main>
    </div>
  );
}

    