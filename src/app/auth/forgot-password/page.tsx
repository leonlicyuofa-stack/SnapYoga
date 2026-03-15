
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
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
    <div className="relative min-h-screen font-serif text-white">
      {/* Back button */}
      <button
        onClick={() => router.push('/auth/signin')}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/30 backdrop-blur-sm"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Back to Sign In</span>
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-6 shadow-xl border border-white/10">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-block">
              <SnapYogaLogo />
            </div>

            {emailSent ? (
              // Success state
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold">Check your inbox</h1>
                <p className="text-white/70 text-sm">
                  We sent a password reset link to
                </p>
                <p className="text-white font-medium">{getValues('email')}</p>
                <p className="text-white/60 text-sm">
                  Follow the link in the email to reset your password. It may take a minute to arrive.
                </p>
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full h-12 text-base rounded-lg bg-white/90 text-black hover:bg-white mt-4"
                >
                  Back to Sign In
                </Button>
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-sm text-white/60 hover:text-white underline underline-offset-2 transition-colors mt-2"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              // Form state
              <>
                <h1 className="text-2xl font-bold">Forgot password?</h1>
                <p className="text-white/70 text-sm mt-1">
                  Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base rounded-lg bg-white/90 text-black hover:bg-white"
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
