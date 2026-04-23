"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Smile, Wind, Frown, Meh, Trophy, Sun, Moon, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MoodChart } from '@/components/features/dashboard/MoodChart';

const GOLD       = 'rgba(212, 175, 55'; 
const PARCHMENT  = 'rgba(252, 248, 240';
const TERRACOTTA = 'rgba(180, 110, 65';
const SAGE       = 'rgba(120, 140, 100';
const DEEP_BARK  = 'rgba(10, 10, 10';

function tok(isDark: boolean) {
  return {
    text:        isDark ? `${PARCHMENT},0.92)`  : `${DEEP_BARK},0.90)`,
    muted:       isDark ? `${PARCHMENT},0.40)`  : `${DEEP_BARK},0.50)`,
    gold:        isDark ? `${GOLD},1.0)`         : `rgba(160, 130, 60, 1.0)`,
    goldBorder:  isDark ? `${GOLD},0.25)`        : `rgba(160, 130, 60, 0.30)`,
    cardBg:      isDark ? 'rgba(15, 15, 15, 0.6)' : `rgba(255, 255, 255, 0.7)`,
    cardTerra:   isDark ? `${TERRACOTTA},0.20)`  : `rgba(200, 135, 85, 0.14)`,
    cardSage:    isDark ? `${SAGE},0.20)`        : `rgba(120, 155, 95, 0.16)`,
    cardBark:    isDark ? 'rgba(20, 20, 20, 0.8)' : `rgba(255, 251, 245, 0.9)`,
    cardDark:    isDark ? 'rgba(10, 10, 10, 0.7)' : `rgba(248, 243, 230, 0.85)`,
  };
}

const MOODS = [
  { name: 'Joyful',    icon: Smile, emoji: '😊', ring: `${SAGE},0.50)`,          fill: `${SAGE},0.22)`,         text: 'rgba(160, 195, 130, 1)' },
  { name: 'Calm',      icon: Wind,  emoji: '😌', ring: 'rgba(130, 165, 195, 0.5)', fill: 'rgba(100, 130, 160, 0.22)', text: 'rgba(140, 185, 215, 1)' },
  { name: 'Emotional', icon: Frown, emoji: '😢', ring: `${GOLD},0.50)`,           fill: `${TERRACOTTA},0.22)`,   text: `${GOLD},1)` },
  { name: 'Fatigue',   icon: Meh,   emoji: '😫', ring: 'rgba(139, 100, 75, 0.5)',  fill: 'rgba(139, 100, 75, 0.20)', text: 'rgba(200, 160, 120, 1)' },
];

function GlassCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('transition-all duration-300 hover:scale-[1.01]', className)}
      style={{ 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)', 
        borderRadius: 24,
        boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.1)',
        ...style 
      }}
    >
      {children}
    </div>
  );
}

function SectionHead({ children, t }: { children: React.ReactNode; t: ReturnType<typeof tok> }) {
  return <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' as const, fontWeight: 600, color: t.muted, marginBottom: 10, fontFamily: 'var(--font-lora),serif' }}>{children}</p>;
}

function CardLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return <p style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, fontWeight: 500, color, margin: '0 0 4px', opacity: 0.8 }}>{children}</p>;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 5, borderRadius: 2.5, background: 'rgba(255,255,255,0.06)', marginTop: 8, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 2.5, width: `${Math.min(pct, 100)}%`, background: color, transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
    </div>
  );
}

function getInitials(email?: string | null, name?: string | null) {
  if (name) { const n = name.split(' '); return (n[0][0] + (n[n.length-1][0]||'')).toUpperCase(); }
  return email?.[0].toUpperCase() || 'U';
}

export default function DashboardPage() {
  const { user }                = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
    } catch { toast({ title: 'Error', description: 'Could not log mood.', variant: 'destructive' }); }
    finally { setMoodLogging(false); }
  };

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* HEADER */}
        <header style={{ padding: '20px 20px 10px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: t.text, fontFamily: 'var(--font-lora),serif', margin: 0, letterSpacing: -0.5 }}>Hey, {name}!</h1>
            <p  style={{ fontSize: 12, fontStyle: 'italic', color: t.muted, margin: '4px 0 0' }}>Your practice is waiting.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={toggleTheme}
              aria-label="Toggle light/dark mode"
              style={{ width: 40, height: 40, borderRadius: 20, background: t.cardBg, border: `1px solid ${t.goldBorder}`, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              {isDark ? <Sun style={{ width: 18, height: 18, color: t.gold }} /> : <Moon style={{ width: 18, height: 18, color: t.gold }} />}
            </button>
            <Avatar style={{ width: 40, height: 40, border: `2px solid ${t.goldBorder}` }}>
              <AvatarImage src={user?.photoURL ?? undefined} alt={name} />
              <AvatarFallback style={{ background: `${GOLD},0.22)`, color: t.gold, fontSize: 13, fontWeight: 600 }}>
                {getInitials(user?.email, user?.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main style={{ flex: 1, padding: '10px 18px 120px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* §1 MOOD */}
          <section>
            <SectionHead t={t}>How are you feeling?</SectionHead>
            <GlassCard style={{ background: t.cardBg, border: `1px solid ${t.goldBorder}`, borderRadius: '32px 12px 32px 32px', padding: '16px 12px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {MOODS.map(m => {
                  const on = mood === m.name;
                  return (
                    <button key={m.name} onClick={() => logMood(m.name, m.emoji)} disabled={moodLogging}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                    >
                      <div style={{ width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        background: on ? m.fill : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${on ? m.ring : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: on ? `0 0 20px ${m.fill}` : 'none',
                        transform: on ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
                      }}>
                        <m.icon style={{ width: 24, height: 24, color: on ? m.text : 'rgba(255,255,255,0.35)' }} />
                      </div>
                      <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' as const, fontWeight: 600, color: on ? m.text : t.muted }}>{m.name}</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <GlassCard style={{ background: t.cardTerra, border: `1px solid ${t.goldBorder}`, borderRadius: '24px 10px 24px 24px', padding: '16px 18px' }}>
                <CardLabel color={t.gold}>Exercise hours</CardLabel>
                <p style={{ fontSize: 32, fontWeight: 600, color: t.gold, lineHeight: 1.1, margin: '4px 0 0', fontFamily: 'var(--font-lora),serif' }}>
                  {exerciseHrs}<span style={{ fontSize: 14, opacity: 0.6, marginLeft: 3 }}> hrs</span>
                </p>
                <p style={{ fontSize: 10, color: t.muted, fontStyle: 'italic', margin: '4px 0 0' }}>this month</p>
                <Bar pct={(exerciseHrs / 30) * 100} color={`linear-gradient(90deg, ${GOLD},0.6), ${GOLD},0.95))`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 9, color: t.muted }}>goal 30h</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: t.gold }}>{Math.round((exerciseHrs/30)*100)}%</span>
                </div>
              </GlassCard>

              <GlassCard style={{ background: t.cardBg, border: `1px solid ${t.goldBorder}`, borderRadius: '10px 24px 24px 24px', padding: '16px 18px' }}>
                <CardLabel color={t.muted}>Poses analysed</CardLabel>
                <p style={{ fontSize: 32, fontWeight: 600, color: t.text, lineHeight: 1.1, margin: '4px 0 0', fontFamily: 'var(--font-lora),serif' }}>{totalSessions}</p>
                <p style={{ fontSize: 10, color: t.muted, fontStyle: 'italic', margin: '4px 0 0' }}>all time</p>
                <div style={{ marginTop: 10 }}>
                  <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 999, background: `${GOLD},0.18)`, color: t.gold, border: `1px solid ${t.goldBorder}`, letterSpacing: 1, textTransform: 'uppercase' as const, fontWeight: 700 }}>
                    +{monthSessions} this month
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Row B: Streak + Avg score */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <GlassCard style={{ background: t.cardSage, border: `1px solid rgba(140,170,115,0.35)`, borderRadius: '24px 24px 10px 24px', padding: '16px 18px' }}>
                <CardLabel color="rgba(165,200,135,0.85)">Current streak</CardLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 0' }}>
                  <p style={{ fontSize: 32, fontWeight: 600, color: 'rgba(165,200,135,1)', lineHeight: 1.1, margin: 0, fontFamily: 'var(--font-lora),serif' }}>7</p>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(165,200,135,0.75)' }}>days</div>
                    <div style={{ fontSize: 18 }}>🔥</div>
                  </div>
                </div>
                <p style={{ fontSize: 10, color: t.muted, fontStyle: 'italic', margin: '6px 0 0' }}>best: 14 days</p>
              </GlassCard>

              <GlassCard style={{ background: t.cardBg, border: `1px solid ${t.goldBorder}`, borderRadius: '24px 24px 24px 10px', padding: '16px 18px' }}>
                <CardLabel color={t.muted}>Avg pose score</CardLabel>
                <p style={{ fontSize: 32, fontWeight: 600, color: t.gold, lineHeight: 1.1, margin: '4px 0 0', fontFamily: 'var(--font-lora),serif' }}>
                  {avgScore}<span style={{ fontSize: 14, opacity: 0.6, marginLeft: 2 }}>/100</span>
                </p>
                <p style={{ fontSize: 10, color: t.muted, fontStyle: 'italic', margin: '4px 0 0' }}>↑ improving</p>
                <Bar pct={avgScore} color={t.gold} />
              </GlassCard>
            </div>

            {/* Row C: Monthly sessions full-width */}
            <GlassCard style={{ background: t.cardDark, border: `1px solid ${t.goldBorder}`, borderRadius: '16px 32px 32px 16px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <CardLabel color={t.muted}>Monthly sessions</CardLabel>
                  <p style={{ fontSize: 24, fontWeight: 600, color: t.text, fontFamily: 'var(--font-lora),serif', margin: 0 }}>
                    {monthSessions} <span style={{ fontSize: 14, color: t.muted, fontWeight: 400 }}>/ 26 goal</span>
                  </p>
                  <p style={{ fontSize: 11, color: t.muted, fontStyle: 'italic', margin: '4px 0 0' }}>
                    {Math.round((monthSessions/26)*100)}% of monthly goal
                  </p>
                  <Bar pct={(monthSessions/26)*100} color={t.gold} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginLeft: 20, alignItems: 'flex-end' }}>
                  {[1,1,0,1,0,1,1].map((done,i)=>(
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: done ? t.gold : 'rgba(255,255,255,0.08)', boxShadow: done ? `0 0 8px ${t.gold}` : 'none' }} />
                  ))}
                </div>
              </div>
            </GlassCard>
          </section>

          {/* §3 TODAY'S HABITS */}
          <section>
            <SectionHead t={t}>Today's habits</SectionHead>
            <GlassCard style={{ background: t.cardDark, border: `1px solid ${t.goldBorder}`, borderRadius: '24px 24px 16px 24px', padding: '16px 14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[
                  { label: 'Practice', emoji: '🧘', done: true,  color: `${TERRACOTTA},0.9)` },
                  { label: 'Hydrate',  emoji: '💧', done: true,  color: 'rgba(110,170,210,0.9)' },
                  { label: 'Rest',     emoji: '🌙', done: false, color: `${GOLD},0.9)` },
                  { label: 'Sunlight', emoji: '☀️', done: false, color: 'rgba(230,190,90,0.9)' },
                  { label: 'Active',   emoji: '🔥', done: false, color: `${SAGE},0.9)` },
                ].map(h => (
                  <div key={h.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transition: 'all 0.3s ease',
                      background: h.done ? h.color : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${h.done ? h.color : 'rgba(255,255,255,0.08)'}`,
                      transform: h.done ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
                      boxShadow: h.done ? `0 4px 12px ${h.color}33` : 'none',
                    }}>{h.emoji}</div>
                    <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase' as const, fontWeight: 700, color: h.done ? t.text : t.muted }}>{h.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
                {[1,1,0,0,0].map((d,i) => <div key={i} style={{ flex:1, height:4, borderRadius:2, background: d ? t.gold : 'rgba(255,255,255,0.08)', boxShadow: d ? `0 0 6px ${t.gold}44` : 'none' }} />)}
              </div>
              <p style={{ fontSize: 10, color: t.muted, fontStyle: 'italic', marginTop: 6 }}>2 of 5 habits done today</p>
            </GlassCard>
          </section>

          {/* §4 WEEKLY MOOD FLOW */}
          <section>
            <SectionHead t={t}>Weekly mood flow</SectionHead>
            <GlassCard style={{ background: t.cardBg, border: `1px solid ${t.goldBorder}`, borderRadius: '32px 32px 32px 16px', padding: '16px 18px 12px' }}>
              <div style={{ height: 160 }}>
                <MoodChart />
              </div>
            </GlassCard>
          </section>

          {/* §5 CHALLENGES */}
          <section>
            <SectionHead t={t}>Challenges</SectionHead>
            <GlassCard style={{ background: t.cardBark, border: `1px solid ${t.goldBorder}`, borderRadius: '32px 12px 32px 32px', padding: '20px', position: 'relative' as const, overflow: 'hidden' }}>
              <div style={{ position: 'absolute' as const, inset: 0, top: 0, height: 48, background: `linear-gradient(180deg, ${GOLD},0.08), transparent)`, pointerEvents: 'none' as const }} />
              <div style={{ position: 'relative' as const, zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 16, background: `${GOLD},0.18)`, border: `1px solid ${t.goldBorder}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy style={{ width: 22, height: 22, color: t.gold }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: t.text, fontFamily: 'var(--font-lora),serif', margin: '0 0 4px' }}>Join new challenges</h3>
                  <p  style={{ fontSize: 12, color: t.muted, fontStyle: 'italic', margin: 0 }}>Connect with friends and master new poses.</p>
                </div>
              </div>
              <div style={{ position: 'relative' as const, zIndex: 1, marginTop: 18, display: 'flex', gap: 12 }}>
                <Button asChild style={{ flex: 1, height: 46, borderRadius: 23, background: t.gold, color: DEEP_BARK, border: 'none', fontWeight: 700, fontSize: 14, letterSpacing: 1, boxShadow: `0 4px 15px ${t.gold}44` }}>
                  <Link href="/challenges">Explore</Link>
                </Button>
                <Link href="/challenges" style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transition: 'all 0.3s ease' }} className="hover:bg-white/10">
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
