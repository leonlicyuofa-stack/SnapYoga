
"use client";

import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Video, Users, Star, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const challengeDetails = {
    name: 'Crow Pose (Bakasana) Challenge',
    description: "Ready to take flight? This challenge focuses on building the arm and core strength, balance, and confidence needed for Crow Pose. We'll break it down into manageable steps to help you lift off.",
    difficulty: 3,
    imageUrl: '/images/crow-pose-icon.jpg',
    imageHint: 'crow pose yoga practice',
    inviteLink: '/challenges/crow/invite',
    totalParticipants: 87,
    friendsInChallengeCount: 1,
};

const weeklyTutorials = [
    {
        week: 1,
        title: "Building the Foundation",
        videos: [
            { day: 1, title: 'Wrist & Hand Preparation', description: 'Crow pose puts a lot of pressure on the wrists. Today, we focus on warm-ups and correct hand placement to build a solid, safe foundation.', embedUrl: 'https://www.youtube.com/embed/wg7-tV2fKAo' },
            { day: 3, title: 'Core & Hip Flexor Activation', description: 'Learn to engage your deep core muscles and hip flexors. This is the secret to getting your knees high up on your arms and feeling light.', embedUrl: 'https://www.youtube.com/embed/4R2-j2hD-i4' },
            { day: 5, title: 'The "Shelf": Knee-to-Arm Connection', description: 'Practice creating a stable shelf with your upper arms for your knees. We will work on drills to find this connection without lifting off yet.', embedUrl: 'https://www.youtube.com/embed/kZUa_d_W6fA' },
        ]
    },
    {
        week: 2,
        title: "Learning to Fly",
        videos: [
            { day: 8, title: 'Weight Shifting & The Lean', description: 'Confidence comes from learning to shift your weight forward. Using blocks for support, we will practice leaning into our hands safely.', embedUrl: 'https://www.youtube.com/embed/O-MvQ42I36I' },
            { day: 10, title: 'Lifting One Foot at a Time', description: 'The moment of truth! From the leaned position, we will practice lifting one foot, then the other, getting used to the feeling of flying.', embedUrl: 'https://www.youtube.com/embed/tKAs69_N3aE' },
            { day: 12, title: 'Holding Crow & Controlled Exit', description: 'Once you find your balance, holding the pose is the next step. We will also practice how to exit the pose gracefully and safely.', embedUrl: 'https://www.youtube.com/embed/jK0arm2R2gU' },
        ]
    }
];


const friendsInChallenge = [
    { id: 'f3', name: 'Anya', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'woman smiling', daysIn: 5 },
];


export default function CrowPoseChallengePage() {
    return (
        <AppShell>
            <div className="container mx-auto px-4 py-12">
                <Button variant="outline" asChild className="mb-8 group bg-black/20 border-white/20 hover:bg-white/10 text-white">
                    <Link href="/challenges">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Challenges
                    </Link>
                </Button>

                <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-xl">
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
                            <Badge variant="secondary" className="bg-yellow-600 text-black">Upcoming Challenge</Badge>
                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-5 w-5", i < challengeDetails.difficulty ? "text-yellow-400 fill-yellow-400" : "text-gray-400")} />
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <Users className="h-5 w-5" />
                                <span className="font-medium">{challengeDetails.totalParticipants} participants ({challengeDetails.friendsInChallengeCount} {challengeDetails.friendsInChallengeCount === 1 ? 'friend' : 'friends'})</span>
                            </div>
                         </div>
                     </div>
                </div>
                <div className="p-6 md:p-8 bg-black/20 backdrop-blur-lg border border-white/20 rounded-b-lg shadow-xl mb-12">
                    <p className="text-lg text-white/80 leading-relaxed">{challengeDetails.description}</p>
                    <Separator className="my-8 bg-white/20" />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="w-full sm:w-auto flex-grow text-lg py-7 bg-white/90 text-black hover:bg-white" asChild>
                            <Link href="/snap-yoga">
                              <Video className="mr-2 h-5 w-5" />
                              Analyze My Crow Pose
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="w-full sm:w-auto flex-grow text-lg py-7 bg-transparent border-white/20 hover:bg-white/10 text-white">
                            <Link href={challengeDetails.inviteLink}>
                                <Users className="mr-2 h-5 w-5" />
                                Invite Friends
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Friends in Challenge Section */}
                <div className="mt-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-6 text-center text-white">Friends in this Challenge</h2>
                    {friendsInChallenge.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {friendsInChallenge.map((friend) => (
                                <Card key={friend.id} className="text-center p-4 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center bg-black/20 backdrop-blur-lg border border-white/20 text-white">
                                    <Avatar className="h-20 w-20 border-4 border-white/20">
                                        <AvatarImage src={friend.avatarUrl} alt={friend.name} data-ai-hint={friend.avatarHint} />
                                        <AvatarFallback className="bg-white/10">{friend.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <CardHeader className="p-2 pb-0">
                                        <CardTitle className="text-lg">{friend.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2 pt-1 flex flex-col items-center gap-2">
                                        <Badge variant="secondary" className="bg-white/10 text-white border-white/20">In Challenge</Badge>
                                        <div className="flex items-center text-xs text-white/70">
                                            <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
                                            Day {friend.daysIn}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-white/70">Invite friends to join you in this challenge!</p>
                    )}
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-8 text-center text-white">Challenge Guide: Weekly Tutorials</h2>
                    <div className="space-y-12 max-w-4xl mx-auto">
                        {weeklyTutorials.map((week, index) => (
                            <section key={week.week}>
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-white">Week {week.week}: {week.title}</h3>
                                    <p className="text-white/70">Focus on these key steps to build your confidence.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-8">
                                    {week.videos.map((video) => (
                                        <Card key={video.day} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow w-full bg-black/20 backdrop-blur-lg border-white/20 text-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                                                <div className="aspect-video">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={video.embedUrl}
                                                        title={video.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="md:rounded-l-lg"
                                                    ></iframe>
                                                </div>
                                                <div className="p-6">
                                                    <Badge variant="default" className="mb-2 bg-white/90 text-black">Day {video.day}</Badge>
                                                    <CardTitle className="mb-2 text-xl">{video.title}</CardTitle>
                                                    <CardDescription className="text-base text-white/80 leading-relaxed">
                                                        {video.description}
                                                    </CardDescription>
                                                </div>
                                        </div>
                                        </Card>
                                    ))}
                                </div>
                                {index < weeklyTutorials.length - 1 && <Separator className="mt-12 bg-white/20" />}
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
