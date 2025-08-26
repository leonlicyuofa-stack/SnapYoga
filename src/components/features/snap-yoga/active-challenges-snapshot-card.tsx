
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Data is hardcoded for this snapshot component as it's a static view
const activeChallenges = [
    {
      id: 'headstand',
      name: 'Headstand (Sirsasana)',
      description: 'Master the headstand this month! Work on your balance and core strength.',
      imageUrl: '/images/headstand.png',
      imageHint: 'headstand yoga silhouette',
      detailLink: '/challenges/headstand',
    },
];

export function ActiveChallengesSnapshotCard() {
    return (
        <div className="w-full p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-xl">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Trophy className="h-7 w-7 text-primary" />
                    Active Challenge Snapshot
                </CardTitle>
                <CardDescription>
                    Working on a challenge? Analyze your pose and track your progress!
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-6 space-y-4">
                {activeChallenges.map(challenge => (
                    <div key={challenge.id} className="border rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 bg-background/50">
                        <div className="relative w-full sm:w-32 h-24 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                                src={challenge.imageUrl}
                                alt={challenge.name}
                                fill
                                className="object-cover"
                                data-ai-hint={challenge.imageHint}
                            />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            <Badge variant="destructive" className="mb-1">Active</Badge>
                            <h3 className="font-semibold text-lg">{challenge.name}</h3>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                    </div>
                ))}
                 <Button asChild className="w-full" variant="outline">
                    <Link href="/challenges">
                        View All Challenges <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </div>
    );
}
