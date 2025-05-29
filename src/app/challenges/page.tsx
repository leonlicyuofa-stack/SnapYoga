
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users } from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  inviteLink: string;
}

const challenges: Challenge[] = [
  {
    id: 'headstand',
    name: 'Headstand Challenge (Sirsasana)',
    description: 'Master the headstand this month! Work on your balance and core strength. Practice safely against a wall if you\'re new.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'headstand yoga',
    inviteLink: '/challenges/headstand/invite',
  },
  {
    id: 'crow',
    name: 'Crow Pose Challenge (Bakasana)',
    description: 'Take on the crow pose! Build arm strength and courage. Start by practicing tucking your knees into your armpits.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'crow pose yoga',
    inviteLink: '/challenges/crow/invite',
  },
  // Add more challenges here if needed
];

export default function ChallengesPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            Monthly Yoga Pose Challenges
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our monthly challenges to improve specific poses, track your progress, and connect with friends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
              <div className="relative w-full h-72">
                <Image
                  src={challenge.imageUrl}
                  alt={`${challenge.name} background`}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={challenge.imageHint}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{challenge.name}</h2>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6 min-h-[60px]">{challenge.description}</p>
                <Link href={challenge.inviteLink} passHref>
                  <Button 
                    size="lg" 
                    className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    aria-label={`Invite friends to ${challenge.name}`}
                  >
                    Invite Friends & Start Challenge
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">More Challenges Coming Soon!</h3>
          <p className="text-muted-foreground">
            We're always preparing new and exciting challenges for you. Check back regularly!
          </p>
        </div>
      </div>
    </AppShell>
  );
}
