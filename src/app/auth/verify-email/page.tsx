
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext'; // Adjusted import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MailCheck, Send, RotateCw } from 'lucide-react';
import { auth } from '@/lib/firebase/clientApp'; // direct import for sendEmailVerification
import { sendEmailVerification as firebaseSendEmailVerification } from 'firebase/auth';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

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
    <div className="relative flex min-h-screen items-center justify-center py-12 bg-background overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-breathing-bg">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full animate-pebble-float-1"></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/20 rounded-full animate-pebble-float-2"></div>
            <div className="absolute bottom-1/2 right-1/3 w-16 h-16 bg-secondary/30 rounded-full animate-pebble-float-3"></div>
        </div>

        <Card className="relative z-10 w-full max-w-lg shadow-xl border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <MailCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              A verification email has been sent to <span className="font-semibold text-primary">{user?.email}</span>.
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
             <p className="text-xs text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder or try resending.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-xs text-muted-foreground">
              If you used the wrong email, you can{' '}
              <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleSignOutAndReturnToSignUp}>
                 sign out and try signing up again.
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
  );
}
