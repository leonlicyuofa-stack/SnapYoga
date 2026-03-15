
"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Smile, Wind, Frown, Meh, Activity, Trophy, Clock, Flame, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MoodChart } from '@/components/features/dashboard/MoodChart';
import { PracticeCalendarSnapshot } from '@/components/features/dashboard/PracticeCalendarSnapshot';

// ─── Brand colour tokens ────────────────────────────────────────────────────
const GOLD        = 'rgba(193,154,107';   // Warm Gold #C19A6B
const PARCHMENT   = 'rgba(255,240,215';   // Parchment
const TERRACOTTA  = 'rgba(180,110,65';    // Terracotta
const SAGE        = 'rgba(120,140,100';    // Sage
const DEEP_BARK   = 'rgba(25,16,8';       // Deep Bark

// ─── Mood definitions ────────────────────────────────────────────────────────
const moods = [
  {
    name: 'Joyful',
    icon: Smile,
    emoji: '😊',
    ringColor: `${SAGE},0.45)`,
    fillColor: `${SAGE},0.20)`,
    textColor: 'rgba(160,195,130,0.92)',
  },
  {
    name: 'Calm',
    icon: Wind,
    emoji: '😌',
    ringColor: 'rgba(130,165,195,0.45)',
    fillColor: 'rgba(100,130,160,0.20)',
    textColor: 'rgba(140,185,215,0.92)',
  },
  {
    name: 'Emotional',
    icon: Frown,
    emoji: '😢',
    ringColor: `${GOLD},0.45)`,
    fillColor: `${TERRACOTTA},0.20)`,
    textColor: `${GOLD},0.92)`,
  },
  {
    name: 'Fatigue',
    icon: Meh,
    emoji: '😫',
    ringColor: 'rgba(139,100,75,0.45)',
    fillColor: 'rgba(139,100,75,0.18)',
    textColor: 'rgba(200,160,120,0.92)',
  },
];

function getInitials(email?: string | null, displayName?: string | null): string {
  if (displayName) {
    const names = displayName.split(' ');
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  }
  return email?.[0].toUpperCase() || 'U';
}

function GlassCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn('transition-transform duration-300 hover:scale-[1.015]', className)}
      style={{
        background: `${GOLD},0.07)`,
        border: `0.5px solid ${GOLD},0.20)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs tracking-widest uppercase font-medium font-serif italic"
      style={{ color: `${PARCHMENT},0.40)` }}
    >
      {children}
    </p>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lastLoggedMood, setLastLoggedMood] = useState<string | null>(null);
  const [isMoodLogging, setIsMoodLogging] = useState(false);

  useEffect(() => {
    if (!user) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const moodDocRef = doc(firestore, 'users', user.uid, 'moods', todayStr);
    getDoc(moodDocRef).then((snap) => {
      if (snap.exists()) setLastLoggedMood(snap.data().name);
    });
  }, [user]);

  const handleMoodSelect = async (moodName: string, moodEmoji: string) => {
    if (!user || isMoodLogging) return;
    setIsMoodLogging(true);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const moodDocRef = doc(firestore, 'users', user.uid, 'moods', todayStr);
    try {
      await setDoc(moodDocRef, {
        name: moodName,
        emoji: moodEmoji,
        loggedAt: serverTimestamp(),
      });
      setLastLoggedMood(moodName);
      toast({ title: 'Mood Logged', description: `Feeling ${moodName} today.` });
    } catch {
      toast({ title: 'Error', description: 'Could not log mood.', variant: 'destructive' });
    } finally {
      setIsMoodLogging(false);
    }
  };

  const welcomeName = user?.displayName || user?.email?.split('@')[0] || 'Yogi';

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen">
        <header className="container mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-serif font-semibold tracking-tight"
                style={{ color: `${PARCHMENT},0.92)` }}
              >
                Hey, {welcomeName}!
              </h1>
              <p
                className="text-xs font-serif italic mt-0.5"
                style={{ color: `${PARCHMENT},0.38)` }}
              >
                Your practice is waiting for you.
              </p>
            </div>
            <Avatar
              className="h-10 w-10 border-2"
              style={{ borderColor: `${GOLD},0.35)` }}
            >
              <AvatarImage
                src={user?.photoURL ?? undefined}
                alt={user?.displayName ?? 'user'}
              />
              <AvatarFallback
                className="font-serif text-xs"
                style={{
                  background: `${GOLD},0.20)`,
                  color: `${GOLD},0.95)`,
                }}
              >
                {getInitials(user?.email, user?.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 pb-20 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <GlassCard className="md:col-span-2 px-4 py-3" style={{ borderRadius: '32px 32px 16px 32px' }}>
              <div className="flex items-center justify-between mb-2">
                <CardLabel>How are you feeling?</CardLabel>
                <div
                  className="p-1 rounded-full"
                  style={{ background: `${GOLD},0.12)` }}
                >
                  <Sparkles
                    className="h-3 w-3"
                    style={{ color: `${GOLD},0.70)` }}
                  />
                </div>
              </div>

              <div className="flex justify-around items-center py-1">
                {moods.map((mood) => {
                  const isActive = lastLoggedMood === mood.name;
                  return (
                    <button
                      key={mood.name}
                      onClick={() => handleMoodSelect(mood.name, mood.emoji)}
                      disabled={isMoodLogging}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className="h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                          background: isActive ? mood.fillColor : `${PARCHMENT},0.04)`,
                          border: `1px solid ${isActive ? mood.ringColor : `${PARCHMENT},0.10)`}`,
                          boxShadow: isActive
                            ? `0 0 12px ${mood.fillColor}`
                            : 'none',
                          transform: isActive ? 'scale(1.08)' : 'scale(1)',
                        }}
                      >
                        <mood.icon
                          className="h-5 w-5 transition-all duration-300"
                          style={{
                            color: isActive
                              ? mood.textColor
                              : `${PARCHMENT},0.45)`,
                          }}
                        />
                      </div>
                      <span
                        className="text-[8px] uppercase tracking-widest font-medium font-serif"
                        style={{
                          color: isActive
                            ? mood.textColor
                            : `${PARCHMENT},0.30)`,
                        }}
                      >
                        {mood.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard
              className="px-4 py-3 flex flex-col justify-between"
              style={{
                background: `${TERRACOTTA},0.18)`,
                border: `0.5px solid ${GOLD},0.28)`,
                borderRadius: '16px 32px 32px 16px',
              }}
            >
              <div className="flex items-center justify-between">
                <CardLabel>Practice</CardLabel>
                <svg width="38" height="38" viewBox="0 0 44 44">
                  <circle
                    cx="22" cy="22" r="18"
                    fill="none"
                    stroke={`${GOLD},0.15)`}
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="22" cy="22" r="18"
                    fill="none"
                    stroke={`${GOLD},0.80)`}
                    strokeWidth="3.5"
                    strokeDasharray="75 38"
                    strokeDashoffset="14"
                    strokeLinecap="round"
                  />
                  <text
                    x="22" y="26"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="Georgia, serif"
                    fill={`${GOLD},0.85)`}
                  >
                    68%
                  </text>
                </svg>
              </div>

              <div className="mt-2">
                <p
                  className="text-3xl font-serif font-semibold tracking-tight"
                  style={{ color: `${PARCHMENT},0.92)` }}
                >
                  1,240
                </p>
                <p
                  className="text-[10px] font-serif italic mt-0.5"
                  style={{ color: `${PARCHMENT},0.40)` }}
                >
                  mins this month
                </p>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <GlassCard
              className="px-4 py-3 flex flex-col gap-2"
              style={{
                background: `${DEEP_BARK},0.50)`,
                border: `0.5px solid ${GOLD},0.18)`,
                borderRadius: '16px 16px 32px 32px',
              }}
            >
              <div className="flex items-center justify-between">
                <CardLabel>Monthly Goal</CardLabel>
                <Clock
                  className="h-3 w-3"
                  style={{ color: `${GOLD},0.45)` }}
                />
              </div>

              <div className="flex items-center justify-center">
                <div className="h-[80px] w-[80px]">
                  <PracticeCalendarSnapshot />
                </div>
              </div>

              <div>
                <div
                  className="w-full h-1 rounded-full mb-1"
                  style={{ background: `${PARCHMENT},0.08)` }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: '65%',
                      background: `${GOLD},0.80)`,
                    }}
                  />
                </div>
                <p
                  className="text-[9px] font-serif italic"
                  style={{ color: `${PARCHMENT},0.32)` }}
                >
                  17 of 26 sessions
                </p>
              </div>
            </GlassCard>

            <GlassCard
              className="md:col-span-2 px-4 py-3"
              style={{ borderRadius: '32px 32px 32px 16px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <CardLabel>Weekly Mood Flow</CardLabel>
                <Activity
                  className="h-3 w-3"
                  style={{ color: `${GOLD},0.45)` }}
                />
              </div>
              <div className="h-[140px]">
                <MoodChart />
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div
              className="md:col-span-2 px-5 py-4 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.015] relative"
              style={{
                background: `${DEEP_BARK},0.72)`,
                border: `0.8px solid ${GOLD},0.28)`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '32px 16px 32px 32px',
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-8 pointer-events-none"
                style={{
                  background: `${GOLD},0.06)`,
                  borderRadius: '32px 16px 0 0',
                }}
              />

              <div className="relative z-10 flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${GOLD},0.15)` }}
                >
                  <Trophy
                    className="h-4 w-4"
                    style={{ color: `${GOLD},0.85)` }}
                  />
                </div>

                <div>
                  <h3
                    className="text-base font-serif font-semibold leading-snug"
                    style={{ color: `${PARCHMENT},0.92)` }}
                  >
                    Join new challenges
                  </h3>
                  <p
                    className="text-xs font-serif italic mt-0.5"
                    style={{ color: `${PARCHMENT},0.38)` }}
                  >
                    Connect with friends and master new poses.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-3">
                <Button
                  asChild
                  className="rounded-full h-8 px-5 text-xs font-serif font-semibold transition-all hover:opacity-90"
                  style={{
                    background: `${GOLD},0.85)`,
                    color: `${DEEP_BARK},0.95)`,
                    border: 'none',
                  }}
                >
                  <Link href="/challenges">Explore</Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <GlassCard
                className="px-4 py-3 flex-1"
                style={{
                  background: `${SAGE},0.18)`,
                  border: `0.5px solid ${SAGE},0.32)`,
                  borderRadius: '28px',
                }}
              >
                <CardLabel>Current Streak</CardLabel>
                <div className="flex items-end gap-1.5 mt-1">
                  <p
                    className="text-xl font-serif font-semibold"
                    style={{ color: 'rgba(160,195,130,0.92)' }}
                  >
                    7 days
                  </p>
                  <Flame
                    className="h-4 w-4 mb-0.5"
                    style={{ color: `${GOLD},0.75)` }}
                  />
                </div>
              </GlassCard>

              <GlassCard
                className="px-4 py-3 flex-1"
                style={{
                  background: `${TERRACOTTA},0.18)`,
                  border: `0.5px solid ${GOLD},0.25)`,
                  borderRadius: '12px 12px 28px 28px',
                }}
              >
                <CardLabel>Poses analysed</CardLabel>
                <div className="flex items-end gap-1.5 mt-1">
                  <p
                    className="text-xl font-serif font-semibold"
                    style={{ color: 'rgba(210,165,120,0.92)' }}
                  >
                    24 total
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
