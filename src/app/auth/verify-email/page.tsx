
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { Mail, RefreshCw, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail, signOutUser } = useAuth();
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

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <OnboardingHeader />

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full sy-option flex items-center justify-center">
              <Mail className="sy-accent h-9 w-9" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="sy-title" style={{ fontSize: 22 }}>Check your inbox</h1>
            <p className="sy-subtitle text-sm">
              We sent a verification link to
            </p>
            <p className="sy-accent font-medium">
              {user?.email}
            </p>
            <p className="sy-body text-sm pt-2">
              Click the link in the email to verify your account, then come back here to continue.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Primary CTA */}
            <Button
              onClick={handleContinue}
              disabled={isChecking}
              className="sy-cta w-full h-12 text-base rounded-xl"
            >
              {isChecking ? (
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              {isChecking ? "Checking..." : "I've verified my email"}
            </Button>

            {/* Resend */}
            <Button
              onClick={handleResend}
              disabled={isSending}
              variant="outline"
              className="sy-option sy-cta-outline w-full h-12 text-base rounded-xl hover:opacity-80"
            >
              {isSending ? (
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Mail className="h-5 w-5 mr-2" />
              )}
              {isSending ? "Sending..." : "Resend verification email"}
            </Button>

            {/* Wrong email */}
            <button
              onClick={handleChangeEmail}
              className="sy-subtitle text-sm hover:underline underline-offset-2 transition-colors mt-4"
            >
              Wrong email? Sign up again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
