
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
import { Mail, KeyRound, UserPlus, Check, Sparkles, BarChart, HeartPulse, Users, Flame, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const featurePages = [
    { 
        title: "AI Pose Analysis", 
        description: "Get instant, intelligent feedback on your yoga poses by simply uploading a video.",
        image: { src: "https://placehold.co/400x225.png", hint: "app screenshot analysis" }
    },
    { 
        title: "Personalized Feedback", 
        description: "Receive custom scores and actionable tips to help you improve your alignment and form.",
        image: { src: "https://placehold.co/400x225.png", hint: "app screenshot feedback" }
    },
    { 
        title: "Progress Tracking", 
        description: "Watch your skills grow over time with a detailed history of all your analyzed poses.",
        image: { src: "https://placehold.co/400x225.png", hint: "app screenshot progress" }
    },
    { 
        title: "Friends Challenge", 
        description: "Join fun monthly challenges, invite your friends, and stay motivated together.",
        image: { src: "https://placehold.co/400x225.png", hint: "app screenshot challenges" }
    },
];

function FeaturesDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = featurePages.length;

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev));
  };

  const handleBack = () => {
    setCurrentPage((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };
  
  const handleFinish = () => {
    onOpenChange(false);
  }

  // Reset to first page when dialog re-opens
  useEffect(() => {
    if (isOpen) {
        setCurrentPage(0);
    }
  }, [isOpen])

  const currentFeature = featurePages[currentPage];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 text-center">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                 <Image src={currentFeature.image.src} alt={currentFeature.title} fill className="object-cover" data-ai-hint={currentFeature.image.hint} />
            </div>
            <DialogTitle className="text-3xl font-script text-primary">{currentFeature.title}</DialogTitle>
             <DialogDescription className="min-h-[40px] text-base">
                {currentFeature.description}
            </DialogDescription>
        </DialogHeader>
       
        <DialogFooter className="flex-row items-center justify-between p-4 bg-muted/50">
            {currentPage > 0 ? (
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-1"/> Back
                </Button>
            ) : (
                <div /> // Placeholder to keep right side aligned
            )}
           <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                    'h-2 w-2 rounded-full transition-all duration-300',
                    currentPage === index ? 'bg-primary w-4' : 'bg-muted-foreground/50'
                    )}
                />
                ))}
            </div>
            <div>
                {currentPage < totalPages - 1 ? (
                    <Button onClick={handleNext}>
                        Next <ArrowRight className="h-4 w-4 ml-1"/>
                    </Button>
                ) : (
                    <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                        Finish
                    </Button>
                )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function SignUpPage() {
  const { signUpWithEmail, signInWithGoogle, signInWithApple, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    await signUpWithEmail(data.email, data.password);
    setIsSubmitting(false);
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center p-4">
        {/* Pastel Shape Background */}
        <div className="absolute inset-0 z-0 bg-splash-background">
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                    <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
                <path d="M 0,0 L 100,0 C 50,50 100,50 100,100 L 0,100 Z" fill="hsl(var(--splash-blob-1))" />
                <path d="M 0,100 C 50,50 0,50 0,0" fill="hsl(var(--splash-background))" />
                <path d="M 100,0 L 0,0 C 50,50 0,50 0,100 L 100,100 Z" fill="hsl(var(--splash-blob-2))" style={{ opacity: 0.5 }}/>
            </svg>
        </div>
        
        <FeaturesDialog isOpen={showFeaturesDialog} onOpenChange={setShowFeaturesDialog} />
        
        <main className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Left Side: Welcome Text */}
            <div className="w-full md:w-1/2 text-center md:text-left animate-fade-in-up">
                <h1 className="text-3xl md:text-4xl font-bold text-splash-foreground mt-4">
                    Join{' '}
                    <span className="font-script text-4xl md:text-5xl">
                        SnapYoga
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
                                    className={cn("pl-10 pr-10 transition-all focus:scale-[1.02]", errors.email ? "border-destructive focus:ring-destructive" : touchedFields.email && "border-green-500 focus:ring-green-500" )}
                                />
                                <Check className={cn("absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 transition-opacity duration-300", !errors.email && touchedFields.email ? "opacity-100" : "opacity-0")} />
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
                                    className={cn("pl-10 pr-10 transition-all focus:scale-[1.02]", errors.password ? "border-destructive focus:ring-destructive" : touchedFields.password && "border-green-500 focus:ring-green-500")}
                                />
                                <Check className={cn("absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 transition-opacity duration-300", !errors.password && touchedFields.password ? "opacity-100" : "opacity-0")} />
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
                                    className={cn("pl-10 pr-10 transition-all focus:scale-[1.02]", errors.confirmPassword ? "border-destructive focus:ring-destructive" : touchedFields.confirmPassword && !errors.confirmPassword && "border-green-500 focus:ring-green-500" )}
                                />
                                <Check className={cn("absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 transition-opacity duration-300", !errors.confirmPassword && touchedFields.confirmPassword ? "opacity-100" : "opacity-0")} />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                        </div>
                        <div className="pt-2 animate-form-item" style={{ animationDelay: '800ms' }}>
                            <Button
                                type="submit"
                                className={cn(
                                    "w-full text-lg py-5 transition-all duration-300 transform active:scale-95",
                                    "bg-primary hover:bg-primary/90"
                                )}
                                disabled={isLoading || !isValid}
                            >
                                <div className={cn("transition-transform duration-300", isLoading && "animate-button-press")}>
                                    <UserPlus className="mr-2 h-5 w-5" />
                                </div>
                                {isLoading ? 'Creating...' : t('authCreateAccount')}
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
