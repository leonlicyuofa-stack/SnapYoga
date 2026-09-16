"use client";

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, getDay, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { MoodChart, type MoodWeekSummary } from '@/components/features/dashboard/MoodChart';
import { allCollectibles, type Collectible } from '@/components/features/dashboard/rock-data';
import { TopBarIcons } from '@/components/layout/top-bar-icons';
import { MoonStreakIcon, MoonSalutationIcon, PuffyStarIcon } from '@/components/icons/SystemSignalIcons';
import { PracticeIcon, HydrateIcon, RestIcon, SunlightIcon, ActiveIcon } from '@/components/icons/HabitIcons';
import Link from 'next/link';

const GOLD       = 'rgba(193,154,107';
const PARCHMENT  = 'rgba(255,240,215';
const TERRACOTTA = 'rgba(180,110,65';
const SAGE       = 'rgba(120,140,100';
const DEEP_BARK  = 'rgba(25,16,8';

// Font Stacks
const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const COLLECTIBLE_RANK: Record<Collectible['rarity'], number> = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4 };

// Which collectibles are earned. Placeholder for now — the same three the
// collection page shows — until earning is recorded against the account.
const collectedIds = ['welcome_mat', 'first_analysis_block', 'join_challenge_strap'];

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
    // The hero panel is solid, not frosted — the same material as the profile
    // cover, so the top of the page reads as a different object.
    heroBg:      isDark ? 'linear-gradient(150deg,#3A2D1E 0%,#2A2320 52%,#1E1A20 100%)' : 'linear-gradient(150deg,#5B3A6E 0%,#3E2352 55%,#320E3B 100%)',
    heroLine:    isDark ? 'rgba(193,154,107,0.30)' : 'rgba(255,248,235,0.32)',
    heroInk:     isDark ? `${PARCHMENT},0.96)`     : 'rgba(255,248,235,0.97)',
  };
}

/** Bento tile shell — smaller radius than the cards, so the row reads as its own row. */
function tileStyle(t: ReturnType<typeof tok>): React.CSSProperties {
  return {
    borderRadius: 18,
    border: `0.5px solid ${t.goldBorder}`,
    background: t.cardBg,
    boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}`,
    padding: '13px 13px 11px',
    position: 'relative',
    overflow: 'hidden',
  };
}

function tileWord(t: ReturnType<typeof tok>): React.CSSProperties {
  return {
    fontSize: 8.5,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    fontWeight: 700,
    color: t.muted,
    margin: '4px 0 0',
    fontFamily: FONT_CASUAL,
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
  const [moodWeek,      setMoodWeek]      = useState<MoodWeekSummary>({ logged: 0, dominant: null });
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
    { id: 'practice', label: 'Practice', Icon: PracticeIcon, color: `${TERRACOTTA},0.85)` },
    { id: 'hydrate',  label: 'Hydrate',  Icon: HydrateIcon,  color: 'rgba(100,160,200,0.85)' },
    { id: 'rest',     label: 'Rest',     Icon: RestIcon,     color: `${GOLD},0.85)` },
    { id: 'sunlight', label: 'Sunlight', Icon: SunlightIcon, color: 'rgba(220,180,80,0.85)' },
    { id: 'active',   label: 'Active',   Icon: ActiveIcon,   color: `${SAGE},0.85)` },
  ];

  // Session card gradients (amethyst / mocha / plum) — cycled per session, light text on all.
  const sessionThemes = [
    { grad: isDark ? 'linear-gradient(135deg,#4A2E58,#6E4A7E)' : 'linear-gradient(135deg,#5A3B66,#8A5A9A)', icon: '🧘' },
    { grad: isDark ? 'linear-gradient(135deg,#6E5A3C,#93764A)' : 'linear-gradient(135deg,#7B613E,#A88A5E)', icon: '🌿' },
    { grad: isDark ? 'linear-gradient(135deg,#4E3F5C,#6A5580)' : 'linear-gradient(135deg,#6E4C7A,#9D7BAE)', icon: '🌙' },
  ];

  return (
    <AppShell>
      {/* The collection and session rails scroll by swipe; their scrollbars would
          only be clutter on a phone. */}
      <style>{`
        .sy-rail{ -ms-overflow-style:none; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
        .sy-rail::-webkit-scrollbar{ display:none; }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* HEADER — compact greeting (left) + top-bar actions incl. profile avatar (right) */}
        <header style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.label, fontFamily: FONT_CASUAL, fontWeight: 600, margin: '0 0 3px', opacity: 0.85 }}>{format(new Date(), 'EEEE · MMM d')}</p>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: isDark ? t.text : 'rgba(255,248,235,0.96)', textShadow: isDark ? 'none' : '0 1px 3px rgba(70,60,80,0.32)', fontFamily: FONT_PANCAKE, margin: 0, letterSpacing: '-0.5px' }}>Hey, {name}!</h1>
          </div>
          {/* Beside the greeting, not above it — no gap to add. */}
          <TopBarIcons className="mb-0" />
        </header>

        {/* SCROLLABLE CONTENT */}
        <main style={{ flex: 1, padding: '4px 14px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* ── 1 · HERO — a solid panel, not another frosted card, so the page has a top */}
          <section>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, padding: '18px 18px 16px', background: t.heroBg, border: `1px solid ${t.heroLine}`, boxShadow: t.cardShadow, color: t.heroInk }}>
              {/* orbit motif, bleeding off the corner */}
              <div aria-hidden="true" style={{ position: 'absolute', top: -70, right: -56, width: 190, height: 190, borderRadius: '50%', border: `1px dashed ${t.heroLine}` }} />
              <div aria-hidden="true" style={{ position: 'absolute', top: -34, right: -20, width: 120, height: 120, borderRadius: '50%', border: `1px solid ${t.heroLine}`, opacity: 0.5 }} />

              <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 8.5, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.72, margin: 0, fontFamily: FONT_CASUAL }}>This week · practice</p>
                  <p style={{ fontFamily: FONT_PANCAKE, fontSize: 50, fontWeight: 600, lineHeight: 0.92, letterSpacing: '-1px', margin: '5px 0 0' }}>
                    {exerciseHrs}
                    <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.72, marginLeft: 4, letterSpacing: 0 }}>of {exerciseGoal} hrs</span>
                  </p>
                  <p style={{ fontSize: 11, opacity: 0.74, margin: '6px 0 0', lineHeight: 1.45, maxWidth: '20ch', fontFamily: FONT_CASUAL }}>{practiceMsg}</p>
                </div>
                <Ring
                  size={86} stroke={6} pct={exPct}
                  color={t.heroInk}
                  track={isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.22)'}
                  centerTop={`${Math.round(exPct)}%`} centerSub="GOAL"
                  textColor={t.heroInk} subColor={t.heroInk}
                />
              </div>

              {/* the week at a glance */}
              <div style={{ position: 'relative', display: 'flex', gap: 4, marginTop: 14 }}>
                {['M','T','W','T','F','S','S'].map((d, i) => {
                  const on = weekDays.has(i);
                  const today = i === (getDay(new Date()) + 6) % 7;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: on ? t.heroInk : 'rgba(255,255,255,0.18)', opacity: on ? 0.92 : 1, boxShadow: today ? '0 0 0 3px rgba(255,255,255,0.16)' : 'none' }} />
                      <span style={{ fontSize: 7.5, opacity: 0.6, fontFamily: FONT_CASUAL }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── 2 · BENTO — deliberately uneven: one tall tile beside two short ones */}
          <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 10 }}>
            <div style={{ ...tileStyle(t), display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: 30, display: 'flex', alignItems: 'center' }}><MoonStreakIcon size={28} /></div>
                <p style={{ fontFamily: FONT_PANCAKE, fontSize: 32, fontWeight: 600, lineHeight: 1, color: t.text, margin: '9px 0 0' }}>{weekDays.size}</p>
                <p style={tileWord(t)}>Days practised</p>
              </div>
              {/* a real micro-chart of the week, not decoration */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 26, marginTop: 10 }}>
                {[0,1,2,3,4,5,6].map(i => (
                  <span key={i} style={{ flex: 1, height: weekDays.has(i) ? '100%' : 6, borderRadius: 2, background: weekDays.has(i) ? t.accent : (isDark ? `${PARCHMENT},0.10)` : 'rgba(50,14,59,0.12)') }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10 }}>
              <div style={{ ...tileStyle(t), display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px' }}>
                <MoonSalutationIcon size={28} />
                <div>
                  <p style={{ fontFamily: FONT_PANCAKE, fontSize: 24, fontWeight: 600, lineHeight: 1, color: t.text, margin: 0 }}>{totalSessions}</p>
                  <p style={{ ...tileWord(t), margin: '1px 0 0' }}>Poses</p>
                </div>
              </div>
              <div style={{ ...tileStyle(t), display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px' }}>
                <PuffyStarIcon size={28} />
                <div>
                  <p style={{ fontFamily: FONT_PANCAKE, fontSize: 24, fontWeight: 600, lineHeight: 1, color: t.text, margin: 0 }}>{avgScore}</p>
                  <p style={{ ...tileWord(t), margin: '1px 0 0' }}>Avg score</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3 · MOOD METER — brought up the page and given a headline */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
              <SectionHead t={t}>Mood Meter</SectionHead>
              <Link href="/mood-tracker" style={{ fontSize: 10, color: t.accent, textDecoration: 'none' }}>Log today ›</Link>
            </div>
            <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: 20, padding: '14px 12px 8px', boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 3px 4px' }}>
                <span style={{ fontFamily: FONT_PANCAKE, fontSize: 16, fontWeight: 600, color: t.text }}>
                  {moodWeek.dominant ? `Mostly ${moodWeek.dominant.toLowerCase()}` : 'No moods logged yet'}
                </span>
                <span style={{ fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 999, padding: '3px 9px', background: 'rgba(151,196,89,0.18)', color: isDark ? 'rgba(176,214,124,0.98)' : '#5A7F2E', border: '0.5px solid rgba(151,196,89,0.40)' }}>
                  {moodWeek.logged} of 7 logged
                </span>
              </div>
              <div style={{ height: 150 }}>
                <MoodChart onSummary={setMoodWeek} />
              </div>
            </GlassCard>
          </section>

          {/* ── 4 · COLLECTION — the reward moment, as a rail of real artwork */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
              <SectionHead t={t}>Your Collection</SectionHead>
              <Link href="/yoga-collection" style={{ fontSize: 10, color: t.accent, textDecoration: 'none' }}>See all ›</Link>
            </div>
            <div className="sy-rail" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x mandatory' }}>
              {allCollectibles.map(c => {
                const got = collectedIds.includes(c.id);
                const rank = COLLECTIBLE_RANK[c.rarity];
                return (
                  <Link key={c.id} href="/yoga-collection" style={{ flex: '0 0 84px', scrollSnapAlign: 'start', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ width: 84, height: 84, borderRadius: 20, overflow: 'hidden', border: `0.5px solid ${t.goldBorder}`, background: t.chipInner, boxShadow: t.cardShadow }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: got ? 'none' : 'grayscale(1)', opacity: got ? 1 : 0.45 }} />
                    </div>
                    <p style={{ fontFamily: FONT_PANCAKE, fontSize: 12, fontWeight: 600, color: t.text, margin: '6px 0 0', lineHeight: 1.2 }}>{c.name}</p>
                    <span style={{ display: 'flex', gap: 2.5, justifyContent: 'center', marginTop: 4 }}>
                      {[1,2,3,4].map(i => (
                        <span key={i} style={{ width: 4, height: 4, transform: 'rotate(45deg)', borderRadius: 1, background: t.accent, opacity: i <= rank ? 1 : 0.28 }} />
                      ))}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 999, background: t.chipInner, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(collectedIds.length / allCollectibles.length) * 100}%`, borderRadius: 999, background: t.accent, transition: 'width 0.9s ease' }} />
              </div>
              <span style={{ fontSize: 9, color: t.muted, fontFamily: FONT_CASUAL }}>{collectedIds.length} of {allCollectibles.length}</span>
            </div>
          </section>

          {/* ── 5 · DAILY CHECK-IN — habits as dials rather than a fifth stack of bars */}
          <section>
            <SectionHead t={t}>Daily Check-in</SectionHead>
            <div
              onClick={handleCheckinClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCheckinClick(); } }}
              className="active:scale-[0.99] transition-transform cursor-pointer"
            >
              <GlassCard style={{ background: t.cardBg, border: `0.5px solid ${t.goldBorder}`, borderRadius: 20, padding: '14px 13px 12px', boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: t.text, fontFamily: FONT_PANCAKE, margin: 0 }}>
                      {moodData ? `${moodData.emoji} ${moodData.name}` : 'How is your spirit today?'}
                    </h3>
                    <p style={{ fontSize: 11, color: t.muted, fontFamily: FONT_CASUAL, margin: '2px 0 0' }}>
                      {moodData?.reflection
                        ? `“${moodData.reflection.length > 60 ? moodData.reflection.slice(0, 60) + '…' : moodData.reflection}”`
                        : 'Tap to log your mood and habits.'}
                    </p>
                  </div>
                  <span style={{ fontSize: 20, color: t.accent, lineHeight: 1 }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                  {habitsList.map(h => {
                    const cnt = habitWeekCounts[h.id] || 0;
                    const Icon = h.Icon;
                    return (
                      <div key={h.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <div style={{ position: 'relative', width: 40, height: 40 }}>
                          <Ring size={40} stroke={3.4} pct={(cnt / 7) * 100} color={h.color} track={isDark ? `${PARCHMENT},0.08)` : 'rgba(50,14,59,0.10)'} textColor={t.text} />
                          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} /></span>
                        </div>
                        <b style={{ fontSize: 9, fontWeight: 700, color: t.muted, fontFamily: FONT_CASUAL }}>{cnt}/7</b>
                        <span style={{ fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted, fontFamily: FONT_CASUAL }}>{h.label}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          </section>

          {/* ── 6 · RECENT SESSIONS — scrolls sideways, so the page ends in movement */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
              <SectionHead t={t}>Recent Sessions</SectionHead>
              <Link href="/profile/analysis-logs" style={{ fontSize: 10, color: t.accent, textDecoration: 'none' }}>View all ›</Link>
            </div>
            {recentSessions.length > 0 ? (
              <div className="sy-rail" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x mandatory' }}>
                {recentSessions.map((s, i) => {
                  const th = sessionThemes[i % sessionThemes.length];
                  const when = s.createdAt?.toDate ? formatDistanceToNow(s.createdAt.toDate(), { addSuffix: true }) : '';
                  return (
                    <Link key={s.id} href={`/analysis/${s.id}`} style={{ flex: '0 0 168px', scrollSnapAlign: 'start', textDecoration: 'none' }} className="active:scale-[0.98] transition-transform">
                      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, padding: '12px 13px', minHeight: 112, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: th.grad, boxShadow: '0 10px 24px rgba(50,30,60,0.24)', color: '#F3EAF2' }}>
                        <span style={{ alignSelf: 'flex-start', borderRadius: 999, padding: '2px 8px', fontSize: 8, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', fontFamily: FONT_CASUAL }}>{when}</span>
                        <div>
                          <div style={{ fontFamily: FONT_PANCAKE, fontSize: 16, fontWeight: 600, margin: '7px 0 0' }}>{s.identifiedPose || 'Practice'}</div>
                          {typeof s.score === 'number' && <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>Score {Math.round(s.score)}</div>}
                        </div>
                        <span style={{ position: 'absolute', right: 11, bottom: 11, width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', border: '0.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play style={{ width: 11, height: 11, color: '#fff' }} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Link href="/snap-yoga" style={{ textDecoration: 'none' }} className="active:scale-[0.98] transition-transform">
                <GlassCard style={{ background: t.cardBg, border: `0.5px dashed ${t.goldBorder}`, borderRadius: 20, padding: '18px 16px', textAlign: 'center', boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}` }}>
                  <div style={{ fontSize: 22 }}>🧘</div>
                  <p style={{ fontFamily: FONT_PANCAKE, fontSize: 15, color: t.text, margin: '4px 0 0' }}>Start your first practice →</p>
                  <p style={{ fontSize: 11, color: t.muted, margin: '2px 0 0', fontFamily: FONT_CASUAL }}>Analyze a pose to see it here.</p>
                </GlassCard>
              </Link>
            )}
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
