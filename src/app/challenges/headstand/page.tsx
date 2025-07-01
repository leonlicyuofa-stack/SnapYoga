
"use client";

import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Video, Users, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const challengeDetails = {
    name: 'Headstand (Sirsasana) Challenge',
    description: 'This 30-day challenge is designed to safely guide you towards mastering the headstand (Sirsasana). We will focus on building the necessary core strength, shoulder stability, and balance. Remember to always practice near a wall for support and listen to your body.',
    difficulty: 4,
    imageUrl: '/images/headstand.png',
    imageHint: 'headstand yoga silhouette',
    inviteLink: '/challenges/headstand/invite',
    totalParticipants: 152,
    friendsInChallenge: 2,
};

const tutorialVideos = [
    { id: 'vid1', title: 'Week 1: Core & Shoulder Prep', embedUrl: 'https://www.youtube.com/embed/tKAs69_N3aE' },
    { id: 'vid2', title: 'Week 2: Dolphin Pose & Tripod Foundation', embedUrl: 'https://www.youtube.com/embed/jK0arm2R2gU' },
    { id: 'vid3', title: 'Week 3: Safely Kicking Up', embedUrl: 'https://www.youtube.com/embed/44mgUselcDU' },
    { id: 'vid4', title: 'Week 4: Holding the Pose & Variations', embedUrl: 'https://www.youtube.com/embed/n3uQ227u1C8' },
];

export default function HeadstandChallengePage() {
    return (
        <AppShell>
            <div className="container mx-auto px-4 py-12">
                <Button variant="outline" asChild className="mb-8 group">
                    <Link href="/challenges">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Challenges
                    </Link>
                </Button>

                <Card className="shadow-xl overflow-hidden">
                    <div className="relative w-full h-64 md:h-80">
                         <Image
                            src={challengeDetails.imageUrl}
                            alt={challengeDetails.name}
                            fill
                            className="object-cover"
                            data-ai-hint={challengeDetails.imageHint}
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                         <div className="absolute bottom-0 left-0 p-6 md:p-8">
                             <h1 className="text-3xl md:text-4xl font-extrabold text-white">{challengeDetails.name}</h1>
                             <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2">
                                <Badge variant="destructive">Active Challenge</Badge>
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={cn("h-5 w-5", i < challengeDetails.difficulty ? "text-yellow-400 fill-yellow-400" : "text-gray-400")} />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 text-white/90">
                                    <Users className="h-5 w-5" />
                                    <span className="font-medium">{challengeDetails.totalParticipants} participants ({challengeDetails.friendsInChallenge} {challengeDetails.friendsInChallenge === 1 ? 'friend' : 'friends'})</span>
                                </div>
                             </div>
                         </div>
                    </div>
                    <CardContent className="p-6 md:p-8">
                        <p className="text-lg text-muted-foreground leading-relaxed">{challengeDetails.description}</p>
                        <Separator className="my-8" />
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="w-full sm:w-auto flex-grow text-lg py-7 bg-primary hover:bg-primary/90" asChild>
                               <Link href="/snap-yoga">
                                    <Video className="mr-2 h-5 w-5" />
                                    Analyze My Headstand
                               </Link>
                            </Button>
                            <Button size="lg" variant="accent" asChild className="w-full sm:w-auto flex-grow text-lg py-7">
                                <Link href={challengeDetails.inviteLink}>
                                    <Users className="mr-2 h-5 w-5" />
                                    Invite Friends
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-6 text-center">Challenge Guide: Video Tutorials</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {tutorialVideos.map((video) => (
                            <Card key={video.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                <div className="aspect-video">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={video.embedUrl}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-t-lg"
                                    ></iframe>
                                </div>
                                <CardHeader>
                                    <CardTitle>{video.title}</CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>
        </AppShell>
    );
}
