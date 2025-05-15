
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonStanding, Sparkles, ArrowRight } from 'lucide-react'; // Changed Yoga to PersonStanding
import Image from 'next/image';

export default function HomePage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center py-12 md:py-20 lg:py-28">
        <Card className="w-full max-w-2xl shadow-2xl overflow-hidden">
          <div className="relative w-full h-64 md:h-80">
            <Image
              src="https://placehold.co/800x400.png"
              alt="Yoga practice"
              layout="fill"
              objectFit="cover"
              data-ai-hint="yoga serene"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center">
                <PersonStanding className="mr-3 h-10 w-10 md:h-12 md:w-12" /> {/* Changed Yoga to PersonStanding */}
                Welcome to SnapYoga
              </h1>
            </div>
          </div>
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-3xl font-semibold flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Refine Your Practice
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
              Get AI-powered feedback on your yoga poses. Upload a video, and let our smart assistant help you improve your alignment and form.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 p-8">
            <p className="text-center text-foreground/80">
              Ready to take your yoga journey to the next level? Click below to start analyzing your poses and unlock personalized insights.
            </p>
            <Link href="/snap-yoga" passHref>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-7 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                aria-label="Go to SnapYoga Analysis Page"
              >
                Start Analyzing Your Pose
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
