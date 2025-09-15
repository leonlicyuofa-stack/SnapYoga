
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Mail, ArrowLeft, Sun } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppShell } from '@/components/layout/app-shell';
import { SmileyBlobMascot } from '@/components/icons/SmileyBlobMascot';
import { WavingMascot } from '@/components/icons/WavingMascot';

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  return (
    <AppShell>
        <div className="relative flex flex-col min-h-[calc(100vh-5rem)] items-center justify-center p-4 overflow-hidden">
            <div className="relative z-10 w-full max-w-sm text-center">
                
                <Card className="bg-[#414869] text-white p-6 rounded-2xl shadow-lg mb-8 overflow-hidden relative">
                    <div className="flex flex-col items-start">
                        <div className="flex space-x-1 mb-4">
                           <div className="w-2 h-2 rounded-full bg-[#FFB6C1]"></div>
                           <div className="w-2 h-2 rounded-full bg-[#FFB6C1]"></div>
                           <div className="w-2 h-2 rounded-full bg-[#FFB6C1]"></div>
                           <div className="w-2 h-2 rounded-full bg-[#FFB6C1]"></div>
                        </div>
                        <h2 className="text-4xl font-playfair font-bold">Welcome!</h2>
                        <p className="text-lg opacity-80">Let's get you set up.</p>
                    </div>
                    <WavingMascot className="absolute -right-8 -bottom-8 opacity-90" />
                </Card>
                
                <h1 className="text-4xl font-bold font-playfair mb-8">Create an Account</h1>
                
                <div className="space-y-3">
                    <Button variant="outline" onClick={signInWithGoogle} disabled={authLoading} className="w-full py-6 text-base h-auto justify-start">
                        <GoogleIcon className="mr-4 h-5 w-5" /> {t('authGoogle')}
                    </Button>
                    <Button variant="outline" onClick={signInWithApple} disabled={authLoading} className="w-full py-6 text-base h-auto justify-start">
                        <AppleIcon className="mr-4 h-5 w-5" /> {t('authApple')}
                    </Button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">{t('authOrSignUpWithEmail')}</span>
                    </div>
                </div>

                <Button variant="outline" disabled={authLoading} className="w-full py-6 text-base h-auto justify-start" onClick={() => router.push('/onboarding/gender-profile')}>
                    <Mail className="mr-4 h-5 w-5" /> Sign Up with Email
                </Button>

                <p className="text-sm text-muted-foreground mt-8">
                    {t('authAlreadyHaveAccount')}{' '}
                    <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                        {t('signIn')}
                    </Link>
                </p>

            </div>
        </div>
    </AppShell>
  );
}
