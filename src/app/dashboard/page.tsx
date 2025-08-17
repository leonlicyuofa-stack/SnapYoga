
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, ArrowRight, Users, ListChecks, CalendarDays, Trophy, Eye, Copy, MessageSquare, Share2, PlayCircle, UserPlus, BarChart3, Activity, ChevronRight, AlertCircle, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import type { Timestamp, DocumentData } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LuckyWheelDialog } from '@/components/features/homepage/lucky-wheel-dialog'; 
import { RockCollectionCard } from '@/components/features/dashboard/rock-collection-card';
import { RewardDialog } from '@/components/features/dashboard/reward-dialog';
import { RockWheelDialog } from '@/components/features/dashboard/rock-wheel-dialog';
import { allRocks, type Rock } from '@/components/features/dashboard/rock-data';
import { WelcomeRock } from '@/components/icons/rocks/welcome-rock';
import { useLanguage } from '@/contexts/LanguageContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { PebbleTrioIcon } from '@/components/icons/PebbleTrioIcon';
import { HowToGuideDialog } from '@/components/features/dashboard/how-to-guide-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuoteCarousel } from '@/components/features/dashboard/QuoteCarousel';


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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [inviteLink, setInviteLink] = useState('');
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(true);

  const [activeLoginDays, setActiveLoginDays] = useState<number | null>(null);
  const [posesAnalyzedPast30Days, setPosesAnalyzedPast30Days] = useState<number | null>(null);
  const [loadingAppUsageStats, setLoadingAppUsageStats] = useState(true);

  const [showLuckyWheelDialog, setShowLuckyWheelDialog] = useState(false);
  const [showRockWheelDialog, setShowRockWheelDialog] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [rewardedRock, setRewardedRock] = useState<Rock | null>(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [showHowToGuide, setShowHowToGuide] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(window.location.origin);

      const hasSeenWheel = sessionStorage.getItem('seenLuckyWheelSnapYoga');
      if (!authLoading && !hasSeenWheel) { 
        setShowLuckyWheelDialog(true);
        sessionStorage.setItem('seenLuckyWheelSnapYoga', 'true');
      }

      if (sessionStorage.getItem('justCompletedOnboarding') === 'true') {
        setShowWelcomeAnimation(true);
        const welcomeRock = allRocks.find(r => r.id === 'welcome');
        if (welcomeRock) {
            setRewardedRock(welcomeRock);
            // Delay showing the reward dialog until after the welcome animation
            setTimeout(() => {
              setShowRewardDialog(true);
            }, 3000);
        }
        sessionStorage.removeItem('justCompletedOnboarding');
        setTimeout(() => {
          setShowWelcomeAnimation(false);
        }, 2500);
      }
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

  const handleRockReward = (rock: Rock) => {
      setShowRockWheelDialog(false);
      setRewardedRock(rock);
      setShowRewardDialog(true);
      // In a real app, you would also save this rock to the user's collection in Firestore
      console.log("User won rock:", rock.name);
  }

  const handleRewardDialogClose = () => {
    setShowRewardDialog(false);
    // After the user closes the reward dialog, show the "How to" guide.
    setShowHowToGuide(true);
  }

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
  
  const getInitials = (email?: string | null, displayName?: string | null) => {
    if (displayName) {
      const names = displayName.split(' ');
      if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };
  
  const shareText = inviteLink ? `Hey! Check out SnapYoga - an awesome app to analyze and improve your yoga poses: ${inviteLink}` : '';
  const whatsappShareUrl = inviteLink ? `whatsapp://send?text=${encodeURIComponent(shareText)}` : '#';
  const pinterestShareUrl = inviteLink ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(inviteLink)}&media=${encodeURIComponent('https://placehold.co/600x400.png')}&description=${encodeURIComponent(shareText)}` : '#';
  
  const handleTikTokShare = () => {
    if (navigator.clipboard && inviteLink) {
        navigator.clipboard.writeText(inviteLink).then(() => {
            toast({
                title: "Link Copied for TikTok!",
                description: "Paste this link in your TikTok bio or video description.",
                duration: 5000,
            });
        });
    }
  };


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

  if (authLoading || (!user && loadingUserProfile) || showWelcomeAnimation) {
    return (
      <AppShell>
         {showWelcomeAnimation ? (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-center animate-in fade-in duration-500">
                <PebbleTrioIcon className="h-40 w-40" />
                <h2 className="text-3xl font-bold mt-4 text-primary animate-pulse">Welcome to SnapYoga!</h2>
                <p className="text-muted-foreground mt-2">Setting up your dashboard...</p>
            </div>
          ) : (
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
                <CardHeader className="text-center pt-8">
                  <Skeleton className="h-10 w-4/5 mx-auto mb-3" />
                  <Skeleton className="h-6 w-3/5 mx-auto" />
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4 p-8 min-h-[200px] justify-center">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-1/4" />
                </CardContent>
              </Card>
              <Card className="w-full max-w-2xl shadow-2xl overflow-hidden mt-12 mx-auto">
                <CardHeader className="text-center pt-8"><Skeleton className="h-8 w-3/5 mx-auto" /><Skeleton className="h-6 w-4/5 mx-auto mt-2" /></CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 p-8"><Skeleton className="h-12 w-1/2" /></CardContent>
              </Card>
            </div>
          )}
      </AppShell>
    );
  }

  const needsOnboarding = user && !authLoading && (loadingUserProfile || !userProfile || !userProfile.onboardingCompleted);
  const showStatsDashboard = user && !authLoading && !loadingUserProfile && userProfile && userProfile.onboardingCompleted;
  
  const welcomeName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';


  return (
    <AppShell>
        <LuckyWheelDialog isOpen={showLuckyWheelDialog} onClose={() => setShowLuckyWheelDialog(false)} />
        {rewardedRock && (
          <RewardDialog 
            isOpen={showRewardDialog} 
            onClose={handleRewardDialogClose} 
            rock={rewardedRock} 
          />
        )}
        <HowToGuideDialog isOpen={showHowToGuide} onClose={() => setShowHowToGuide(false)} />
        <RockWheelDialog 
            isOpen={showRockWheelDialog} 
            onClose={() => setShowRockWheelDialog(false)}
            onReward={handleRockReward}
        />
        <div className="flex flex-col items-center w-full">
            <QuoteCarousel />

          {user && !authLoading && (
            <div className="w-full bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-md border border-border mb-8 md:mb-12 mt-8">
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
                    Welcome to SnapYoga, {welcomeName}!
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
                    Complete your profile to personalize your experience and unlock all features.
                  </p>
                  <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-7 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    <Link href="/onboarding/gender-profile">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Complete Your Profile
                    </Link>
                  </Button>
                </div>
              ) : showStatsDashboard ? (
                <>
                  <Card className="shadow-lg mb-6">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-20 w-20 border-4 border-primary/20">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback>{getInitials(user.email, user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{welcomeName}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span><strong className="text-foreground">{loadingAppUsageStats ? <Skeleton className="h-4 w-8 inline-block" /> : activeLoginDays ?? '-'}</strong> {t('activeDays')}</span>
                                <span><strong className="text-foreground">{loadingAppUsageStats ? <Skeleton className="h-4 w-8 inline-block" /> : posesAnalyzedPast30Days ?? '-'}</strong> {t('posesDone')}</span>
                            </div>
                        </div>
                    </CardHeader>
                  </Card>
                
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-4">Statistics</h3>
                    <RockCollectionCard rocks={allRocks} />
                  </div>


                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
                      <Card className="shadow-lg">
                          <CardHeader>
                              <CardTitle className="flex items-center text-xl md:text-2xl">
                                  <Gift className="mr-3 h-7 w-7 text-primary" />
                                  Challenge Rewards
                              </CardTitle>
                              <CardDescription>
                                You've completed the Headstand Challenge! Claim your reward.
                              </CardDescription>
                          </CardHeader>
                          <CardContent>
                              <Button onClick={() => setShowRockWheelDialog(true)} className="w-full" size="lg">
                                  Claim Your Rock!
                              </Button>
                          </CardContent>
                      </Card>

                      <Card className="shadow-lg bg-card/90 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center text-xl md:text-2xl">
                            <Trophy className="mr-3 h-7 w-7 text-primary" />
                            {t('friendChallengesTitle')}
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
                              {t('viewAllChallenges')}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="shadow-lg lg:col-span-2 bg-card/90 backdrop-blur-sm mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl md:text-2xl">
                          <ListChecks className="mr-3 h-7 w-7 text-primary" />
                          {t('recentAnalysesTitle')}
                        </CardTitle>
                        <CardDescription>{t('recentAnalysesDesc')}</CardDescription>
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

                </>
              ) : null
              }

              {showStatsDashboard && (
                <Card className="w-full max-w-2xl shadow-lg mt-8 mx-auto bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2 text-primary">
                      <Share2 className="h-7 w-7" />
                      {t('inviteFriendsTitle')}
                    </CardTitle>
                    <CardDescription className="text-center mt-1">
                      {t('inviteFriendsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="text-center p-3 bg-green-100/50 text-green-800 border border-green-200 rounded-md text-sm font-medium">
                        {t('referralBonusText')}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t('yourInviteLink')}</p>
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
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Button variant="outline" className="w-full" asChild disabled={!inviteLink}>
                        <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="mr-2 h-5 w-5" /> WhatsApp
                        </a>
                      </Button>
                       <Button variant="outline" className="w-full" onClick={handleInstagramShare} disabled={!inviteLink}>
                         <Share2 className="mr-2 h-5 w-5" /> Instagram
                      </Button>
                      <Button variant="outline" className="w-full" asChild disabled={!inviteLink}>
                        <a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer">
                           <PinterestIcon className="mr-2 h-5 w-5" /> Pinterest
                        </a>
                      </Button>
                       <Button variant="outline" className="w-full" onClick={handleTikTokShare} disabled={!inviteLink}>
                          <TikTokIcon className="mr-2 h-5 w-5" /> TikTok
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground text-center w-full">
                      {t('inviteLinkHelp')}
                    </p>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}
              
              <Card className="w-full shadow-2xl overflow-hidden mt-12 bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-3xl font-semibold flex items-center justify-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    {t('analyzeYourPoseTitle')}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
                    {t('analyzeYourPoseDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 p-8">
                  <p className="text-center text-foreground/80">
                    {t('analyzeYourPoseHelp')}
                  </p>
                  <Link href="/snap-yoga" passHref>
                    <Button
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-7 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                      aria-label="Go to SnapYoga Analysis Page"
                    >
                      {t('startAnalyzing')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="w-full shadow-2xl overflow-hidden mt-12 bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-3xl font-semibold flex items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-primary" />
                    {t('challengesWithFriendsTitle')}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
                    {t('challengesWithFriendsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 p-8">
                  <Link href="/challenges" passHref>
                    <Button size="lg" variant="outline" className="text-lg py-7 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
                      {t('exploreChallenges')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
        </div>
    </AppShell>
  );
}

    

    
