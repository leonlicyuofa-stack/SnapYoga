"use client";

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { MessageSquare, RotateCcw, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, getDay, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { MoodChart } from '@/components/features/dashboard/MoodChart';
import { TopBarIcons } from '@/components/layout/top-bar-icons';
import Link from 'next/link';

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
    text:        isDark ? `${PARCHMENT},0.90)`  : `#320E3B`,
    headline:    isDark ? `${PARCHMENT},0.90)`  : `rgba(255,248,235,0.96)`,
    muted:       isDark ? `${PARCHMENT},0.38)`  : `rgba(50,14,59,0.72)`,
    gold:        isDark ? `${GOLD},0.90)`        : `#320E3B`,
    label:       isDark ? `${GOLD},0.55)`        : `#320E3B`,
    accent:      isDark ? `${GOLD},0.90)`        : `#320E3B`,
    goldBorder:  isDark ? `${GOLD},0.18)`        : `rgba(255,255,255,0.40)`,
    cardBg:      isDark ? `linear-gradient(160deg,${PARCHMENT},0.10),${PARCHMENT},0.03))` : `linear-gradient(160deg,rgba(255,255,255,0.32),rgba(255,255,255,0.14))`,
    cardShadow:  isDark ? `0 8px 22px rgba(0,0,0,0.45)` : `0 8px 22px rgba(90,80,120,0.16)`,
    cardHi:      isDark ? `${PARCHMENT},0.10)`   : `rgba(255,255,255,0.60)`,
    chipInner:   isDark ? `${PARCHMENT},0.04)`   : `rgba(255,255,255,0.20)`,
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
      color: t.label,
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

// Circular progress ring with optional centred text — replaces text-heavy stat captions.
function Ring({ size, stroke, pct, color, track, textColor, label, centerTop, centerSub, subColor }: {
  size: number; stroke: number; pct: number; color: string; track: string; textColor: string;
  label?: string; centerTop?: string; centerSub?: string; subColor?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.min(Math.max(pct, 0), 100) / 100);
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} style={{ transition: 'stroke-dashoffset 0.9s ease' }} />
      {label && <text x={c} y={c} dominantBaseline="central" textAnchor="middle" fontSize={size * 0.3} fontWeight={600} fill={textColor} fontFamily={FONT_PANCAKE}>{label}</text>}
      {centerTop && <text x={c} y={c - 4} textAnchor="middle" fontSize={size * 0.26} fontWeight={600} fill={textColor} fontFamily={FONT_PANCAKE}>{centerTop}</text>}
      {centerSub && <text x={c} y={c + 11} textAnchor="middle" fontSize={9} fill={subColor ?? `${GOLD},0.8)`} letterSpacing={1} fontFamily={FONT_CASUAL}>{centerSub}</text>}
    </svg>
  );
}

// Compact stat: icon + number + one word.
function Chip({ emoji, num, word, color, t }: { emoji: string; num: number | string; word: string; color: string; t: ReturnType<typeof tok> }) {
  return (
    <div style={{ background: t.chipInner, border: `0.5px solid ${t.goldBorder}`, borderRadius: 14, padding: '9px 4px', textAlign: 'center', boxShadow: `inset 0 1px 0 ${t.cardHi}` }}>
      <div style={{ fontSize: 14 }}>{emoji}</div>
      <div style={{ fontFamily: FONT_PANCAKE, fontSize: 19, fontWeight: 500, color, lineHeight: 1, margin: '2px 0 0' }}>{num}</div>
      <div style={{ fontSize: 8.5, letterSpacing: '0.06em', color: t.accent, marginTop: 3, fontFamily: FONT_CASUAL, textTransform: 'uppercase' as const }}>{word}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user }                = useAuth();
  const { isDark }              = useTheme();
  const t                       = tok(isDark);
  const router                  = useRouter();

  const [moodData,      setMoodData]      = useState<any|null>(null);
  const [habitWeekCounts, setHabitWeekCounts] = useState<Record<string, number>>({});
  const [totalSessions, setTotalSessions] = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);
  const [exerciseHrs,   setExerciseHrs]   = useState(0);
  const [avgScore,      setAvgScore]      = useState(78);
  const [commitmentDays, setCommitmentDays] = useState(5);
  const [showOverwrite, setShowOverwrite] = useState(false);
  // Weekday indices (Mon=0) that had a practice this week — drives the check-in consistency dots.
  const [weekDays, setWeekDays] = useState<Set<number>>(new Set());
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  // Exercise goal: an encouraging weekly hours target (≈1h per committed day).
  const exerciseGoal = commitmentDays;
  const exPct = exerciseGoal ? (exerciseHrs / exerciseGoal) * 100 : 0;
  const practiceMsg = exPct >= 100 ? 'Goal reached ✦' : exPct >= 50 ? 'On track — keep going' : 'A great time to practice';

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

    // Weekly habit completions — how many days each habit was done this week (drives the bars)
    const weekStartStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    getDocs(query(collection(firestore, 'users', user.uid, 'habits'), where('date', '>=', weekStartStr))).then(snap => {
      const counts: Record<string, number> = {};
      snap.forEach(d => { ((d.data().completed as string[]) || []).forEach(id => { counts[id] = (counts[id] || 0) + 1; }); });
      setHabitWeekCounts(counts);
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
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setTotalSessions(all.length);
      setRecentSessions(all.slice(0, 4));
      const scores = all.filter(a => typeof a.score === 'number').map(a => a.score as number);
      if (scores.length) setAvgScore(Math.round(scores.reduce((a,b)=>a+b,0)/scores.length));
    });
    const mStart = startOfMonth(new Date()), mEnd = endOfMonth(new Date());
    getDocs(query(ref, where('createdAt','>=',mStart), where('createdAt','<=',mEnd))).then(s => setMonthSessions(s.size));
    // Weekly exercise hours, measured against the weekly goal
    const wStart = startOfWeek(new Date(), { weekStartsOn: 1 }), wEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    getDocs(query(ref, where('createdAt','>=',wStart), where('createdAt','<=',wEnd))).then(s => {
      setExerciseHrs(Math.round((s.size * 15) / 60 * 10) / 10);
      const days = new Set<number>();
      s.forEach(d => { const c = (d.data().createdAt as any)?.toDate?.(); if (c) days.add((getDay(c) + 6) % 7); });
      setWeekDays(days);
    });
  }, [user]);

  const habitsList = [
    { id: 'practice', label: 'Practice', emoji: '🧘', color: `${TERRACOTTA},0.85)` },
    { id: 'hydrate',  label: 'Hydrate',  emoji: '💧', color: 'rgba(100,160,200,0.85)' },
    { id: 'rest',     label: 'Rest',     emoji: '🌙', color: `${GOLD},0.85)` },
    { id: 'sunlight', label: 'Sunlight', emoji: '☀️', color: 'rgba(220,180,80,0.85)' },
    { id: 'active',   label: 'Active',   emoji: '🔥', color: `${SAGE},0.85)` },
  ];

  // Session card gradients (amethyst / mocha / plum) — cycled per session, light text on all.
  const sessionThemes = [
    { grad: isDark ? 'linear-gradient(135deg,#4A2E58,#6E4A7E)' : 'linear-gradient(135deg,#5A3B66,#8A5A9A)', icon: '🧘' },
    { grad: isDark ? 'linear-gradient(135deg,#6E5A3C,#93764A)' : 'linear-gradient(135deg,#7B613E,#A88A5E)', icon: '🌿' },
    { grad: isDark ? 'linear-gradient(135deg,#4E3F5C,#6A5580)' : 'linear-gradient(135deg,#6E4C7A,#9D7BAE)', icon: '🌙' },
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* HEADER — compact greeting (left) + top-bar actions incl. profile avatar (right) */}
        <header style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.label, fontFamily: FONT_CASUAL, fontWeight: 600, margin: '0 0 3px', opacity: 0.85 }}>{format(new Date(), 'EEEE · MMM d')}</p>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: isDark ? t.text : 'rgba(255,248,235,0.96)', textShadow: isDark ? 'none' : '0 1px 3px rgba(70,60,80,0.32)', fontFamily: FONT_PANCAKE, margin: 0, letterSpacing: '-0.5px' }}>Hey, {name}!</h1>
          </div>
          <TopBarIcons className="pt-1" />
        </header>

        {/* SCROLLABLE CONTENT */}
        <main style={{ flex: 1, padding: '4px 14px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* THIS WEEK — hero practice ring, check-in dots + quick stat chips */}
          <section>
            <SectionHead t={t}>This Week</SectionHead>

            <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: 20, padding: '14px 18px', boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Ring size={84} stroke={6} pct={exPct} color={t.gold} track={isDark ? `${PARCHMENT},0.08)` : 'rgba(255,255,255,0.20)'} centerTop={`${exerciseHrs}`} centerSub={`OF ${exerciseGoal} HRS`} textColor={t.text} subColor={t.accent} />
                <div>
                  <p style={{ fontFamily: FONT_PANCAKE, fontSize: 19, fontWeight: 500, color: t.headline, margin: 0 }}>Practice</p>
                  <p style={{ fontSize: 11, color: t.muted, margin: '4px 0 0', fontFamily: FONT_CASUAL }}>{practiceMsg}</p>
                </div>
              </div>
              {/* Weekly check-in dots — a passive glance, distinct from the dated practice journal */}
              <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
                {['M','T','W','T','F','S','S'].map((d, i) => {
                  const on = weekDays.has(i);
                  const today = i === (getDay(new Date()) + 6) % 7;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%',
                        background: on ? t.accent : (isDark ? `${PARCHMENT},0.08)` : 'rgba(50,14,59,0.10)'),
                        border: today ? `1.5px solid ${t.accent}` : 'none',
                        boxShadow: today ? `0 0 0 2px ${isDark ? `${GOLD},0.20)` : 'rgba(50,14,59,0.15)'}` : 'none' }} />
                      <span style={{ fontSize: 8, color: t.muted, fontFamily: FONT_CASUAL }}>{d}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 9, color: t.muted, fontFamily: FONT_CASUAL, margin: '6px 0 10px', textAlign: 'center' }}>Check-ins this week · {weekDays.size} of 7</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Chip emoji="🔥" num={7} word="Streak" color={isDark ? 'rgba(160,195,130,0.92)' : t.text} t={t} />
                <Chip emoji="📸" num={totalSessions} word="Poses" color={isDark ? t.text : t.text} t={t} />
                <Chip emoji="⭐" num={avgScore} word="Score" color={isDark ? t.gold : t.text} t={t} />
              </div>
            </GlassCard>
          </section>

          {/* RECENT SESSIONS — the user's latest pose analyses, presented as cards */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.label, fontFamily: FONT_CASUAL, fontWeight: 500, margin: 0 }}>Recent Sessions</p>
              <Link href="/profile/analysis-logs" style={{ fontSize: 11, color: t.accent, textDecoration: 'none' }}>View all ›</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentSessions.length > 0 ? recentSessions.map((s, i) => {
                const th = sessionThemes[i % sessionThemes.length];
                const cue = typeof s.feedback === 'string' && s.feedback ? (s.feedback.length > 62 ? s.feedback.slice(0, 62).trim() + '…' : s.feedback) : 'Tap to view your feedback.';
                const when = s.createdAt?.toDate ? formatDistanceToNow(s.createdAt.toDate(), { addSuffix: true }) : '';
                return (
                  <Link key={s.id} href={`/analysis/${s.id}`} style={{ textDecoration: 'none' }} className="active:scale-[0.98] transition-transform">
                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: '13px 14px', display: 'flex', gap: 10, background: th.grad, boxShadow: '0 10px 24px rgba(50,30,60,0.22)' }}>
                      <div style={{ flex: 1, color: '#F3EAF2' }}>
                        <span style={{ display: 'inline-block', borderRadius: 999, padding: '2px 9px', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', fontFamily: FONT_CASUAL }}>{when}</span>
                        <div style={{ fontFamily: FONT_PANCAKE, fontSize: 18, fontWeight: 600, margin: '6px 0 2px' }}>{s.identifiedPose || 'Practice'}</div>
                        <div style={{ fontSize: 11, opacity: 0.75, lineHeight: 1.4 }}>{cue}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.22)', border: '0.5px solid rgba(255,255,255,0.35)' }}>
                            <Play style={{ width: 13, height: 13, color: '#fff' }} />
                          </div>
                          {typeof s.score === 'number' && <span style={{ fontSize: 12, fontWeight: 600 }}>Score {Math.round(s.score)}</span>}
                        </div>
                      </div>
                      <div style={{ width: 48, height: 48, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, alignSelf: 'center', background: 'rgba(255,255,255,0.16)', border: '0.5px solid rgba(255,255,255,0.22)' }}>{th.icon}</div>
                    </div>
                  </Link>
                );
              }) : (
                <Link href="/snap-yoga" style={{ textDecoration: 'none' }} className="active:scale-[0.98] transition-transform">
                  <GlassCard style={{ background: t.cardBg, border: `0.5px dashed ${t.goldBorder}`, borderRadius: 20, padding: '18px 16px', textAlign: 'center', boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}` }}>
                    <div style={{ fontSize: 22 }}>🧘</div>
                    <p style={{ fontFamily: FONT_PANCAKE, fontSize: 15, color: t.text, margin: '4px 0 0' }}>Start your first practice →</p>
                    <p style={{ fontSize: 11, color: t.muted, margin: '2px 0 0', fontFamily: FONT_CASUAL }}>Analyze a pose to see it here.</p>
                  </GlassCard>
                </Link>
              )}
            </div>
          </section>

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
              <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: 20, padding: '16px', boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}` }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: t.headline, fontFamily: FONT_PANCAKE }}>Daily Check-in</h3>
                      <p style={{ fontSize: 11, color: t.muted, fontFamily: FONT_CASUAL }}>How is your spirit today?</p>
                    </div>
                    <span style={{ fontSize: 20, color: t.accent, lineHeight: 1 }}>›</span>
                  </div>

                  {moodData ? (
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: `0.5px solid ${t.goldBorder}` }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: `0.5px dashed ${t.goldBorder}` }}>
                      <MessageSquare style={{ width: 18, height: 18, color: t.muted }} />
                      <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>No reflection logged yet. Checking in helps track your mindful progress.</p>
                    </div>
                  )}

                  {/* This week's habit consistency — completion bars (days done of 7) */}
                  <div style={{ height: 1, background: t.goldBorder, margin: '2px 0' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {habitsList.map(h => {
                      const cnt = habitWeekCounts[h.id] || 0;
                      const pct = (cnt / 7) * 100;
                      return (
                        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>{h.emoji}</span>
                          <span style={{ fontSize: 12, width: 56, color: isDark ? `${PARCHMENT},0.62)` : 'rgba(50,14,59,0.68)', fontFamily: FONT_CASUAL }}>{h.label}</span>
                          <div style={{ flex: 1, height: 9, borderRadius: 6, background: isDark ? `${PARCHMENT},0.07)` : 'rgba(50,14,59,0.10)', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.10)' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 6, background: h.color, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)', transition: 'width 0.9s ease' }} />
                          </div>
                          <span style={{ fontSize: 10, width: 22, textAlign: 'right', color: t.muted, fontFamily: FONT_CASUAL }}>{cnt}/7</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>

          {/* §3 MOOD METER */}
          <section>
            <SectionHead t={t}>Mood Meter</SectionHead>
            <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: 20, padding: '12px 14px 8px', boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}` }}>
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
                <h3 style={{ fontFamily: FONT_PANCAKE, fontSize: 19, fontWeight: 500, color: `${PARCHMENT},0.92)`, margin: '0 0 6px' }}>Overwrite today's check-in?</h3>
                <p style={{ fontSize: 12, color: `${PARCHMENT},0.55)`, lineHeight: 1.5, margin: '0 0 18px', fontFamily: FONT_CASUAL }}>
                  You've already logged your mood today. Continuing will replace your previous selection.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <Button onClick={() => router.push('/mood-tracker')} style={{ height: 42, borderRadius: 12, border: `1px solid ${GOLD},0.55)`, background: `${GOLD},0.18)`, color: `${PARCHMENT},0.92)`, fontFamily: FONT_PANCAKE, fontSize: 15 }}>
                    Overwrite
                  </Button>
                  <Button onClick={() => setShowOverwrite(false)} variant="ghost" style={{ height: 42, borderRadius: 12, border: `0.5px solid ${GOLD},0.25)`, background: `${GOLD},0.05)`, color: `${PARCHMENT},0.6)`, fontFamily: FONT_PANCAKE, fontSize: 15 }}>
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
