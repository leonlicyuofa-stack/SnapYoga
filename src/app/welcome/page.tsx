
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';
import { ArrowRight, PartyPopper, UploadCloud, Star, MessageSquareQuote, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const features = [
  {
    icon: UploadCloud,
    title: "Upload Videos",
    description: "Record and upload short videos of your yoga poses for our AI to analyze.",
  },
  {
    icon: Star,
    title: "Get Scores",
    description: "Receive a detailed score out of 100 on your form and alignment.",
  },
    {
    icon: MessageSquareQuote,
    title: "Receive Feedback",
    description: "Get actionable, real-time feedback to help you improve your poses.",
  },
  {
    icon: Share2,
    title: "Share with Friends",
    description: "Join challenges and share your progress with the SnapYoga community.",
  },
];


export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/onboarding/gender-profile');
  };

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-2xl shadow-xl text-center overflow-hidden">
          <CardHeader className="bg-muted/30 p-8">
            <div className="mb-4">
              <SmileyPebbleIcon className="mx-auto h-20 w-20 text-primary drop-shadow-lg" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-2">
              <PartyPopper className="h-8 w-8" />
              Welcome to SnapYoga!
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-muted-foreground mt-3">
              Embark on a journey to perfect your poses and deepen your practice.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div>
                 <h3 className="text-2xl font-semibold text-primary mb-4">How to Use SnapYoga</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="flex items-start text-left gap-4 p-4 bg-background rounded-lg border">
                                <Icon className="h-8 w-8 text-accent shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Separator />
            
            <div>
              <p className="text-foreground/80 leading-relaxed mb-6">
                To get started, we'll ask a few quick questions to personalize your experience.
              </p>
              <Button
                onClick={handleGetStarted}
                className="w-full sm:w-auto text-lg py-6 px-10 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                size="lg"
              >
                Let's Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground w-full">
                You're one step closer to a more mindful yoga experience.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
