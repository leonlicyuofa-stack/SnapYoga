
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SmileyPebbleIcon } from "@/components/icons/smiley-pebble-icon";
import { Gem } from 'lucide-react';

export interface Rock {
  id: string;
  name: string;
  description: string;
  collected: boolean;
  color: string;
}

interface RockCollectionCardProps {
  rocks: Rock[];
}

export function RockCollectionCard({ rocks }: RockCollectionCardProps) {
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
            {rocks.map(rock => (
              <Tooltip key={rock.id}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 w-24">
                    <div
                      className="p-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: rock.collected ? `${rock.color}1A` : 'hsl(var(--muted))',
                        border: `2px solid ${rock.collected ? rock.color : 'hsl(var(--border))'}`
                      }}
                    >
                      <SmileyPebbleIcon
                        className="h-12 w-12"
                        style={{ color: rock.collected ? rock.color : 'hsl(var(--muted-foreground))', opacity: rock.collected ? 1 : 0.5 }}
                      />
                    </div>
                    <p className={`text-xs text-center truncate w-full ${rock.collected ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {rock.name}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{rock.name}</p>
                  <p className="text-sm text-muted-foreground">{rock.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
