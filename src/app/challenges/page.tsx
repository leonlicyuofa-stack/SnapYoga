
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Users, PlusCircle, Crown, Star, Scale, Zap, Spline, Anchor, Copy, Mail, Share2, Sun, Moon, Check, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { allCollectibles } from '@/components/features/dashboard/rock-data';
import placeholderImages from '@/lib/placeholder-images.json';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
  avatarHint: string;
}

interface Challenge {
  id:string;
  name: string;
  description: string;
  imageUrl: { src: string; width: number; height: number, hint: string };
  imageHint: string;
  detailLink: string;
  inviteLink: string;
  status: 'active' | 'upcoming' | 'completed';
  daysInChallenge?: number;
  totalDays?: number;
  difficulty: number;
  category: 'Strength' | 'Balancing' | 'Flexibility' | 'Foundational';
}

const initialFriends: Friend[] = [
  { id: '1', name: 'Elena', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'woman portrait' },
  { id: '2', name: 'Marcus', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'man portrait' },
  { id: '3', name: 'Anya', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'woman smiling' },
];

const challenges: Challenge[] = [
  {
    id: 'headstand',
    name: 'Headstand (Sirsasana)',
    description: 'Master the headstand this month! Work on your balance and core strength. Practice safely against a wall if you\'re new.',
    imageUrl: { src: '/images/headstand.png', width: 600, height: 400, hint: 'headstand yoga silhouette' },
    imageHint: 'headstand yoga silhouette',
    detailLink: '/challenges/headstand',
    inviteLink: '/challenges/headstand/invite',
    status: 'active',
    daysInChallenge: 12,
    totalDays: 30,
    difficulty: 4,
    category: 'Balancing',
  },
  {
    id: 'crow',
    name: 'Crow Pose (Bakasana)',
    description: 'Take on the crow pose! Build arm strength and courage. Start by practicing tucking your knees into your armpits.',
    imageUrl: { src: '/images/crow-pose-icon.jpg', width: 600, height: 400, hint: 'crow pose yoga practice' },
    imageHint: 'crow pose yoga practice',
    detailLink: '/challenges/crow',
    inviteLink: '/challenges/crow/invite',
    status: 'upcoming',
    difficulty: 3,
    category: 'Strength',
  },
  {
    id: 'warrior',
    name: 'Warrior III (Virabhadrasana III)',
    description: 'A previous challenge to build strength and improve balance. Review your progress or try it again!',
    imageUrl: placeholderImages.challengeImages.warrior3,
    imageHint: placeholderImages.challengeImages.warrior3.hint,
    detailLink: '#',
    inviteLink: '#',
    status: 'completed',
    difficulty: 3,
    category: 'Balancing',
  },
];

const challengesByCategory = challenges.reduce((acc, challenge) => {
  const { category } = challenge;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(challenge);
  return acc;
}, {} as Record<Challenge['category'], Challenge[]>);

const categoryOrder: Challenge['category'][] = ['Balancing', 'Strength', 'Flexibility', 'Foundational'];

const categoryIcons: Record<Challenge['category'], React.ElementType> = {
  'Balancing': Scale,
  'Strength': Zap,
  'Flexibility': Spline,
  'Foundational': Anchor,
};

function InviteFriendDialog() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [inviteLink, setInviteLink] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(window.location.origin);
    }
  }, []);

  const handleCopyLink = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        toast({
          title: "Link Copied!",
          description: "A shareable link has been copied to your clipboard.",
        });
      }).catch(err => {
        console.error("Copy failed", err);
        toast({ title: "Copy Failed", description: "Could not copy the link.", variant: "destructive" });
      });
    }
  };

  const shareText = `Hey! I'm using SnapYoga to improve my practice. You should check it out: ${inviteLink}`;
  const mailtoLink = `mailto:?subject=${encodeURIComponent("Join me on SnapYoga!")}&body=${encodeURIComponent(shareText)}`;
  const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(inviteLink)}&media=${encodeURIComponent('https://placehold.co/600x400.png')}&description=${encodeURIComponent(shareText)}`;

  const handleInstagramShare = () => {
     if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        toast({
          title: "Link Copied!",
          description: "Paste this link in your Instagram bio or stories to share.",
          duration: 5000,
        });
      }).catch(err => {
        console.error("Copy failed", err);
        toast({ title: "Copy Failed", description: "Could not copy the link.", variant: "destructive" });
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full sm:w-auto text-base px-6 py-6 rounded-full" 
          style={{ border: '0.5px solid rgba(193,154,107,0.30)', background: 'rgba(193,154,107,0.06)', color: 'rgba(193,154,107,0.85)' }}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl bg-black/50 backdrop-blur-lg border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Invite a Friend</DialogTitle>
          <DialogDescription className="text-white/80">
            Share your love for yoga! Invite friends to join you on SnapYoga using any of the options below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center p-3 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-sm font-medium">
              {t('referralBonusText')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-link">Copy your invite link</Label>
            <div className="flex space-x-2">
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="h-11 rounded-lg text-base bg-black/20 border-white/20"
              />
              <Button type="button" size="icon" onClick={handleCopyLink} className="rounded-lg bg-white/20 hover:bg-white/30">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <Button variant="outline" asChild className="rounded-lg h-11 bg-transparent border-white/20 hover:bg-white/10">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Share2 className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </Button>
             <Button variant="outline" asChild className="rounded-lg h-11 bg-transparent border-white/20 hover:bg-white/10">
              <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
                <Mail className="mr-2 h-4 w-4" /> Email
              </a>
            </Button>
             <Button variant="outline" onClick={handleInstagramShare} className="rounded-lg h-11 bg-transparent border-white/20 hover:bg-white/10">
              <Share2 className="mr-2 h-4 w-4" /> Instagram
            </Button>
             <Button variant="outline" asChild className="rounded-lg h-11 bg-transparent border-white/20 hover:bg-white/10">
              <a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer">
                <PinterestIcon className="mr-2 h-4 w-4" /> Pinterest
              </a>
            </Button>
          </div>
        </div>
        <DialogFooter>
          <p className="text-xs text-white/70 text-center w-full">Sharing is caring! Grow your yoga community.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const [friends] = useState<Friend[]>(initialFriends);
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [completedToday, setCompletedToday] = useState<Record<string, boolean>>({});
  const [isMarkingLoading, setIsMarkingLoading] = useState<string | null>(null);

  // Practiced Days state
  const [practicedDaysCount, setPracticedDaysCount] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState(30);
  const [isLoadingPracticed, setIsLoadingPracticed] = useState(true);

  // Collection Mock Data
  const collectedIds = ['welcome_mat', 'first_analysis_block', 'join_challenge_strap'];

  useEffect(() => {
    if (!user) return;
    const fetchCompletions = async () => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const completionsRef = collection(firestore, `users/${user.uid}/challengeTasks`);
      const q = query(completionsRef, where('__name__', '>=', todayStr), where('__name__', '<=', todayStr + '\uf8ff'));
      const snap = await getDocs(q);
      const done: Record<string, boolean> = {};
      snap.forEach(doc => {
        const id = doc.id.split('_')[1];
        if (id) done[id] = true;
      });
      setCompletedToday(done);
    };

    const fetchPracticedDays = async () => {
      setIsLoadingPracticed(true);
      try {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const total = getDaysInMonth(now);
        setDaysInMonth(total);

        // 1. Fetch Activity
        const activityRef = collection(firestore, `users/${user.uid}/activity`);
        const activitySnap = await getDocs(query(activityRef, where('__name__', '>=', format(start, 'yyyy-MM-dd')), where('__name__', '<=', format(end, 'yyyy-MM-dd'))));
        const activityDates = new Set(activitySnap.docs.map(doc => doc.id));

        // 2. Fetch Analyses
        const analysesRef = collection(firestore, `users/${user.uid}/poseAnalyses`);
        const analysesSnap = await getDocs(query(analysesRef, where('createdAt', '>=', start), where('createdAt', '<=', end)));
        const analysesDates = new Set(analysesSnap.docs.map(doc => {
            const data = doc.data();
            return data.createdAt ? format(data.createdAt.toDate(), 'yyyy-MM-dd') : null;
        }).filter(Boolean));

        // 3. Fetch Challenge Tasks
        const tasksRef = collection(firestore, `users/${user.uid}/challengeTasks`);
        const tasksSnap = await getDocs(query(tasksRef, where('__name__', '>=', format(start, 'yyyy-MM-dd')), where('__name__', '<=', format(end, 'yyyy-MM-dd') + '\uf8ff')));
        const tasksDates = new Set(tasksSnap.docs.map(doc => doc.id.split('_')[0]));

        let count = 0;
        const currentDay = now.getDate();
        for (let i = 1; i <= currentDay; i++) {
          const dateStr = format(new Date(now.getFullYear(), now.getMonth(), i), 'yyyy-MM-dd');
          if (activityDates.has(dateStr) && analysesDates.has(dateStr) && tasksDates.has(dateStr)) {
            count++;
          }
        }
        setPracticedDaysCount(count);
      } catch (err) {
        console.error("Error calculating practiced days:", err);
      } finally {
        setIsLoadingPracticed(false);
      }
    };

    fetchCompletions();
    fetchPracticedDays();
  }, [user]);

  const handleMarkComplete = async (challengeId: string) => {
    if (!user) return;
    setIsMarkingLoading(challengeId);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const docId = `${todayStr}_${challengeId}`;
    try {
      await setDoc(doc(firestore, `users/${user.uid}/challengeTasks/${docId}`), {
        challengeId,
        completedAt: serverTimestamp(),
      });
      setCompletedToday(prev => ({ ...prev, [challengeId]: true }));
      toast({ title: "Task Complete!", description: "Today's challenge task has been recorded." });
    } catch (e) {
      console.error("Failed to record task", e);
      toast({ title: "Error", description: "Failed to mark task as complete.", variant: "destructive" });
    } finally {
      setIsMarkingLoading(null);
    }
  };
  
  const getStatusBadge = (challenge: Challenge) => {
    switch (challenge.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-yellow-600 text-black">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-white/10 text-white border-white/20">Completed</Badge>;
      default:
        return null;
    }
  };

  const getButtonText = (status: Challenge['status']) => {
    switch (status) {
        case 'active': return 'View Challenge';
        case 'upcoming': return 'View Challenge';
        case 'completed': return 'View Results';
        default: return 'Learn More';
    }
  }

  const sectionCardStyle = {
    borderRadius: '24px 12px 24px 24px',
    border: '0.5px solid rgba(193,154,107,0.18)',
    background: 'rgba(13,20,30,0.50)',
    backdropFilter: 'blur(14px)'
  };

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div className="container mx-auto px-4 py-8">
          <header className="mb-8 flex items-start justify-between">
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: 'rgba(255,240,215,0.92)' }} className="text-3xl font-bold flex items-center gap-3">
                    <Crown className="h-8 w-8" style={{ color: 'rgba(193,154,107,0.85)' }} />
                    Yoga Challenges
                </h1>
                <p style={{ color: 'rgba(255,240,215,0.40)', fontStyle: 'italic' }} className="text-md mt-1">Improve your practice and connect with friends.</p>
                <div style={{ width: 26, height: 1, background: 'rgba(193,154,107,0.22)', marginTop: 8 }} />
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(193,154,107,0.30)',
                  background: 'rgba(193,154,107,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {isDark
                  ? <Sun style={{ width: 14, height: 14, color: 'rgba(193,154,107,0.75)' }} />
                  : <Moon style={{ width: 14, height: 14, color: 'rgba(193,154,107,0.75)' }} />
                }
              </button>
          </header>

          <main className="space-y-12 pb-12">
            
            {/* A. THIS MONTH'S PRACTICE */}
            <div className="w-full p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700" style={sectionCardStyle}>
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-baseline gap-2">
                     <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 600, color: 'rgba(255,240,215,0.94)', lineHeight: 1 }}>
                       {isLoadingPracticed ? "—" : practicedDaysCount}
                     </span>
                     <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, color: 'rgba(193,154,107,0.70)' }}>
                       / {daysInMonth}
                     </span>
                  </div>
                  <p style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.60)', fontWeight: 600, marginTop: 4 }}>
                    days practiced
                  </p>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 16, color: 'rgba(255,240,215,0.60)' }}>
                    Practice daily to fill your month
                  </p>
                </div>
              </div>

              <div style={{ height: 14, background: 'rgba(255,240,215,0.08)', borderRadius: 8, overflow: 'hidden' }}>
                 <div 
                   style={{ 
                     height: '100%', 
                     width: `${(practicedDaysCount / daysInMonth) * 100}%`,
                     background: 'linear-gradient(90deg, rgba(193,154,107,0.7), rgba(210,180,110,0.95))',
                     borderRadius: 8,
                     transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                   }}
                 />
              </div>
            </div>

            {/* B. YOUR COLLECTION */}
            <Link href="/yoga-collection" className="block active:scale-[0.99] transition-transform">
              <div className="w-full p-6 shadow-xl" style={sectionCardStyle}>
                <div className="flex justify-between items-center mb-6">
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: 'rgba(255,240,215,0.92)' }}>Your Collection</h2>
                  <span style={{ fontSize: 11, color: 'rgba(193,154,107,0.60)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {collectedIds.length} of {allCollectibles.length} collected · tap to view ›
                  </span>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {allCollectibles.map((item) => {
                    const isCollected = collectedIds.includes(item.id);
                    return (
                      <div key={item.id} className="flex-shrink-0 relative group">
                        <div 
                          className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500",
                            isCollected 
                              ? "border-[rgba(193,154,107,0.4)] bg-[rgba(193,154,107,0.1)]" 
                              : "border-white/5 bg-white/5"
                          )}
                        >
                          {isCollected ? (
                            <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-full" />
                          ) : (
                            <Lock className="w-4 h-4 text-white/10" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Link>

            {/* C. ACTIVE CHALLENGES */}
            <div className="space-y-12">
              {categoryOrder.map((category) => {
                const challengesInCategory = challengesByCategory[category];
                if (!challengesInCategory) return null;
                const Icon = categoryIcons[category];
                return (
                  <div key={category}>
                    <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3 text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      <Icon className="h-6 w-6 text-white/50" />
                      {category} Challenges
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {challengesInCategory.map((challenge, index) => (
                        <Card key={challenge.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-2xl flex flex-col text-white" style={sectionCardStyle}>
                          <div className="relative w-full h-60">
                            <Image
                              src={challenge.imageUrl.src}
                              alt={challenge.name}
                              fill
                              priority={index < 2}
                              data-ai-hint={challenge.imageHint}
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-4">
                              <div className="flex justify-between items-start">
                                  {getStatusBadge(challenge)}
                                  {challenge.status === 'active' && challenge.daysInChallenge && (
                                    <Badge variant="destructive" className="bg-red-500/80">
                                      Day {challenge.daysInChallenge} / {challenge.totalDays}
                                    </Badge>
                                  )}
                              </div>
                              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{challenge.name}</h2>
                            </div>
                          </div>
                          <CardContent className="p-6 flex-grow flex flex-col space-y-6">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("h-4 w-4", i < challenge.difficulty ? "text-yellow-400 fill-yellow-400" : "text-white/10")} />
                                ))}
                              </div>
                              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{challenge.category}</span>
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed flex-grow">{challenge.description}</p>
                            <div className="space-y-3 pt-2">
                              {challenge.status === 'active' && (
                                <Button 
                                  onClick={() => handleMarkComplete(challenge.id)}
                                  disabled={!!completedToday[challenge.id] || isMarkingLoading === challenge.id}
                                  className={cn(
                                    "w-full h-12 rounded-full font-bold transition-all",
                                    completedToday[challenge.id] 
                                      ? "bg-green-600/20 border border-green-600/40 text-green-400"
                                      : "bg-[rgba(193,154,107,0.85)] text-[rgba(25,16,8,0.95)] hover:opacity-90"
                                  )}
                                >
                                  {isMarkingLoading === challenge.id ? <SmileyRockLoader /> : completedToday[challenge.id] ? <><Check className="mr-2 h-4 w-4" /> Completed Today</> : "Mark Today Complete"}
                                </Button>
                              )}
                              <Link href={challenge.detailLink} passHref className="block">
                                <Button
                                  variant="outline"
                                  className="w-full h-12 text-sm bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-full"
                                  disabled={challenge.detailLink === '#'}
                                >
                                  {getButtonText(challenge.status)}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* D. CHALLENGES WITH FRIENDS (AT THE BOTTOM) */}
            <Card className="w-full shadow-2xl text-white overflow-hidden" style={sectionCardStyle}>
              <CardHeader className="text-center pt-10">
                <CardTitle style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'rgba(255,240,215,0.92)' }} className="text-3xl font-semibold flex items-center justify-center gap-3">
                  <Users className="h-7 w-7" style={{ color: 'rgba(193,154,107,0.80)' }} />
                  {t('challengesWithFriendsTitle')}
                </CardTitle>
                <CardDescription className="text-white/60 mt-2 max-w-sm mx-auto text-sm italic">
                  {t('challengesWithFriendsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-8 p-10">
                <div className="flex -space-x-4">
                  {friends.map(friend => (
                    <Avatar key={friend.id} className="h-14 w-14 border-4 border-[rgba(25,16,8,0.5)] transition-transform hover:scale-110">
                      <AvatarImage src={friend.avatarUrl} alt={friend.name} data-ai-hint={friend.avatarHint} />
                      <AvatarFallback className="bg-white/10 text-white/50">{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <InviteFriendDialog />
              </CardContent>
            </Card>

          </main>
      </div>
    </AppShell>
  );
}
