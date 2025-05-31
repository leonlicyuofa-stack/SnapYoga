
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PersonStanding, Sparkles, ArrowRight, Users, ListChecks, CalendarDays, Trophy, Eye, Copy, MessageSquare, Share2, PlayCircle, UserPlus, BarChart3, Activity, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import type { Timestamp, DocumentData } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface StoredAnalysis {
  id: string;
  videoFileName: string;
  feedback: string;
  score: number;
  identifiedPose: string;
  createdAt: Timestamp;
}

interface UserProfileData extends DocumentData {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  onboardingCompleted?: boolean;
  height?: number;
  weight?: number;
  yogaInterest?: string;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [inviteLink, setInviteLink] = useState('');
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(true);

  const [activeLoginDays, setActiveLoginDays] = useState<number | null>(null);
  const [posesAnalyzedPast30Days, setPosesAnalyzedPast30Days] = useState<number | null>(null);
  const [loadingAppUsageStats, setLoadingAppUsageStats] = useState(true);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(window.location.origin);
    }

    if (user && !authLoading) {
      setLoadingAnalyses(true);
      setLoadingUserProfile(true);
      setLoadingAppUsageStats(true);
      console.log(`[DEBUG] Fetching data for user: ${user.uid}`);

      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfileData);
          } else {
            setUserProfile(null);
            console.log("[DEBUG] User profile not found in Firestore for homepage, might be a new social sign-in.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          toast({ title: "Error", description: "Could not fetch user profile.", variant: "destructive" });
        })
        .finally(() => {
          setLoadingUserProfile(false);
        });

      const analysesRef = collection(firestore, 'users', user.uid, 'poseAnalyses');
      const qRecentAnalyses = query(analysesRef, orderBy('createdAt', 'desc'), limit(3));

      getDocs(qRecentAnalyses)
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

      const now = new Date();
      console.log(`[DEBUG] Current client date (from new Date()): ${now.toString()}`);
      const thirtyDaysAgo = subDays(now, 30);
      console.log(`[DEBUG] Thirty days ago: ${thirtyDaysAgo.toString()}`);

      const dailyLoginsRef = collection(firestore, 'users', user.uid, 'dailyLogins');
      const loginsQuery = query(dailyLoginsRef,
        where('loggedInAt', '>=', thirtyDaysAgo),
        where('loggedInAt', '<=', now)
      );

      const past30DaysAnalysesQuery = query(
        analysesRef,
        where('createdAt', '>=', thirtyDaysAgo),
        where('createdAt', '<=', now)
      );

      const fetchLoginsPromise = getDocs(loginsQuery);
      const fetchAnalysesPromise = getDocs(past30DaysAnalysesQuery);

      Promise.all([fetchLoginsPromise, fetchAnalysesPromise])
        .then(([loginsSnapshot, analysesSnapshot]) => {
          console.log(`[DEBUG] Active Logins Query (Past 30 Days) for ${user.uid}: Found ${loginsSnapshot.size} documents.`);
          loginsSnapshot.forEach(doc => console.log(`[DEBUG] Login Doc ID: ${doc.id}, LoggedInAt: ${doc.data().loggedInAt?.toDate()}`));
          setActiveLoginDays(loginsSnapshot.size);

          console.log(`[DEBUG] Poses Analyzed Query (Past 30 Days) for ${user.uid}: Found ${analysesSnapshot.size} documents.`);
          analysesSnapshot.forEach(doc => console.log(`[DEBUG] Pose Doc ID: ${doc.id}, CreatedAt: ${doc.data().createdAt?.toDate()}`));
          setPosesAnalyzedPast30Days(analysesSnapshot.size);
        })
        .catch(err => {
          console.error("Error fetching app usage stats (past 30 days):", err);
          setActiveLoginDays(0);
          setPosesAnalyzedPast30Days(0);
        })
        .finally(() => {
          setLoadingAppUsageStats(false);
        });

    } else if (!authLoading && !user) {
      setAnalyses([]);
      setLoadingAnalyses(false);
      setUserProfile(null);
      setLoadingUserProfile(false);
      setActiveLoginDays(null);
      setPosesAnalyzedPast30Days(null);
      setLoadingAppUsageStats(false);
    }
  }, [user, authLoading, toast]);

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default";
    if (score >= 75) return "secondary";
    if (score >= 50) return "outline";
    return "destructive";
  };

  const handleCopyInviteLink = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied!",
            description: "Invite link copied to your clipboard.",
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy the link. Please try manually.",
            variant: "destructive",
          });
        });
    }
  };

  const whatsappShareText = inviteLink ? `Hey! Check out SnapYoga - an awesome app to analyze and improve your yoga poses: ${inviteLink}` : '';
  const whatsappShareUrl = inviteLink ? `whatsapp://send?text=${encodeURIComponent(whatsappShareText)}` : '#';

  const handleInstagramShare = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied for Instagram!",
            description: "Paste this link in your Instagram bio or stories.",
            duration: 5000,
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy the link. Please try manually.",
            variant: "destructive",
          });
        });
    }
  };

  if (authLoading || (!user && loadingUserProfile)) {
    return (
      <AppShell>
        <div className="space-y-12 p-4 md:p-8 animate-pulse">
          <div className="bg-muted/30 p-6 rounded-lg shadow">
            <Skeleton className="h-8 w-3/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
          <Card className="w-full max-w-2xl shadow-2xl overflow-hidden mx-auto">
            <Skeleton className="w-full h-64 md:h-80" />
            <CardHeader className="text-center pt-8"><Skeleton className="h-8 w-3/5 mx-auto" /><Skeleton className="h-6 w-4/5 mx-auto mt-2" /></CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 p-8"><Skeleton className="h-12 w-3/4" /></CardContent>
          </Card>
          <Card className="w-full max-w-2xl shadow-2xl overflow-hidden mt-12 mx-auto">
            <CardHeader className="text-center pt-8"><Skeleton className="h-8 w-3/5 mx-auto" /><Skeleton className="h-6 w-4/5 mx-auto mt-2" /></CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 p-8"><Skeleton className="h-12 w-1/2" /></CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const needsOnboarding = user && !authLoading && (loadingUserProfile || !userProfile || !userProfile.onboardingCompleted);
  const showStatsDashboard = user && !authLoading && !loadingUserProfile && userProfile && userProfile.onboardingCompleted;


  return (
    <AppShell>
      <div className="flex flex-col items-center w-full">
        {user && !authLoading && (
          <div className="w-full bg-primary/5 p-4 md:p-6 rounded-lg shadow-md border border-primary/20 mb-8 md:mb-12">
            {loadingUserProfile && !userProfile ? (
              <div className="text-center py-8">
                <Skeleton className="h-10 w-3/4 mb-4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mb-6 mx-auto" />
                <Skeleton className="h-12 w-1/3 mx-auto" />
              </div>
            ) : needsOnboarding ? (
              <div className="text-center py-8">
                <UserPlus className="mx-auto h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">
                  Welcome to SnapYoga, {userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Yogi'}!
                </h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
                  Complete your profile to personalize your experience and unlock all features.
                </p>
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-7 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                  <Link href="/auth/onboarding/details">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Complete Your Profile
                  </Link>
                </Button>
              </div>
            ) : showStatsDashboard ? (
              <>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4 md:mb-6 text-center">
                  Welcome to Your Dashboard, {userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'User'}!
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  <Card className="shadow-lg lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl md:text-2xl">
                        <ListChecks className="mr-3 h-7 w-7 text-primary" />
                        Recent Pose Analyses
                      </CardTitle>
                      <CardDescription>Your last few analyzed poses. Click to view details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingAnalyses ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
                        </div>
                      ) : analyses.length > 0 ? (
                        <ul className="space-y-3">
                          {analyses.map((analysis) => (
                            <li key={analysis.id}>
                              <Link href={`/analysis/${analysis.id}`} className="block p-3 bg-card rounded-md border hover:shadow-md hover:bg-muted/50 transition-all group">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-semibold text-lg text-foreground group-hover:text-primary">{analysis.identifiedPose}</span>
                                  <Badge variant={getScoreBadgeVariant(analysis.score)} className="text-sm px-3 py-1">
                                    {analysis.score}/100
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {analysis.createdAt ? format(analysis.createdAt.toDate(), 'PPP p') : 'Date unknown'}
                                </p>
                                <p className="text-sm text-foreground/80 mt-1 truncate" title={analysis.feedback}>
                                  Feedback: {analysis.feedback.substring(0, 70)}{analysis.feedback.length > 70 ? "..." : ""}
                                </p>
                                <div className="flex justify-end items-center mt-2">
                                    <span className="text-xs text-primary group-hover:underline">View Details</span>
                                    <ChevronRight className="h-4 w-4 text-primary ml-1 transform transition-transform group-hover:translate-x-1" />
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No pose analyses found. Analyze a pose to see your progress!</p>
                      )}
                    </CardContent>
                     {analyses.length > 0 && (
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/snap-yoga">Analyze Another Pose <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    )}
                  </Card>

                  <div className="space-y-4 md:space-y-6">
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl md:text-2xl">
                          <BarChart3 className="mr-3 h-7 w-7 text-primary" />
                          App Usage (Past 30 Days)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-row justify-around items-center text-center space-x-2 md:space-x-4">
                        <div className="flex-1">
                          <div className="text-3xl md:text-4xl font-bold text-accent">
                            {loadingAppUsageStats ? <Skeleton className="h-9 w-12 md:h-10 md:w-16 inline-block" /> : activeLoginDays ?? '-'}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-1"><CalendarDays className="h-3 w-3 md:h-4 md:w-4"/>Active Days</p>
                        </div>
                        <div className="flex-1">
                           <div className="text-3xl md:text-4xl font-bold text-accent">
                            {loadingAppUsageStats ? <Skeleton className="h-9 w-12 md:h-10 md:w-16 inline-block" /> : posesAnalyzedPast30Days ?? '-'}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-1"><Activity className="h-3 w-3 md:h-4 md:w-4"/>Poses Done</p>
                        </div>
                      </CardContent>
                      { (!loadingAppUsageStats && ((activeLoginDays ?? 0) > 0 || (posesAnalyzedPast30Days ?? 0) > 0)) &&
                        <CardFooter className="pt-3 pb-4">
                             <p className="text-xs text-foreground/80 text-center w-full">Keep up the great work!</p>
                        </CardFooter>
                      }
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
              </>
            ) : null
            }

            {showStatsDashboard && (
              <Card className="w-full max-w-2xl shadow-lg mt-8 mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2 text-primary">
                    <Share2 className="h-7 w-7" />
                    Invite Friends to SnapYoga
                  </CardTitle>
                  <CardDescription className="text-center mt-1">
                    Share your love for yoga and help friends improve their practice!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Your unique invite link:</p>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="text-sm text-muted-foreground"
                        aria-label="Invite Link"
                      />
                      <Button variant="outline" size="icon" onClick={handleCopyInviteLink} title="Copy Link">
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild={!!inviteLink}
                      disabled={!inviteLink}
                    >
                      <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Share on WhatsApp
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleInstagramShare}
                      disabled={!inviteLink}
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      Share on Instagram
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground text-center w-full">
                    Sharing the link helps others discover SnapYoga.
                  </p>
                </CardFooter>
              </Card>
            )}
          </div>
        )}

         <div className="w-full max-w-2xl flex flex-col items-center justify-center py-8 md:py-6">
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
    

    