
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Gem } from 'lucide-react';
import type { Rock } from './rock-data';

interface RockCollectionCardProps {
  rocks: Rock[];
}

export function RockCollectionCard({ rocks }: RockCollectionCardProps) {
  // Simulate which rocks are collected for demo purposes
  const collectedRockIds = ['welcome', 'first-analysis', 'join-challenge'];

  return (
    <Card className="shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <Gem className="mr-3 h-7 w-7 text-primary" />
          Your Rock Collection
        </CardTitle>
        <CardDescription>
          Collect special rocks by completing challenges and using app features!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {rocks.map((rock) => {
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
                  <TooltipContent>
                    <p className="font-semibold">{rock.name}</p>
                    <p className="text-sm text-muted-foreground">{rock.description}</p>
                    {!isCollected && <p className="text-xs text-primary/80 italic mt-1">Keep exploring to unlock!</p>}
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
