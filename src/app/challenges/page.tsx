
"use client";

import * as React from 'react';
import { useState } from 'react';
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
import { ArrowRight, Users, PlusCircle, Crown, Star, Scale, Zap, Spline, Anchor, Copy, Mail, Share2, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { RockWheelDialog } from '@/components/features/dashboard/rock-wheel-dialog';
import { RewardDialog } from '@/components/features/dashboard/reward-dialog';
import type { Collectible } from '@/components/features/dashboard/rock-data';

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
  imageUrl: string | { src: string; width: number; height: number };
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
    imageUrl: { src: '/images/headstand.png', width: 600, height: 400 },
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
    imageUrl: { src: '/images/crow-pose-icon.jpg', width: 600, height: 400 },
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
    imageUrl: { src: 'https://picsum.photos/seed/warrior3/600/400', width: 600, height: 400 },
    imageHint: 'warrior 3 yoga pose',
    detailLink: '#',
    inviteLink: '#',
    status: 'completed',
    difficulty: 3,
    category: 'Balancing',
  },
  {
    id: 'lotus',
    name: 'Lotus Pose (Padmasana)',
    description: 'A foundational meditation pose. Work on hip flexibility to sit comfortably and safely.',
    imageUrl: { src: 'https://picsum.photos/seed/lotus/600/400', width: 600, height: 400 },
    imageHint: 'yoga lotus pose',
    detailLink: '#',
    inviteLink: '#',
    status: 'upcoming',
    difficulty: 2,
    category: 'Foundational',
  },
  {
    id: 'triangle',
    name: 'Triangle Pose (Trikonasana)',
    description: 'Improve your stability and stretch your hamstrings and spine with this classic standing pose.',
    imageUrl: { src: 'https://picsum.photos/seed/trikonasana/600/400', width: 600, height: 400 },
    imageHint: 'yoga triangle pose',
    detailLink: '#',
    inviteLink: '#',
    status: 'upcoming',
    difficulty: 2,
    category: 'Foundational',
  },
  {
    id: 'pigeon',
    name: 'Pigeon Pose (Kapotasana)',
    description: 'A deep hip opener that helps relieve tension and increase flexibility in the hip flexors.',
    imageUrl: { src: 'https://picsum.photos/seed/pigeonpose/600/400', width: 600, height: 400 },
    imageHint: 'yoga pigeon pose',
    detailLink: '#',
    inviteLink: '#',
    status: 'upcoming',
    difficulty: 3,
    category: 'Flexibility',
  },
  {
    id: 'tree',
    name: 'Tree Pose (Vrikshasana)',
    description: 'Enhance your balance, focus, and concentration with this fundamental standing balance pose.',
    imageUrl: { src: 'https://picsum.photos/seed/treepose/600/400', width: 600, height: 400 },
    imageHint: 'yoga tree pose',
    detailLink: '#',
    inviteLink: '#',
    status: 'upcoming',
    difficulty: 2,
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
      // A generic invite link to the app's homepage/dashboard
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
        <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 py-6 rounded-xl bg-transparent border-white/20 hover:bg-white/10">
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
  const [friends] = useState<Friend[]>(initialFriends);
  const { t } = useLanguage();
  const [showRockWheelDialog, setShowRockWheelDialog] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [rewardedRock, setRewardedRock] = useState<Collectible | null>(null);

  const handleRockReward = (rock: Collectible) => {
    setShowRockWheelDialog(false);
    setRewardedRock(rock);
    setShowRewardDialog(true);
    // In a real app, you would also save this rock to the user's collection in Firestore
    console.log("User won rock:", rock.name);
  }
  
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

  return (
    <AppShell>
      <RockWheelDialog 
            isOpen={showRockWheelDialog} 
            onClose={() => setShowRockWheelDialog(false)}
            onReward={handleRockReward}
      />
      {rewardedRock && (
          <RewardDialog 
            isOpen={showRewardDialog} 
            onClose={() => setShowRewardDialog(false)} 
            rock={rewardedRock} 
          />
      )}
      <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Crown className="h-8 w-8" />
                    Yoga Challenges
                </h1>
                <p className="text-md text-white/80">Improve your practice, track your progress, and connect with friends.</p>
            </header>
            <main className="flex-grow space-y-12">
              <Card className="w-full shadow-2xl overflow-hidden bg-black/20 backdrop-blur-lg rounded-2xl border border-white/20 text-white">
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-3xl font-semibold flex items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-white" />
                    {t('challengesWithFriendsTitle')}
                  </CardTitle>
                  <CardDescription className="text-lg text-white/80 mt-2 max-w-md mx-auto">
                    {t('challengesWithFriendsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 p-8">
                  <div className="flex -space-x-6">
                    {friends.map(friend => (
                      <Avatar key={friend.id} className="h-16 w-16 border-4 border-black/50 hover:z-10 transition-transform hover:scale-110">
                        <AvatarImage src={friend.avatarUrl} alt={friend.name} data-ai-hint={friend.avatarHint} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <InviteFriendDialog />
                </CardContent>
              </Card>

              <Card className="w-full shadow-lg rounded-2xl border border-white/20 bg-black/20 backdrop-blur-lg text-white mb-12">
                  <CardHeader>
                      <CardTitle className="flex items-center text-xl md:text-2xl">
                          <Gift className="mr-3 h-7 w-7 text-white" />
                          Challenge Rewards
                      </CardTitle>
                      <CardDescription className="text-white/80">
                          You've completed the Headstand Challenge! Claim your reward.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button onClick={() => setShowRockWheelDialog(true)} className="w-full rounded-lg bg-white/90 text-black hover:bg-white" size="lg">
                          Claim Your Item!
                      </Button>
                  </CardContent>
              </Card>

              <div className="space-y-12">
                {categoryOrder.map((category) => {
                  const challengesInCategory = challengesByCategory[category];
                  if (!challengesInCategory) return null;
                  const Icon = categoryIcons[category];
                  return (
                    <div key={category}>
                      <h2 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3 text-white">
                        <Icon className="h-8 w-8 text-white/90" />
                        {category} Challenges
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {challengesInCategory.map((challenge, index) => (
                          <Card key={challenge.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group rounded-2xl flex flex-col bg-black/20 backdrop-blur-lg border border-white/20 text-white">
                            <div className="relative w-full h-64">
                              <Image
                                src={typeof challenge.imageUrl === 'string' ? challenge.imageUrl : challenge.imageUrl.src}
                                alt={`${challenge.name} background`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={index < 2}
                                data-ai-hint={challenge.imageHint}
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-between p-4">
                                <div className="flex justify-between items-start">
                                    {getStatusBadge(challenge)}
                                    {challenge.status === 'active' && challenge.daysInChallenge && (
                                      <Badge variant="destructive">
                                        Day {challenge.daysInChallenge} / {challenge.totalDays}
                                      </Badge>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">{challenge.name}</h2>
                              </div>
                            </div>
                            <CardContent className="p-6 bg-black/20 flex-grow flex flex-col">
                              <div className="flex justify-between items-center mb-4">
                                <p className="text-white/70 text-sm">Difficulty:</p>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-5 w-5",
                                        i < challenge.difficulty
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-white/30"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-white/80 mb-6 flex-grow">{challenge.description}</p>
                              <Link href={challenge.detailLink} passHref>
                                <Button
                                  size="lg"
                                  className="w-full text-lg py-6 bg-white/90 hover:bg-white text-black shadow-md hover:shadow-lg transition-all transform hover:scale-105 rounded-lg"
                                  aria-label={`Action for ${challenge.name}`}
                                  disabled={challenge.detailLink === '#'}
                                >
                                  {getButtonText(challenge.status)}
                                  <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>
      </div>
    </AppShell>
  );
}
