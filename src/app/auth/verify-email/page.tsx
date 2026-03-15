
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import Image from 'next/image';
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
    <div className="relative min-h-screen font-serif text-white">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-6 text-center shadow-xl border border-white/10">
          <div className="mx-auto mb-4 inline-block">
            <SnapYogaLogo />
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Check your inbox</h1>
            <p className="text-white/70 text-sm">
              We sent a verification link to
            </p>
            <p className="text-white font-medium">
              {user?.email}
            </p>
            <p className="text-white/60 text-sm pt-2">
              Click the link in the email to verify your account, then come back here to continue.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Primary CTA */}
            <Button
              onClick={handleContinue}
              disabled={isChecking}
              className="w-full h-12 text-base rounded-lg bg-white/90 text-black hover:bg-white"
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
              className="w-full h-12 text-base rounded-lg bg-white/10 border-white/20 hover:bg-white/20 text-white"
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
              className="text-sm text-white/60 hover:text-white underline underline-offset-2 transition-colors mt-4"
            >
              Wrong email? Sign up again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
