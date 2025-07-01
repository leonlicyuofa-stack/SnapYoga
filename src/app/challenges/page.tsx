
"use client";

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
import { ArrowRight, Users, PlusCircle, Crown, CalendarCheck2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
  avatarHint: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  imageUrl: string | { src: string; width: number; height: number };
  imageHint: string;
  inviteLink: string;
  status: 'active' | 'upcoming' | 'completed';
  daysInChallenge?: number;
  totalDays?: number;
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
    inviteLink: '/challenges/headstand/invite',
    status: 'active',
    daysInChallenge: 12,
    totalDays: 30,
  },
  {
    id: 'crow',
    name: 'Crow Pose (Bakasana)',
    description: 'Take on the crow pose! Build arm strength and courage. Start by practicing tucking your knees into your armpits.',
    imageUrl: { src: '/images/crow-pose-icon.jpg', width: 600, height: 400 },
    imageHint: 'crow pose yoga practice',
    inviteLink: '/challenges/crow/invite',
    status: 'upcoming',
  },
  {
    id: 'warrior',
    name: 'Warrior III (Virabhadrasana III)',
    description: 'A previous challenge to build strength and improve balance. Review your progress or try it again!',
    imageUrl: { src: 'https://placehold.co/600x400.png', width: 600, height: 400 },
    imageHint: 'yoga warrior pose',
    inviteLink: '#',
    status: 'completed',
  },
  {
    id: 'lotus',
    name: 'Lotus Pose (Padmasana)',
    description: 'A foundational meditation pose. Work on hip flexibility to sit comfortably and safely.',
    imageUrl: { src: 'https://placehold.co/600x400.png', width: 600, height: 400 },
    imageHint: 'yoga lotus pose',
    inviteLink: '#',
    status: 'upcoming',
  }
];

export default function ChallengesPage() {
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSendInvite = () => {
    if (!newFriendEmail) return;
    // Mock functionality
    console.log(`Sending invite to ${newFriendEmail}`);
    toast({
      title: "Invite Sent!",
      description: `Your friend invite to ${newFriendEmail} has been sent.`,
    });
    setNewFriendEmail('');
    setIsDialogOpen(false);
  };

  const getStatusBadge = (challenge: Challenge) => {
    switch (challenge.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  const getButtonText = (status: Challenge['status']) => {
    switch (status) {
        case 'active': return 'Invite & View Challenge';
        case 'upcoming': return 'View Challenge';
        case 'completed': return 'View Results';
        default: return 'Learn More';
    }
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center gap-3">
            <Crown className="h-10 w-10 text-primary" />
            Yoga Challenges
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Improve your practice, track your progress, and connect with friends.
          </p>
        </div>

        {/* Friends Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-7 w-7 text-primary" />
              Challenge Friends
            </CardTitle>
            <CardDescription>Add friends to join challenges and track progress together.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex -space-x-4">
              {friends.map(friend => (
                <Avatar key={friend.id} className="border-2 border-background hover:z-10 transition-transform hover:scale-110">
                  <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Friend
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a Friend</DialogTitle>
                  <DialogDescription>
                    Enter your friend's email address to send them an invitation to join you on SnapYoga.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newFriendEmail}
                      onChange={(e) => setNewFriendEmail(e.target.value)}
                      className="col-span-3"
                      placeholder="friend@example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSendInvite}>Send Invite</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Challenges List */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
            <CalendarCheck2 className="h-8 w-8 text-accent" />
            Available Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {challenges.map((challenge, index) => (
              <Card key={challenge.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group rounded-lg flex flex-col">
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
                <CardContent className="p-6 bg-card flex-grow flex flex-col">
                  <p className="text-muted-foreground mb-6 flex-grow">{challenge.description}</p>
                  <Link href={challenge.inviteLink} passHref>
                    <Button
                      size="lg"
                      className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                      aria-label={`Action for ${challenge.name}`}
                      disabled={challenge.status === 'completed'}
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
      </div>
    </AppShell>
  );
}
