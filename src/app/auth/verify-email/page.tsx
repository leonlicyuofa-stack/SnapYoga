"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingThemeToggle } from '@/components/onboarding/onboarding-theme-toggle';
import { Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail, signOutUser } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    await sendVerificationEmail();
    setIsSending(false);
  };

  const handleContinue = async () => {
    setIsChecking(true);
    // Reload the user to get the latest emailVerified status
    await user?.reload();
    if (user?.emailVerified) {
      router.push('/onboarding/gender-profile');
    } else {
      setIsChecking(false);
      alert("Your email hasn't been verified yet. Please check your inbox.");
    }
  };

  const handleChangeEmail = async () => {
    await signOutUser();
    router.push('/auth/signup');
  };

  // Solid contrast capsule — amethyst on lavender (light) / gold on ink (dark).
  const ctaBg = isDark ? 'rgba(193,154,107,0.92)' : '#320E3B';
  const ctaColor = isDark ? '#1a1210' : 'rgba(255,248,235,0.96)';
  const ctaShadow = isDark ? '0 6px 16px rgba(0,0,0,0.32)' : '0 6px 16px rgba(50,30,60,0.28)';

  return (
    <div className="relative min-h-screen">
      <OnboardingThemeToggle />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm space-y-7">
          <OnboardingHeader />

          <main className="sy-card backdrop-blur-lg rounded-2xl p-6 text-center space-y-5">
            {/* Icon */}
            <div className="flex justify-center">
              <Mail className="sy-accent" style={{ width: 40, height: 40 }} />
            </div>

            <div className="space-y-2">
              <h1 className="sy-card-heading" style={{ fontSize: 18, margin: 0 }}>Check your inbox</h1>
              <p className="sy-body text-sm">
                We sent a confirmation link to{' '}
                <span className="sy-accent font-medium">{user?.email}</span>.
                <br />You&apos;ll only do this once.
              </p>
            </div>

            {/* Wrong email */}
            <button
              onClick={handleChangeEmail}
              className="sy-subtitle text-sm block w-full hover:underline underline-offset-2"
            >
              Wrong email? <span className="sy-accent font-medium">Sign up again</span>
            </button>

            {/* Primary CTA — solid contrast capsule */}
            <button
              onClick={handleContinue}
              disabled={isChecking}
              className="w-full disabled:opacity-60 transition-transform hover:scale-[1.02]"
              style={{
                borderRadius: 999,
                padding: 12,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 600,
                fontSize: 13.5,
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: isChecking ? 'default' : 'pointer',
                background: ctaBg,
                color: ctaColor,
                boxShadow: ctaShadow,
              }}
            >
              {isChecking ? 'Checking…' : "I've verified my email"}
            </button>

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={isSending}
              className="sy-subtitle text-sm block w-full"
            >
              Didn&apos;t receive it?{' '}
              <span className="sy-accent font-medium underline underline-offset-2">
                {isSending ? 'Sending…' : 'Resend email'}
              </span>
            </button>
          </main>

          <footer className="text-center">
            <p className="sy-subtitle text-sm">
              Already have an account?{' '}
              <Link href="/auth/signin" className="sy-accent font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
