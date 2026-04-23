"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Smile, Wind, Frown, Meh, Trophy, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MoodChart } from '@/components/features/dashboard/MoodChart';

const GOLD       = 'rgba(193,154,107';
const PARCHMENT  = 'rgba(255,240,215';
const TERRACOTTA = 'rgba(180,110,65';
const SAGE       = 'rgba(120,140,100';
const DEEP_BARK  = 'rgba(25,16,8';
const BARK_L     = 'rgba(60,38,18';

function tok(isDark: boolean) {
  return {
    text:        isDark ? `${PARCHMENT},0.90)`  : `${BARK_L},0.90)`,
    muted:       isDark ? `${PARCHMENT},0.38)`  : `${BARK_L},0.45)`,
    gold:        isDark ? `${GOLD},0.90)`        : `rgba(140,100,55,0.90)`,
    goldBorder:  isDark ? `${GOLD},0.22)`        : `rgba(140,100,55,0.30)`,
    cardBg:      isDark ? `${GOLD},0.07)`        : `rgba(255,248,235,0.72)`,
    cardTerra:   isDark ? `${TERRACOTTA},0.18)`  : `rgba(200,135,85,0.14)`,
    cardSage:    isDark ? `${SAGE},0.18)`        : `rgba(120,155,95,0.16)`,
    cardBark:    isDark ? `${DEEP_BARK},0.65)`   : `rgba(255,248,232,0.88)`,
    cardDark:    isDark ? `${DEEP_BARK},0.50)`   : `rgba(248,240,225,0.80)`,
  };
}

const MOODS = [
  { name: 'Joyful',    icon: Smile, emoji: '😊', ring: `${SAGE},0.45)`,          fill: `${SAGE},0.20)`,         text: 'rgba(160,195,130,0.92)' },
  { name: 'Calm',      icon: Wind,  emoji: '😌', ring: 'rgba(130,165,195,0.45)', fill: 'rgba(100,130,160,0.20)', text: 'rgba(140,185,215,0.92)' },
  { name: 'Emotional', icon: Frown, emoji: '😢', ring: `${GOLD},0.45)`,           fill: `${TERRACOTTA},0.20)`,   text: `${GOLD},0.92)` },
  { name: 'Fatigue',   icon: Meh,   emoji: '😫', ring: 'rgba(139,100,75,0.45)',   fill: 'rgba(139,100,75,0.18)', text: 'rgba(200,160,120,0.92)' },
];

function GlassCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('transition-transform duration-300', className)}
      style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: 20, ...style }}
    >
      {children}
    </div>
  );
}

function SectionHead({ children, t }: { children: React.ReactNode; t: any }) {
  return <p style={{ fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', fontStyle: 'italic', color: t.muted, marginBottom: 8 }}>{children}</p>;
}

function CardLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return <p style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontStyle: 'italic', color, margin: '0 0 3px' }}>{children}</p>;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.09)', marginTop: 6 }}>
      <div style={{ height: 4, borderRadius: 2, width: `${Math.min(pct, 100)}%`, background: color, transition: 'width 0.9s ease' }} />
    </div>
  );
}

function getInitials(email?: string | null, name?: string | null) {
  if (name) { const n = name.split(' '); return (n[0][0] + (n[n.length-1][0]||'')).toUpperCase(); }
  return email?.[0].toUpperCase() || 'U';
}

export default function DashboardPage() {
  const { user }                = useAuth();
  const { isDark }              = useTheme();
  const { toast }               = useToast();
  const t                       = tok(isDark);

  const [mood,          setMood]          = useState<string|null>(null);
  const [moodLogging,   setMoodLogging]   = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);
  const [exerciseHrs,   setExerciseHrs]   = useState(0);
  const [avgScore,      setAvgScore]      = useState(78);

  const name = user?.displayName || user?.email?.split('@')[0] || 'Yogi';

  useEffect(() => {
    if (!user) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    getDoc(doc(firestore, 'users', user.uid, 'moods', todayStr)).then(s => { if (s.exists()) setMood(s.data().name); });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ref = collection(firestore, 'users', user.uid, 'poseAnalyses');
    getDocs(query(ref, orderBy('createdAt', 'desc'))).then(snap => {
      const all = snap.docs.map(d => d.data());
      setTotalSessions(all.length);
      const scores = all.filter(a => typeof a.score === 'number').map(a => a.score as number);
      if (scores.length) setAvgScore(Math.round(scores.reduce((a,b)=>a+b,0)/scores.length));
      setExerciseHrs(Math.round((all.length * 15) / 60 * 10) / 10);
    });
    const mStart = startOfMonth(new Date()), mEnd = endOfMonth(new Date());
    getDocs(query(ref, where('createdAt','>=',mStart), where('createdAt','<=',mEnd))).then(s => setMonthSessions(s.size));
  }, [user]);

  const logMood = async (moodName: string, emoji: string) => {
    if (!user || moodLogging) return;
    setMoodLogging(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid, 'moods', format(new Date(),'yyyy-MM-dd')), { name: moodName, emoji, loggedAt: serverTimestamp() });
      setMood(moodName);
      toast({ title: 'Mood logged', description: `Feeling ${moodName} today.` });
    } catch (e) { 
      toast({ title: 'Error', description: 'Could not log mood.', variant: 'destructive' }); 
    } finally { 
      setMoodLogging(false); 
    }
  };

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* HEADER */}
        <header style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 500, color: t.text, margin: 0 }}>Hey, {name}!</h1>
            <p  style={{ fontSize: 11, fontStyle: 'italic', color: t.muted, margin: '2px 0 0' }}>Your practice is waiting.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar style={{ width: 34, height: 34, border: `1.5px solid ${t.goldBorder}` }}>
              <AvatarImage src={user?.photoURL ?? undefined} alt={name} />
              <AvatarFallback style={{ background: `${GOLD},0.18)`, color: t.gold, fontSize: 11 }}>
                {getInitials(user?.email, user?.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main style={{ flex: 1, padding: '4px 14px 120px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* §1 MOOD */}
          <section>
            <SectionHead t={t}>How are you feeling?</SectionHead>
            <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '24px 12px 24px 24px', padding: '12px 8px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {MOODS.map(m => {
                  const on = mood === m.name;
                  return (
                    <button key={m.name} onClick={() => logMood(m.name, m.emoji)} disabled={moodLogging}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease',
                        background: on ? m.fill : `${PARCHMENT},0.04)`,
                        border: `1px solid ${on ? m.ring : `${PARCHMENT},0.10)`}`,
                        boxShadow: on ? `0 0 12px ${m.fill}` : 'none',
                        transform: on ? 'scale(1.10)' : 'scale(1)',
                      }}>
                        <m.icon style={{ width: 20, height: 20, color: on ? m.text : `${PARCHMENT},0.45)` }} />
                      </div>
                      <span style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: on ? m.text : t.muted }}>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </section>

          {/* §2 MY PROGRESS */}
          <section>
            <SectionHead t={t}>My Progress</SectionHead>

            {/* Row A: Exercise hours + Poses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <GlassCard style={{ background: t.cardTerra, border: `0.5px solid ${t.goldBorder}`, borderRadius: '20px 8px 20px 20px', padding: '12px 14px' }}>
                <CardLabel color={t.gold}>Exercise hours</CardLabel>
                <p style={{ fontSize: 28, fontWeight: 500, color: t.gold, lineHeight: 1.1, margin: '2px 0 0' }}>
                  {exerciseHrs}<span style={{ fontSize: 12, opacity: 0.55, marginLeft: 2 }}> hrs</span>
                </p>
                <p style={{ fontSize: 9, color: t.muted, fontStyle: 'italic', margin: '2px 0 0' }}>this month</p>
                <Bar pct={(exerciseHrs / 30) * 100} color={`${GOLD},0.78)`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 8, color: t.muted }}>goal 30h</span>
                  <span style={{ fontSize: 8, color: t.gold }}>{Math.round((exerciseHrs/30)*100)}%</span>
                </div>
              </GlassCard>

              <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '8px 20px 20px 20px', padding: '12px 14px' }}>
                <CardLabel color={t.muted}>Poses analysed</CardLabel>
                <p style={{ fontSize: 28, fontWeight: 500, color: t.text, lineHeight: 1.1, margin: '2px 0 0' }}>{totalSessions}</p>
                <p style={{ fontSize: 9, color: t.muted, fontStyle: 'italic', margin: '2px 0 0' }}>all time</p>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 8, padding: '2px 7px', borderRadius: 999, background: `${GOLD},0.14)`, color: t.gold, border: `0.5px solid ${t.goldBorder}`, letterSpacing: 1, textTransform: 'uppercase' }}>
                    +{monthSessions} this month
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Row B: Streak + Avg score */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <GlassCard style={{ background: t.cardSage, border: `0.5px solid rgba(140,170,115,0.32)`, borderRadius: '20px 20px 8px 20px', padding: '12px 14px' }}>
                <CardLabel color="rgba(160,195,130,0.75)">Current streak</CardLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0' }}>
                  <p style={{ fontSize: 28, fontWeight: 500, color: 'rgba(160,195,130,0.92)', lineHeight: 1.1, margin: 0 }}>7</p>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(160,195,130,0.70)' }}>days</div>
                    <div style={{ fontSize: 16 }}>🔥</div>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: t.muted, fontStyle: 'italic', margin: '3px 0 0' }}>best: 14 days</p>
              </GlassCard>

              <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '20px 20px 20px 8px', padding: '12px 14px' }}>
                <CardLabel color={t.muted}>Avg pose score</CardLabel>
                <p style={{ fontSize: 28, fontWeight: 500, color: t.gold, lineHeight: 1.1, margin: '2px 0 0' }}>
                  {avgScore}<span style={{ fontSize: 12, opacity: 0.50, marginLeft: 1 }}>/100</span>
                </p>
                <p style={{ fontSize: 9, color: t.muted, fontStyle: 'italic', margin: '2px 0 0' }}>↑ improving</p>
                <Bar pct={avgScore} color={`${GOLD},0.72)`} />
              </GlassCard>
            </div>

            {/* Row C: Monthly sessions full-width */}
            <GlassCard style={{ background: t.cardDark, border: `0.5px solid ${t.goldBorder}`, borderRadius: '12px 24px 24px 12px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <CardLabel color={t.muted}>Monthly sessions</CardLabel>
                  <p style={{ fontSize: 22, fontWeight: 500, color: t.text, margin: 0 }}>
                    {monthSessions} <span style={{ fontSize: 13, color: t.muted, fontWeight: 400 }}>/ 26 goal</span>
                  </p>
                  <p style={{ fontSize: 10, color: t.muted, fontStyle: 'italic', margin: '3px 0 0' }}>
                    {Math.round((monthSessions/26)*100)}% of monthly goal
                  </p>
                  <Bar pct={(monthSessions/26)*100} color={`${GOLD},0.78)`} />
                </div>
                <div style={{ display: 'flex', gap: 4, marginLeft: 16, alignItems: 'flex-end' }}>
                  {[1,1,0,1,0,1,1].map((done,i)=>(
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: done ? `${GOLD},0.80)` : `${PARCHMENT},0.12)` }} />
                  ))}
                </div>
              </div>
            </GlassCard>
          </section>

          {/* §3 TODAY'S HABITS */}
          <section>
            <SectionHead t={t}>Today's habits</SectionHead>
            <GlassCard style={{ background: t.cardDark, border: `0.5px solid ${t.goldBorder}`, borderRadius: '20px 20px 12px 20px', padding: '12px 10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[
                  { label: 'Practice', emoji: '🧘', done: true,  color: `${TERRACOTTA},0.85)` },
                  { label: 'Hydrate',  emoji: '💧', done: true,  color: 'rgba(100,160,200,0.85)' },
                  { label: 'Rest',     emoji: '🌙', done: false, color: `${GOLD},0.85)` },
                  { label: 'Sunlight', emoji: '☀️', done: false, color: 'rgba(220,180,80,0.85)' },
                  { label: 'Active',   emoji: '🔥', done: false, color: `${SAGE},0.85)` },
                ].map(h => (
                  <div key={h.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, transition: 'all 0.2s',
                      background: h.done ? h.color : `${PARCHMENT},0.05)`,
                      border: `0.5px solid ${h.done ? h.color : `${PARCHMENT},0.10)`}`,
                      transform: h.done ? 'scale(1.08)' : 'scale(1)',
                    }}>{h.emoji}</div>
                    <span style={{ fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', color: h.done ? t.text : t.muted }}>{h.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                {[1,1,0,0,0].map((d,i) => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: d ? `${GOLD},0.72)` : `${PARCHMENT},0.10)` }} />)}
              </div>
              <p style={{ fontSize: 9, color: t.muted, fontStyle: 'italic', marginTop: 4 }}>2 of 5 habits done today</p>
            </GlassCard>
          </section>

          {/* §4 WEEKLY MOOD FLOW */}
          <section>
            <SectionHead t={t}>Weekly mood flow</SectionHead>
            <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '24px 24px 24px 12px', padding: '12px 14px 8px' }}>
              <div style={{ height: 150 }}>
                <MoodChart />
              </div>
            </GlassCard>
          </section>

          {/* §5 CHALLENGES */}
          <section>
            <SectionHead t={t}>Challenges</SectionHead>
            <GlassCard style={{ background: t.cardBark, border: `0.8px solid ${t.goldBorder}`, borderRadius: '28px 12px 28px 28px', padding: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, top: 0, height: 42, borderRadius: '28px 12px 0 0', background: `${GOLD},0.06)`, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, background: `${GOLD},0.14)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy style={{ width: 20, height: 20, color: t.gold }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 500, color: t.text, margin: '0 0 4px' }}>Join new challenges</h3>
                  <p  style={{ fontSize: 11, color: t.muted, fontStyle: 'italic', margin: 0 }}>Connect with friends and master new poses.</p>
                </div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginTop: 14, display: 'flex', gap: 10 }}>
                <Button asChild style={{ flex: 1, height: 42, borderRadius: 21, background: `${GOLD},0.80)`, color: `${DEEP_BARK},0.95)`, border: 'none', fontSize: 13, letterSpacing: 1 }}>
                  <Link href="/challenges">Explore</Link>
                </Button>
                <Link href="/challenges" style={{ width: 42, height: 42, borderRadius: 21, flexShrink: 0, background: `${GOLD},0.12)`, border: `0.5px solid ${t.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  👥
                </Link>
              </div>
            </GlassCard>
          </section>

        </main>
      </div>
    </AppShell>
  );
}
