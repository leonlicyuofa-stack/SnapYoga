
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Gem, ArrowRight } from 'lucide-react';
import type { Rock } from './rock-data';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

interface RockCollectionCardProps {
  rocks: Rock[];
  className?: string;
}

export function RockCollectionCard({ rocks, className }: RockCollectionCardProps) {
  // Simulate which rocks are collected for demo purposes
  const collectedRockIds = ['welcome', 'first-analysis', 'join-challenge'];

  const getRarityClass = (rarity: Rock['rarity']) => {
    switch(rarity) {
        case 'Common': return 'text-gray-500';
        case 'Uncommon': return 'text-green-600';
        case 'Rare': return 'text-blue-600';
        case 'Epic': return 'text-purple-600';
        default: return 'text-muted-foreground';
    }
  }
  
  const recentRocks = rocks.filter(rock => collectedRockIds.includes(rock.id)).slice(0, 2);

  return (
    <div className={className}>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {recentRocks.map((rock) => {
              const isCollected = collectedRockIds.includes(rock.id);
              const RockIcon = rock.icon;
              return (
                <Tooltip key={rock.id}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 w-24">
                      <div
                        className="p-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: isCollected ? `${rock.color}33` : 'hsl(var(--muted))',
                          border: `2px solid ${isCollected ? rock.color : 'hsl(var(--border))'}`
                        }}
                      >
                        <RockIcon
                          className="h-12 w-12"
                          style={{ opacity: isCollected ? 1 : 0.4 }}
                        />
                      </div>
                      <p className={`text-xs text-center truncate w-full ${isCollected ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {rock.name}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold text-base" style={{color: rock.color}}>{rock.name}</p>
                    <p className={`font-bold text-sm ${getRarityClass(rock.rarity)}`}>{rock.rarity}</p>
                    <p className="text-sm text-muted-foreground mt-1 italic">&quot;{rock.story}&quot;</p>
                    {!isCollected && <p className="text-xs text-primary/80 italic mt-2">Keep exploring to unlock!</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
      
    </div>
  );
}
