
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext'; // Adjusted import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, RotateCw } from 'lucide-react';
import { auth } from '@/lib/firebase/clientApp'; // direct import for sendEmailVerification
import { sendEmailVerification as firebaseSendEmailVerification } from 'firebase/auth';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { PebbleTrioIcon } from '@/components/icons/PebbleTrioIcon';


export default function VerifyEmailPage() {
  const { user, loading: authLoading, signOutUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // If user is already verified and lands here (e.g. back button), redirect them.
    if (user && user.emailVerified) {
      router.replace('/onboarding/gender-profile');
    }
  }, [user, router]);

  const handleResendVerificationEmail = async () => {
    if (!user) {
      toast({ title: "Error", description: "No user session found. Please sign in again.", variant: "destructive" });
      router.push('/auth/signin');
      return;
    }
    setIsSending(true);
    try {
      await firebaseSendEmailVerification(user);
      toast({
        title: "Verification Email Sent",
        description: "A new verification email has been sent to your address.",
      });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Error Sending Email",
        description: error.message || "Could not resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleContinue = () => {
    // Bypassing verification check and proceeding to the next step.
    router.push('/onboarding/gender-profile');
  };
  
  const handleSignOutAndReturnToSignUp = async () => {
    await signOutUser(); // This already handles navigation to '/'
    // No need to push to signup, user can navigate from home
  };


  if (authLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <SmileyRockLoader text="Checking authentication..." />
        </div>
    );
  }
  
  // If user is somehow not logged in but on this page, or becomes unlogged in.
  if (!user && !authLoading) {
    router.replace('/auth/signup'); // Or signin, depending on desired flow
    return <div className="flex justify-center items-center min-h-screen bg-background"><p>Redirecting...</p></div>;
  }


  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center py-12 bg-background font-sans overflow-hidden">
        {/* Animated Background */}
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
        
        <div className="relative w-full max-w-lg mt-24">
            <Card className="relative z-10 shadow-xl border-border/60 bg-card/80 backdrop-blur-sm pt-24">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2">
                <PebbleTrioIcon className="h-auto w-40 sm:w-48 md:w-56 text-primary" />
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Verify Your Email</CardTitle>
                <CardDescription className="font-sans">
                  A verification email has been sent to <span className="font-semibold text-primary">{user?.email}</span>.
                  <br />
                  Please click the link in the email to continue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSending}
                >
                  <Send className="mr-2 h-5 w-5" />
                  Continue
                </Button>
                <Button
                  onClick={handleResendVerificationEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isSending}
                >
                  {isSending ? <SmileyRockLoader /> : <><RotateCw className="mr-2 h-5 w-5" /> Resend Verification Email</>}
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p className="text-xs text-muted-foreground text-center">
                  Didn&apos;t receive the email? Check your spam folder or try resending. If you used the wrong email, you can{' '}
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleSignOutAndReturnToSignUp}>
                     sign out and try signing up again.
                  </Button>
                </p>
              </CardFooter>
            </Card>
        </div>
      </div>
  );
}
