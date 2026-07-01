
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const schema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await sendPasswordReset(data.email);
      setEmailSent(true);
    } catch (e) {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Back button */}
      <button
        onClick={() => router.push('/auth/signin')}
        aria-label="Back to sign in"
        className="absolute top-4 left-4 z-20 rounded-full h-12 w-12 p-0 flex items-center justify-center bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border border-[rgba(50,14,59,0.4)] dark:border-white/20"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm space-y-6">
          <OnboardingHeader />
          <div className="text-center">
            {emailSent ? (
              // Success state
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full sy-option flex items-center justify-center">
                    <CheckCircle className="h-9 w-9 text-green-400" />
                  </div>
                </div>
                <h1 className="sy-title" style={{ fontSize: 22 }}>Check your inbox</h1>
                <p className="sy-subtitle text-sm">
                  We sent a password reset link to
                </p>
                <p className="sy-accent font-medium">{getValues('email')}</p>
                <p className="sy-body text-sm">
                  Follow the link in the email to reset your password. It may take a minute to arrive.
                </p>
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="sy-cta w-full h-12 text-base rounded-xl mt-4"
                >
                  Back to Sign In
                </Button>
                <button
                  onClick={() => setEmailSent(false)}
                  className="sy-subtitle text-sm hover:underline underline-offset-2 transition-colors mt-2"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              // Form state
              <>
                <h1 className="sy-title" style={{ fontSize: 22 }}>Forgot password?</h1>
                <p className="sy-subtitle text-sm mt-1">
                  Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 text-left">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="sy-accent absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email"
                        {...register("email")}
                        className="sy-input pl-12 h-12 text-base rounded-lg"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="sy-cta w-full h-12 text-base rounded-xl"
                  >
                    {isSubmitting ? <SmileyRockLoader /> : 'Send Reset Link'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
