
"use client";

import { Home, Search, Settings, Dumbbell, Utensils, HeartPulse, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const gridItems: { title: string; icon: LucideIcon, bgColor: string }[] = [
  { title: "Diet Recommendation", icon: Utensils, bgColor: "bg-emerald-100" },
  { title: "Kegel Exercise", icon: HeartPulse, bgColor: "bg-rose-100" },
  { title: "Yoga", icon: Dumbbell, bgColor: "bg-sky-100" },
  { title: "Meditation", icon: Brain, bgColor: "bg-purple-100" },
];

export default function TestingPage1() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Top Orange Section */}
      <div className="absolute top-0 left-0 right-0 h-[35vh] bg-[hsl(var(--home-orange-bg))] rounded-b-3xl" />

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="container mx-auto px-4 pt-8 pb-4 text-primary-foreground">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Good Morning, Jane</h1>
              <p className="text-sm opacity-90">What are you up to today?</p>
            </div>
            <Avatar className="h-12 w-12 border-2 border-white">
              <AvatarImage src="https://i.imgur.com/3Z3QFqg.png" alt="Jane" />
              <AvatarFallback>J</AvatarFallback>
            </Avatar>
          </div>
          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for exercises..."
              className="w-full rounded-full bg-background/80 text-foreground pl-10 pr-4 py-6 shadow-md"
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-2 gap-4">
            {gridItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="rounded-2xl shadow-lg bg-card/90 backdrop-blur-sm border-border/20"
                >
                  <CardContent className="flex flex-col items-center justify-center p-4 gap-3 text-center">
                    <div className={cn("p-4 rounded-full", item.bgColor)}>
                       <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">{item.title}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="w-full p-2">
            <div className="container mx-auto max-w-sm">
                <div className="flex justify-around items-center bg-card/80 backdrop-blur-sm border rounded-full h-20 shadow-lg">
                    <Button variant="ghost" className="flex flex-col h-auto p-2 gap-1 rounded-full">
                        <Home className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Today</span>
                    </Button>
                    <Button variant="secondary" className="flex flex-col h-auto p-2 gap-1 rounded-full w-20 h-14 bg-accent text-accent-foreground shadow-md">
                        <Dumbbell className="h-6 w-6" />
                        <span className="text-xs">Exercises</span>
                    </Button>
                    <Button variant="ghost" className="flex flex-col h-auto p-2 gap-1 rounded-full">
                        <Settings className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Settings</span>
                    </Button>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}
