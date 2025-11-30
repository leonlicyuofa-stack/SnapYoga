
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppShell } from '@/components/layout/app-shell';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-5rem)] items-center justify-center p-4 overflow-hidden text-center w-full max-w-sm mx-auto">
        <OnboardingHeader />
        
        <h1 className="text-4xl font-bold mb-8">Create an Account</h1>
        
        <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={signInWithGoogle} disabled={authLoading} className="w-full py-6 text-base h-auto justify-start">
                <GoogleIcon className="mr-4 h-5 w-5" /> {t('authGoogle')}
            </Button>
            <Button variant="outline" onClick={signInWithApple} disabled={authLoading} className="w-full py-6 text-base h-auto justify-start">
                <AppleIcon className="mr-4 h-5 w-5" /> {t('authApple')}
            </Button>
        </div>

        <div className="relative my-6 w-full">
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
    </AppShell>
  );
}
