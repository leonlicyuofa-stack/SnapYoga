"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Smile, Wind, Frown, Meh, Trophy, Sun, Moon, MessageSquare, ArrowRight, Sparkles, Zap, Activity, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MoodChart } from '@/components/features/dashboard/MoodChart';
import { PracticeCalendarSnapshot } from '@/components/features/dashboard/PracticeCalendarSnapshot';
import { UpgradeBanner } from '@/components/features/dashboard/UpgradeBanner';

const GOLD       = 'rgba(193,154,107';
const PARCHMENT  = 'rgba(255,240,215';
const TERRACOTTA = 'rgba(180,110,65';
const SAGE       = 'rgba(120,140,100';
const DEEP_BARK  = 'rgba(25,16,8';
const BARK_L     = 'rgba(60,38,18';

// Font Stacks
const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function tok(isDark: boolean) {
  return {
    text:        isDark ? `${PARCHMENT},0.90)`  : `${DEEP_BARK},0.95)`,
    muted:       isDark ? `${PARCHMENT},0.38)`  : `${DEEP_BARK},0.55)`,
    gold:        isDark ? `${GOLD},0.90)`        : `rgba(140,100,55,1)`,
    goldBorder:  isDark ? `${GOLD},0.22)`        : `rgba(140,100,55,0.25)`,
    cardBg:      isDark ? `${GOLD},0.07)`        : `rgba(255,255,255,0.65)`,
    cardTerra:   isDark ? `${TERRACOTTA},0.18)`  : `rgba(200,135,85,0.12)`,
    cardSage:    isDark ? `${SAGE},0.18)`        : `rgba(120,155,95,0.14)`,
    cardBark:    isDark ? `${DEEP_BARK},0.65)`   : `rgba(255,255,255,0.85)`,
    cardDark:    isDark ? `${DEEP_BARK},0.50)`   : `rgba(255,255,255,0.75)`,
  };
}

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

function SectionHead({ children, t }: { children: React.ReactNode; t: ReturnType<typeof tok> }) {
  return (
    <p style={{ 
      fontSize: 10, 
      letterSpacing: 3.5, 
      textTransform: 'uppercase' as const, 
      color: t.muted, 
      marginBottom: 10, 
      fontFamily: FONT_CASUAL,
      fontWeight: 600
    }}>
      {children}
    </p>
  );
}

function CardLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p style={{ 
      fontSize: 9, 
      letterSpacing: 2.2, 
      textTransform: 'uppercase' as const, 
      color, 
      margin: '0 0 4px', 
      fontFamily: FONT_CASUAL,
      fontWeight: 500
    }}>
      {children}
    </p>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.05)', marginTop: 6 }}>
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
  const t                       = tok(isDark);

  const [moodData,      setMoodData]      = useState<any|null>(null);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);
  const [exerciseHrs,   setExerciseHrs]   = useState(0);
  const [avgScore,      setAvgScore]      = useState(78);

  const name = user?.displayName || user?.email?.split('@')[0] || 'Yogi';

  useEffect(() => {
    if (!user) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Fetch Mood
    getDoc(doc(firestore, 'users', user.uid, 'moods', todayStr)).then(s => { 
      if (s.exists()) setMoodData(s.data()); 
    });

    // Fetch Habits
    getDoc(doc(firestore, 'users', user.uid, 'habits', todayStr)).then(s => {
      if (s.exists()) setCompletedHabits(s.data().completed || []);
    });
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

  const habitsList = [
    { id: 'practice', label: 'Practice', emoji: '🧘', color: `${TERRACOTTA},0.85)` },
    { id: 'hydrate',  label: 'Hydrate',  emoji: '💧', color: 'rgba(100,160,200,0.85)' },
    { id: 'rest',     label: 'Rest',     emoji: '🌙', color: `${GOLD},0.85)` },
    { id: 'sunlight', label: 'Sunlight', emoji: '☀️', color: 'rgba(220,180,80,0.85)' },
    { id: 'active',   label: 'Active',   emoji: '🔥', color: `${SAGE},0.85)` },
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>

        {/* HEADER */}
        <header style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: t.text, fontFamily: FONT_PANCAKE, margin: 0, letterSpacing: '-0.5px' }}>Hey, {name}!</h1>
            <p  style={{ fontSize: 11, fontStyle: 'italic', color: t.muted, margin: '2px 0 0', fontFamily: FONT_PANCAKE, opacity: 0.8 }}>Your practice is waiting.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar style={{ width: 34, height: 34, border: `1.5px solid ${t.goldBorder}` }}>
              <AvatarImage src={user?.photoURL ?? undefined} alt={name} />
              <AvatarFallback style={{ background: `${GOLD},0.18)`, color: t.gold, fontSize: 11, fontFamily: FONT_CASUAL, fontWeight: 600 }}>
                {getInitials(user?.email, user?.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main style={{ flex: 1, padding: '4px 14px 120px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Upgrade banner — only renders for free users */}
          <UpgradeBanner />

          {/* §1 MOOD & REFLECTIONS */}
          <section>
            <SectionHead t={t}>Mood & Reflections</SectionHead>
            <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '24px 12px 24px 24px', padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, fontFamily: FONT_PANCAKE }}>Daily Check-in</h3>
                    <p style={{ fontSize: 11, color: t.muted, fontFamily: FONT_CASUAL }}>How is your spirit today?</p>
                  </div>
                  <Button asChild style={{ height: 32, borderRadius: 16, background: `${GOLD},0.15)`, color: t.gold, border: `0.5px solid ${t.goldBorder}`, padding: '0 12px', fontSize: 11, fontWeight: 600 }}>
                    <Link href="/mood-tracker">
                      {moodData ? 'Update' : 'Start'}
                    </Link>
                  </Button>
                </div>

                {moodData ? (
                  <div style={{ padding: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 12, border: `0.5px solid ${t.goldBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{moodData.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.gold, textTransform: 'uppercase', letterSpacing: 1, fontFamily: FONT_CASUAL }}>{moodData.name}</span>
                    </div>
                    {moodData.reflection && (
                      <p style={{ fontSize: 12, color: t.text, fontStyle: 'italic', margin: 0, opacity: 0.8, lineHeight: 1.4 }}>
                        "{moodData.reflection.length > 80 ? moodData.reflection.substring(0, 80) + '...' : moodData.reflection}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderRadius: 12, border: '0.5px dashed rgba(0,0,0,0.1)' }}>
                    <MessageSquare style={{ width: 18, height: 18, color: t.muted }} />
                    <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>No reflection logged yet. Checking in helps track your mindful progress.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </section>

          {/* §2 TODAY'S HABITS */}
          <section>
            <SectionHead t={t}>Today's habits</SectionHead>
            <Link href="/mood-tracker" className="block active:scale-95 transition-transform">
              <GlassCard style={{ background: t.cardDark, border: `0.5px solid ${t.goldBorder}`, borderRadius: '20px 20px 12px 20px', padding: '16px 10px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {habitsList.map(h => {
                    const done = completedHabits.includes(h.id);
                    return (
                      <div key={h.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          background: done ? h.color : (isDark ? `${PARCHMENT},0.05)` : 'rgba(0,0,0,0.04)'),
                          border: `0.5px solid ${done ? h.color : (isDark ? `${PARCHMENT},0.10)` : 'rgba(0,0,0,0.06)')}`,
                          transform: done ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: done ? `0 4px 12px ${h.color}` : 'none'
                        }}>{h.emoji}</div>
                        <span style={{ fontSize: 7, letterSpacing: 1.2, textTransform: 'uppercase' as const, fontFamily: FONT_CASUAL, fontWeight: 600, color: done ? t.text : t.muted }}>{h.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
                  {habitsList.map((h, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: completedHabits.includes(h.id) ? `${GOLD},0.72)` : (isDark ? `${PARCHMENT},0.10)` : 'rgba(0,0,0,0.06)') }} />
                  ))}
                </div>
                <p style={{ fontSize: 9, color: t.muted, margin: '6px 0 0', fontFamily: FONT_CASUAL, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' as const }}>
                  {completedHabits.length} of 5 habits done today
                </p>
              </GlassCard>
            </Link>
          </section>

          {/* §3 MY PROGRESS */}
          <section>
            <SectionHead t={t}>My Progress</SectionHead>

            {/* Row A: Exercise hours + Poses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <GlassCard style={{ background: t.cardTerra, border: `0.5px solid ${t.goldBorder}`, borderRadius: '20px 8px 20px 20px', padding: '12px 14px' }}>
                <CardLabel color={t.gold}>Exercise hours</CardLabel>
                <p style={{ fontSize: 32, fontWeight: 500, color: t.gold, lineHeight: 1, margin: '2px 0 0', fontFamily: FONT_PANCAKE }}>
                  {exerciseHrs}<span style={{ fontSize: 13, opacity: 0.55, marginLeft: 2 }}> hrs</span>
                </p>
                <p style={{ fontSize: 9, color: t.muted, margin: '2px 0 0', fontFamily: FONT_CASUAL, letterSpacing: 1, textTransform: 'uppercase' }}>this month</p>
                <Bar pct={(exerciseHrs / 30) * 100} color={`${GOLD},0.78)`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 8, color: t.muted, fontFamily: FONT_CASUAL }}>GOAL 30H</span>
                  <span style={{ fontSize: 8, color: t.gold, fontFamily: FONT_CASUAL }}>{Math.round((exerciseHrs/30)*100)}%</span>
                </div>
              </GlassCard>

              <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '8px 20px 20px 20px', padding: '12px 14px' }}>
                <CardLabel color={t.muted}>Poses analysed</CardLabel>
                <p style={{ fontSize: 32, fontWeight: 500, color: t.text, lineHeight: 1, margin: '2px 0 0', fontFamily: FONT_PANCAKE }}>{totalSessions}</p>
                <p style={{ fontSize: 9, color: t.muted, margin: '2px 0 0', fontFamily: FONT_CASUAL, letterSpacing: 1, textTransform: 'uppercase' }}>all time</p>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 8, padding: '2px 7px', borderRadius: 999, background: `${GOLD},0.14)`, color: t.gold, border: `0.5px solid ${t.goldBorder}`, letterSpacing: 1.2, textTransform: 'uppercase' as const, fontFamily: FONT_CASUAL, fontWeight: 600 }}>
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
                  <p style={{ fontSize: 32, fontWeight: 500, color: 'rgba(160,195,130,0.92)', lineHeight: 1, margin: 0, fontFamily: FONT_PANCAKE }}>7</p>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(160,195,130,0.70)', fontFamily: FONT_CASUAL, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>days</div>
                    <div style={{ fontSize: 16 }}>🔥</div>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: t.muted, margin: '3px 0 0', fontFamily: FONT_CASUAL, textTransform: 'uppercase' }}>BEST: 14 DAYS</p>
              </GlassCard>

              <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '20px 20px 20px 8px', padding: '12px 14px' }}>
                <CardLabel color={t.muted}>Avg pose score</CardLabel>
                <p style={{ fontSize: 32, fontWeight: 500, color: t.gold, lineHeight: 1, margin: '2px 0 0', fontFamily: FONT_PANCAKE }}>
                  {avgScore}<span style={{ fontSize: 13, opacity: 0.50, marginLeft: 1 }}>/100</span>
                </p>
                <p style={{ fontSize: 9, color: t.muted, margin: '2px 0 0', fontFamily: FONT_CASUAL, letterSpacing: 1, textTransform: 'uppercase' }}>↑ improving</p>
                <Bar pct={avgScore} color={`${GOLD},0.72)`} />
              </GlassCard>
            </div>

            {/* Row C: Monthly sessions full-width */}
            <GlassCard style={{ background: t.cardDark, border: `0.5px solid ${t.goldBorder}`, borderRadius: '12px 24px 24px 12px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <CardLabel color={t.muted}>Monthly sessions</CardLabel>
                  <p style={{ fontSize: 24, fontWeight: 500, color: t.text, fontFamily: FONT_PANCAKE, margin: 0 }}>
                    {monthSessions} <span style={{ fontSize: 14, color: t.muted, fontWeight: 400 }}>/ 26 goal</span>
                  </p>
                  <p style={{ fontSize: 10, color: t.muted, margin: '3px 0 0', fontFamily: FONT_CASUAL, letterSpacing: 0.5 }}>
                    {Math.round((monthSessions/26)*100)}% of monthly goal
                  </p>
                  <Bar pct={(monthSessions/26)*100} color={`${GOLD},0.78)`} />
                </div>
                <div style={{ display: 'flex', gap: 4, marginLeft: 16, alignItems: 'flex-end' }}>
                  {[1,1,0,1,0,1,1].map((done,i)=>(
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: done ? `${GOLD},0.80)` : (isDark ? `${PARCHMENT},0.12)` : 'rgba(0,0,0,0.06)') }} />
                  ))}
                </div>
              </div>
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
            <GlassCard style={{ background: isDark ? t.cardBark : 'rgba(255,255,255,0.95)', border: `0.8px solid ${t.goldBorder}`, borderRadius: '28px 12px 28px 28px', padding: '16px', position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, inset: 0, top: 0, height: 42, borderRadius: '28px 12px 0 0', background: `${GOLD},0.06)`, pointerEvents: 'none' as const }} />
              <div style={{ position: 'relative' as const, zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, background: `${GOLD},0.14)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy style={{ width: 20, height: 20, color: t.gold }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 500, color: t.text, fontFamily: FONT_PANCAKE, margin: '0 0 2px' }}>Join new challenges</h3>
                  <p  style={{ fontSize: 11, color: t.muted, fontFamily: FONT_CASUAL, letterSpacing: 0.2, margin: 0 }}>Connect with friends and master new poses.</p>
                </div>
              </div>
              <div style={{ position: 'relative' as const, zIndex: 1, marginTop: 14, display: 'flex', gap: 10 }}>
                <Button asChild style={{ flex: 1, height: 42, borderRadius: 21, background: `${GOLD},0.80)`, color: `${DEEP_BARK},0.95)`, border: 'none', fontFamily: FONT_CASUAL, fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>
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
