"use client";

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { MessageSquare, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MoodChart } from '@/components/features/dashboard/MoodChart';

const GOLD       = 'rgba(193,154,107';
const PARCHMENT  = 'rgba(255,240,215';
const TERRACOTTA = 'rgba(180,110,65';
const SAGE       = 'rgba(120,140,100';
const DEEP_BARK  = 'rgba(25,16,8';

// Font Stacks
const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function tok(isDark: boolean) {
  return {
    text:        isDark ? `${PARCHMENT},0.90)`  : `${DEEP_BARK},0.95)`,
    muted:       isDark ? `${PARCHMENT},0.38)`  : `${DEEP_BARK},0.55)`,
    gold:        isDark ? `${GOLD},0.90)`        : `rgba(140,100,55,1)`,
    goldBorder:  isDark ? `${GOLD},0.18)`        : `rgba(140,100,55,0.25)`,
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
      fontSize: 11, 
      letterSpacing: '0.28em', 
      textTransform: 'uppercase' as const, 
      color: 'rgba(193,154,107,0.55)', 
      marginBottom: 10, 
      fontFamily: FONT_CASUAL,
      fontWeight: 500
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
  const { user, isGold }        = useAuth();
  const { isDark }              = useTheme();
  const t                       = tok(isDark);
  const router                  = useRouter();

  const [moodData,      setMoodData]      = useState<any|null>(null);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);
  const [exerciseHrs,   setExerciseHrs]   = useState(0);
  const [avgScore,      setAvgScore]      = useState(78);
  const [commitmentDays, setCommitmentDays] = useState(5);
  const [showOverwrite, setShowOverwrite] = useState(false);

  // Exercise goal: an encouraging weekly hours target (≈1h per committed day).
  const exerciseGoal = commitmentDays;

  const name = user?.displayName || user?.email?.split('@')[0] || 'Yogi';

  // Tapping the check-in box goes to mood selection; if already logged today, confirm overwrite first.
  const handleCheckinClick = () => {
    if (moodData) setShowOverwrite(true);
    else router.push('/mood-tracker');
  };

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

    // Fetch the weekly commitment that drives the exercise goal
    getDoc(doc(firestore, 'users', user.uid)).then(s => {
      if (s.exists() && typeof s.data().commitmentDays === 'number') {
        setCommitmentDays(s.data().commitmentDays);
      }
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
    });
    const mStart = startOfMonth(new Date()), mEnd = endOfMonth(new Date());
    getDocs(query(ref, where('createdAt','>=',mStart), where('createdAt','<=',mEnd))).then(s => setMonthSessions(s.size));
    // Weekly exercise hours, measured against the weekly goal
    const wStart = startOfWeek(new Date(), { weekStartsOn: 1 }), wEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    getDocs(query(ref, where('createdAt','>=',wStart), where('createdAt','<=',wEnd))).then(s => setExerciseHrs(Math.round((s.size * 15) / 60 * 10) / 10));
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

        {/* HEADER — prominent profile picture */}
        <header style={{ padding: '20px 16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            {isGold && (
              <span style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%) rotate(-8deg)', fontSize: 20, zIndex: 1 }}>👑</span>
            )}
            <Avatar style={{ width: 76, height: 76, border: `2px solid ${GOLD},0.45)`, boxShadow: `0 0 0 6px ${GOLD},0.06), 0 0 0 12px ${GOLD},0.03)` }}>
              <AvatarImage src={user?.photoURL ?? undefined} alt={name} />
              <AvatarFallback style={{ background: `${GOLD},0.18)`, color: t.gold, fontSize: 26, fontFamily: FONT_PANCAKE, fontWeight: 600 }}>
                {getInitials(user?.email, user?.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: t.text, fontFamily: FONT_PANCAKE, margin: 0, letterSpacing: '-0.5px' }}>Hey, {name}!</h1>
          <div style={{ width: 26, height: 1, background: 'rgba(193,154,107,0.22)', margin: '6px 0 0' }} />
          <p style={{ fontSize: 11, fontStyle: 'italic', color: t.muted, margin: '4px 0 0', fontFamily: FONT_PANCAKE, opacity: 0.8 }}>Your practice is waiting.</p>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main style={{ flex: 1, padding: '4px 14px 120px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* §1 DAILY CHECK-IN (mood + habits merged, whole box tappable) */}
          <section>
            <SectionHead t={t}>Mood & Reflections</SectionHead>
            <div
              onClick={handleCheckinClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCheckinClick(); } }}
              className="active:scale-[0.99] transition-transform cursor-pointer"
            >
              <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '24px 12px 24px 24px', padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, fontFamily: FONT_PANCAKE }}>Daily Check-in</h3>
                      <p style={{ fontSize: 11, color: t.muted, fontFamily: FONT_CASUAL }}>How is your spirit today?</p>
                    </div>
                    <span style={{ fontSize: 20, color: t.gold, lineHeight: 1 }}>›</span>
                  </div>

                  {moodData ? (
                    <div style={{ padding: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 12, border: `0.5px solid ${t.goldBorder}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: moodData.reflection ? 8 : 0 }}>
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

                  {/* Today's habits — merged into the check-in box */}
                  <div style={{ height: 1, background: t.goldBorder, margin: '2px 0' }} />
                  <CardLabel color={t.gold}>Today's habits</CardLabel>
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
                  <div style={{ display: 'flex', gap: 4 }}>
                    {habitsList.map((h, i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: completedHabits.includes(h.id) ? `${GOLD},0.72)` : (isDark ? `${PARCHMENT},0.10)` : 'rgba(0,0,0,0.06)') }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 9, color: t.gold, margin: 0, fontFamily: FONT_CASUAL, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' as const, opacity: 0.7 }}>
                    › Tap anywhere to update your check-in
                  </p>
                </div>
              </GlassCard>
            </div>
          </section>

          {/* §2 MY PROGRESS */}
          <section>
            <SectionHead t={t}>My Progress</SectionHead>

            {/* Row A: Exercise hours + Poses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <GlassCard style={{ background: t.cardTerra, border: `0.5px solid ${t.goldBorder}`, borderRadius: '20px 8px 20px 20px', padding: '12px 14px' }}>
                <CardLabel color={t.gold}>Exercise hours</CardLabel>
                <p style={{ fontSize: 32, fontWeight: 500, color: t.gold, lineHeight: 1, margin: '2px 0 0', fontFamily: FONT_PANCAKE }}>
                  {exerciseHrs}<span style={{ fontSize: 13, opacity: 0.55, marginLeft: 2 }}> hrs</span>
                </p>
                <p style={{ fontSize: 9, color: t.muted, margin: '2px 0 0', fontFamily: FONT_CASUAL, letterSpacing: 1, textTransform: 'uppercase' }}>this week</p>
                <Bar pct={(exerciseHrs / exerciseGoal) * 100} color={`${GOLD},0.78)`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 8, color: t.muted, fontFamily: FONT_CASUAL }}>GOAL {exerciseGoal}H / WEEK</span>
                  <span style={{ fontSize: 8, color: t.gold, fontFamily: FONT_CASUAL }}>{Math.round((exerciseHrs/exerciseGoal)*100)}%</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
          </section>

          {/* §3 MOOD METER */}
          <section>
            <SectionHead t={t}>Mood Meter</SectionHead>
            <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: '24px 24px 24px 12px', padding: '12px 14px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: t.muted, fontFamily: FONT_CASUAL, letterSpacing: 0.5, textTransform: 'uppercase' }}>This week</span>
              </div>
              <div style={{ height: 150 }}>
                <MoodChart />
              </div>
            </GlassCard>
          </section>

          {/* Overwrite confirmation when a mood is already logged today */}
          {showOverwrite && (
            <div
              onClick={() => setShowOverwrite(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 300, background: 'linear-gradient(175deg,#221a16,#0D1821)', border: `0.5px solid ${GOLD},0.30)`, borderRadius: 20, padding: '22px 20px', textAlign: 'center' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${GOLD},0.55)`, background: `${GOLD},0.12)` }}>
                  <RotateCcw style={{ width: 22, height: 22, color: `${GOLD},0.95)` }} />
                </div>
                <h3 style={{ fontFamily: FONT_PANCAKE, fontSize: 19, fontWeight: 500, color: t.text, margin: '0 0 6px' }}>Overwrite today's check-in?</h3>
                <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, margin: '0 0 18px', fontFamily: FONT_CASUAL }}>
                  You've already logged your mood today. Continuing will replace your previous selection.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <Button onClick={() => router.push('/mood-tracker')} style={{ height: 42, borderRadius: 12, border: `1px solid ${GOLD},0.55)`, background: `${GOLD},0.18)`, color: t.text, fontFamily: FONT_PANCAKE, fontSize: 15 }}>
                    Overwrite
                  </Button>
                  <Button onClick={() => setShowOverwrite(false)} variant="ghost" style={{ height: 42, borderRadius: 12, border: `0.5px solid ${t.goldBorder}`, background: `${GOLD},0.05)`, color: t.muted, fontFamily: FONT_PANCAKE, fontSize: 15 }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </AppShell>
  );
}
