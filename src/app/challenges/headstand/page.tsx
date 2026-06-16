
"use client";

import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Video, Users, Star, CalendarClock, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const challengeDetails = {
    id: 'headstand',
    name: 'Headstand (Sirsasana) Challenge',
    description: 'This 30-day challenge is designed to safely guide you towards mastering the headstand (Sirsasana). We will focus on building the necessary core strength, shoulder stability, and balance. Remember to always practice near a wall for support and listen to your body.',
    difficulty: 4,
    imageUrl: '/images/headstand.png',
    imageHint: 'headstand yoga silhouette',
    inviteLink: '/challenges/headstand/invite',
    totalParticipants: 152,
    friendsInChallengeCount: 2,
};

const weeklyTutorials = [
    {
        week: 1,
        title: "Safety and Strength",
        videos: [
            { day: 1, title: 'Foundation & Alignment', description: 'Learn the correct "tripod" hand and head placement, which is crucial for safety and stability. We will practice this without lifting our legs yet.', embedUrl: 'https://www.youtube.com/embed/tKAs69_N3aE' },
            { day: 3, title: 'Core Strengthening', description: 'Engage your core with preparatory poses like Dolphin Pose and plank variations. A strong core is the key to lifting your legs with control.', embedUrl: 'https://www.youtube.com/embed/jK0arm2R2gU' },
            { day: 5, title: 'Building Shoulder Strength', description: 'Focus on shoulder stability exercises to prepare them for bearing weight. This helps prevent injury and builds confidence.', embedUrl: 'https://www.youtube.com/embed/44mgUselcDU' },
        ]
    },
    {
        week: 2,
        title: "Lifting Off",
        videos: [
            { day: 8, title: 'Practice Tucking', description: 'Today we start lifting! Learn to bring your knees to your chest in a talk position, practicing balance on your tripod base.', embedUrl: 'https://www.youtube.com/embed/n3uQ227u1C8' },
            { day: 10, title: 'Extending One Leg', description: 'From the tuck, we will practice extending one leg at a time towards the ceiling. This builds control and balance.', embedUrl: 'https://www.youtube.com/embed/wg7-tV2fKAo' },
            { day: 12, title: 'Wall-Assisted Kick-ups', description: 'Use the wall for support to safely practice kicking up into a full headstand. The wall helps you find the feeling of being inverted.', embedUrl: 'https://www.youtube.com/embed/4R2-j2hD-i4' },
        ]
    }
];


const friendsInChallenge = [
    { id: 'f1', name: 'Elena', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'woman portrait', daysIn: 12 },
    { id: 'f2', name: 'Marcus', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'man portrait', daysIn: 8 },
];

export default function HeadstandChallengePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isCompletedToday, setIsCompletedToday] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const checkStatus = async () => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const docId = `${todayStr}_${challengeDetails.id}`;
            const snap = await getDoc(doc(firestore, `users/${user.uid}/challengeTasks/${docId}`));
            if (snap.exists()) setIsCompletedToday(true);
        };
        checkStatus();
    }, [user]);

    const handleMarkComplete = async () => {
        if (!user) return;
        setIsLoading(true);
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const docId = `${todayStr}_${challengeDetails.id}`;
        try {
            await setDoc(doc(firestore, `users/${user.uid}/challengeTasks/${docId}`), {
                challengeId: challengeDetails.id,
                completedAt: serverTimestamp(),
            });
            setIsCompletedToday(true);
            toast({ title: "Task Complete!", description: "Today's challenge task has been recorded." });
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to mark task as complete.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

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
                            <Badge variant="destructive">Active Challenge</Badge>
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
                        <Button 
                            onClick={handleMarkComplete}
                            disabled={isCompletedToday || isLoading}
                            className={cn(
                                "flex-grow h-14 rounded-full text-lg font-bold shadow-lg transition-all active:scale-95",
                                isCompletedToday 
                                  ? "bg-green-600/20 border border-green-600/40 text-green-400" 
                                  : "bg-[rgba(193,154,107,0.85)] text-[rgba(25,16,8,0.95)]"
                            )}
                        >
                            {isLoading ? <SmileyRockLoader /> : isCompletedToday ? <><Check className="mr-2 h-6 w-6" /> Completed Today</> : "Mark Today Complete"}
                        </Button>
                        <Button size="lg" className="flex-grow py-7 bg-white/90 text-black hover:bg-white" asChild>
                           <Link href="/snap-yoga">
                                <Video className="mr-2 h-5 w-5" />
                                Analyze My Headstand
                           </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="flex-grow py-7 bg-transparent border-white/20 hover:bg-white/10 text-white">
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
                                    <p className="text-white/70">Follow these tutorials to build your confidence and skill.</p>
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
