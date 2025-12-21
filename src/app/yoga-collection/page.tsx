
"use client";

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Gem, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { allCollectibles, type Collectible } from '@/components/features/dashboard/rock-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';


export default function YogaCollectionPage() {
    // Simulate which items are collected for demo purposes
    const collectedIds = ['welcome_mat', 'first_analysis_block', 'join_challenge_strap'];

    const getRarityBadgeVariant = (rarity: Collectible['rarity']): "default" | "secondary" | "destructive" | "outline" => {
        switch(rarity) {
            case 'Common': return 'secondary';
            case 'Uncommon': return 'default';
            case 'Rare': return 'outline'; 
            case 'Epic': return 'destructive';
            default: return 'secondary';
        }
    }
     const getRarityClass = (rarity: Collectible['rarity']) => {
        switch(rarity) {
            case 'Common': return 'border-gray-400';
            case 'Uncommon': return 'border-green-500';
            case 'Rare': return 'border-blue-500';
            case 'Epic': return 'border-purple-600';
            default: return 'border-border';
        }
    }


  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        <Button variant="outline" asChild className="mb-8 group">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </Button>
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-3">
            <Gem className="h-10 w-10" />
            The Yoga Collection
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            A gallery of all the special equipment you can collect in SnapYoga.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCollectibles.map(item => {
                const isCollected = collectedIds.includes(item.id);
                return (
                    <div 
                        key={item.id} 
                        className={cn(
                            "shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col p-6 rounded-lg bg-card/80 backdrop-blur-sm",
                            isCollected ? '' : 'bg-muted/50',
                            getRarityClass(item.rarity)
                        )}
                        style={{borderWidth: '2px'}}
                    >
                        <CardHeader className="p-0 items-center text-center">
                            <div className={cn(
                                "p-3 rounded-full mb-3",
                                isCollected ? 'bg-primary/10' : 'bg-secondary'
                            )}>
                               <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="rounded-full transition-all duration-300"
                                    style={{ opacity: isCollected ? 1 : 0.5 }}
                                />
                            </div>
                            <CardTitle style={{color: item.color}}>{item.name}</CardTitle>
                            <Badge variant={getRarityBadgeVariant(item.rarity)}>{item.rarity}</Badge>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow text-center space-y-2 mt-4">
                            <CardDescription className="italic">&quot;{item.story}&quot;</CardDescription>
                            <p className="text-sm text-foreground/80">{item.description}</p>
                        </CardContent>
                        <CardFooter className="p-0 justify-center pt-4">
                            {isCollected ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Collected
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    <Lock className="mr-2 h-4 w-4" />
                                    Not Collected
                                </Badge>
                            )}
                        </CardFooter>
                    </div>
                )
            })}
        </div>
      </div>
    </AppShell>
  );
}
