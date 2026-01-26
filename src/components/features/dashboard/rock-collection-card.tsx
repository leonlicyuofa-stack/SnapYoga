
"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Collectible } from './rock-data';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface YogaCollectionCardProps {
  collectibles: Collectible[];
  className?: string;
}

export function RockCollectionCard({ collectibles, className }: YogaCollectionCardProps) {
  // Simulate which items are collected for demo purposes
  const collectedIds = ['welcome_mat', 'first_analysis_block', 'join_challenge_strap'];

  const getRarityClass = (rarity: Collectible['rarity']) => {
    switch(rarity) {
        case 'Common': return 'text-gray-500';
        case 'Uncommon': return 'text-green-600';
        case 'Rare': return 'text-blue-600';
        case 'Epic': return 'text-purple-600';
        default: return 'text-muted-foreground';
    }
  }
  
  return (
    <Card className={cn("w-full bg-card/90 backdrop-blur-sm border-border/20 rounded-2xl", className)}>
        <CardHeader>
            <CardTitle className="text-xl">Your Collection</CardTitle>
        </CardHeader>
        <CardContent>
            <TooltipProvider>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {collectibles.map((item) => {
                    const isCollected = collectedIds.includes(item.id);
                    return (
                    <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                        <div className="flex flex-col items-center gap-2 flex-shrink-0 w-24">
                            <div
                            className="p-2 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: isCollected ? `${item.color}33` : 'hsl(var(--muted))',
                                border: `3px solid ${isCollected ? item.color : 'hsl(var(--border))'}`
                            }}
                            >
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="rounded-full transition-all duration-300"
                                style={{ opacity: isCollected ? 1 : 0.4 }}
                            />
                            </div>
                            <p className={`text-xs text-center truncate w-full ${isCollected ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {item.name}
                            </p>
                        </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                        <p className="font-semibold text-base" style={{color: item.color}}>{item.name}</p>
                        <p className={`font-bold text-sm ${getRarityClass(item.rarity)}`}>{item.rarity}</p>
                        <p className="text-sm text-muted-foreground mt-1 italic">&quot;{item.story}&quot;</p>
                        {!isCollected && <p className="text-xs text-primary/80 italic mt-2">Keep exploring to unlock!</p>}
                        </TooltipContent>
                    </Tooltip>
                    );
                })}
                </div>
            </TooltipProvider>
        </CardContent>
    </Card>
  );
}
