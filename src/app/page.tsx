
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonStanding, Sparkles, ArrowRight, Users, ListChecks, CalendarDays, Trophy, Eye } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; // Removed 'where' as it's not used here
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';


interface StoredAnalysis {
  id: string;
  videoFileName: string;
  feedback: string;
  score: number;
  identifiedPose: string;
  createdAt: Timestamp;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      setLoadingAnalyses(true);
      const analysesRef = collection(firestore, 'users', user.uid, 'poseAnalyses');
      const q = query(analysesRef, orderBy('createdAt', 'desc'), limit(3)); // Limit to 3 for dashboard card

      getDocs(q)
        .then((querySnapshot) => {
          const fetchedAnalyses: StoredAnalysis[] = [];
          querySnapshot.forEach((doc) => {
            fetchedAnalyses.push({ id: doc.id, ...doc.data() } as StoredAnalysis);
          });
          setAnalyses(fetchedAnalyses);
        })
        .catch((error) => {
          console.error("Error fetching pose analyses:", error);
        })
        .finally(() => {
          setLoadingAnalyses(false);
        });
    } else if (!authLoading && !user) {
      setAnalyses([]);
      setLoadingAnalyses(false);
    }
  }, [user, authLoading]);

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default";
    if (score >= 75) return "secondary";
    if (score >= 50) return "outline";
    return "destructive";
  };

  if (authLoading) {
    return (
      <AppShell>
        <div className="space-y-12 p-4 md:p-8 animate-pulse">
          {/* Skeleton for dashboard area */}
          <div className="bg-muted/30 p-6 rounded-lg shadow">
            <Skeleton className="h-8 w-3/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
          {/* Skeleton for main welcome card */}
          <Card className="w-full max-w-2xl shadow-2xl overflow-hidden mx-auto">
            <Skeleton className="w-full h-64 md:h-80" />
            <CardHeader className="text-center pt-8"><Skeleton className="h-8 w-3/5 mx-auto" /><Skeleton className="h-6 w-4/5 mx-auto mt-2" /></CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 p-8"><Skeleton className="h-12 w-3/4" /></CardContent>
          </Card>
          {/* Skeleton for challenges card */}
          <Card className="w-full max-w-2xl shadow-2xl overflow-hidden mt-12 mx-auto">
            <CardHeader className="text-center pt-8"><Skeleton className="h-8 w-3/5 mx-auto" /><Skeleton className="h-6 w-4/5 mx-auto mt-2" /></CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 p-8"><Skeleton className="h-12 w-1/2" /></CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center w-full">
        {user && ( // Dashboard section - only render if user is logged in
          <div className="w-full bg-primary/5 p-4 md:p-6 rounded-lg shadow-md border border-primary/20 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4 md:mb-6 text-center">
              Welcome to Your Dashboard, {user.displayName || user.email?.split('@')[0] || 'User'}!
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Card 1: Recent Pose Analyses */}
              <Card className="shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl md:text-2xl">
                    <ListChecks className="mr-3 h-7 w-7 text-primary" />
                    Recent Pose Analyses
                  </CardTitle>
                  <CardDescription>Your last few analyzed poses.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAnalyses ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
                    </div>
                  ) : analyses.length > 0 ? (
                    <ul className="space-y-3">
                      {analyses.map((analysis) => (
                        <li key={analysis.id} className="p-3 bg-card rounded-md border hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-lg text-foreground">{analysis.identifiedPose}</span>
                            <Badge variant={getScoreBadgeVariant(analysis.score)} className="text-sm px-3 py-1">
                              {analysis.score}/100
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(analysis.createdAt.toDate(), 'PPP')}
                          </p>
                          <p className="text-sm text-foreground/80 mt-1 truncate" title={analysis.feedback}>
                            Feedback: {analysis.feedback.substring(0, 70)}{analysis.feedback.length > 70 ? "..." : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No pose analyses found. Analyze a pose to see your progress!</p>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: App Usage & Challenges Combined or Separate */}
              <div className="space-y-4 md:space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl md:text-2xl">
                      <CalendarDays className="mr-3 h-7 w-7 text-primary" />
                      App Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-5xl font-bold text-accent">15</p>
                    <p className="text-muted-foreground">Active Days (This Month)</p>
                    <p className="mt-3 text-sm text-foreground/80">Keep up the great work!</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl md:text-2xl">
                      <Trophy className="mr-3 h-7 w-7 text-primary" />
                      Friend Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-1 text-sm">Headstand Challenge:</p>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-foreground/80 mb-0.5"><span>You</span><span>75%</span></div>
                      <Progress value={75} className="h-2.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-0.5"><span>Alex</span><span>60%</span></div>
                      <Progress value={60} className="h-2.5 bg-secondary/70" />
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                      <Link href="/challenges">
                        View All Challenges
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Main Welcome and Challenges Section */}
        <div className="w-full max-w-2xl flex flex-col items-center justify-center py-8 md:py-12"> {/* Ensure this content is centered and has some top padding */}
          <Card className="w-full shadow-2xl overflow-hidden">
            <div className="relative w-full h-64 md:h-80">
              <Image
                src="https://placehold.co/800x450.png"
                alt="Yoga practice"
                layout="fill"
                objectFit="cover"
                data-ai-hint="yoga meditation"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center">
                  <PersonStanding className="mr-3 h-10 w-10 md:h-12 md:w-12" />
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

          <Card className="w-full shadow-2xl overflow-hidden mt-12">
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-3xl font-semibold flex items-center justify-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                Challenges with Friends
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
                Explore and join monthly yoga pose challenges. Invite friends and grow your practice together!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 p-8">
              <Link href="/challenges" passHref>
                <Button size="lg" variant="outline" className="text-lg py-7 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
                  Explore Challenges
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

    