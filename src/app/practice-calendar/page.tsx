"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, doc, getDoc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { format, startOfWeek, startOfMonth, endOfMonth, getDaysInMonth, isSameDay, addDays, startOfDay } from 'date-fns';
import { CheckCircle2, Loader2, Sparkles, BrainCircuit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { analyzeReflectionThemes, type ReflectionThemesOutput } from '@/ai/flows/analyze-reflection-themes';
import { Button } from '@/components/ui/button';
import { TopBarIcons } from '@/components/layout/top-bar-icons';
import { getMoonPhase, getSuggestedPractices, pickPrizeForDate, getPrizeById } from '@/lib/moon';
import { MoonPhaseRingLoader } from '@/components/layout/moon-phase-ring-loader';

// ─── Brand tokens ────────────────────────────────────────────────────────────
const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function getThemeTokens(isDark: boolean) {
  return {
    title: isDark ? 'rgba(255,240,215,0.92)' : 'rgba(255,248,235,0.96)',
    titleShadow: isDark ? 'none' : '0 1px 3px rgba(70,60,80,0.32)',
    text: isDark ? 'rgba(255,240,215,0.92)' : '#320E3B',
    muted: isDark ? 'rgba(255,240,215,0.40)' : 'rgba(50,14,59,0.60)',
    cardBg: isDark ? `rgba(13,20,30,0.50)` : `rgba(255,255,255,0.12)`,
    cardBorder: isDark ? `rgba(193,154,107,0.18)` : `rgba(255,255,255,0.40)`,
    cardShadow: isDark ? `0 8px 22px rgba(0,0,0,0.45)` : `0 8px 22px rgba(90,80,120,0.16)`,
    cardHi: isDark ? `rgba(255,240,215,0.10)` : `rgba(255,255,255,0.60)`,
    accent: isDark ? `rgba(193,154,107,0.85)` : `#320E3B`,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoredMood {
  name: string;
  emoji: string;
  reflection?: string;
  loggedAt: Timestamp;
}
interface StoredAnalysis {
  id: string;
  createdAt: Timestamp;
  identifiedPose?: string;
  score?: number;
}

const HABITS_CONFIG = [
  { id: 'practice', label: 'Practice', color: `rgba(180,110,65,0.85)`, radius: 26 },
  { id: 'hydrate',  label: 'Hydrate',  color: `rgba(100,160,200,0.85)`, radius: 37 },
  { id: 'rest',     label: 'Rest',     color: `rgba(167,139,200,0.85)`, radius: 48 },
  { id: 'sunlight', label: 'Sunlight', color: `rgba(210,180,90,0.85)`, radius: 59 },
  { id: 'active',   label: 'Active',   color: `rgba(140,180,120,0.85)`, radius: 70 },
];

// ─── SVG Math ────────────────────────────────────────────────────────────────
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return { x: centerX + radius * Math.cos(angleInRadians), y: centerY + radius * Math.sin(angleInRadians) };
}
function describeArcSegment(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, outerRadius, endAngle);
  const end = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
          "L", endInner.x, endInner.y, "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y, "Z"].join(" ");
}

function SectionHead({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: isDark ? 'rgba(193,154,107,0.55)' : '#320E3B', marginBottom: 10, fontFamily: FONT_CASUAL, fontWeight: 500 }}>
      {children}
    </p>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <p style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: isDark ? 'rgba(193,154,107,0.6)' : '#320E3B', fontWeight: 600, margin: '0 0 8px' }}>
      {children}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const tokens = getThemeTokens(isDark);
  // Light = amethyst on lavender; dark = the original cream/gold on ink.
  const txt = (a: number) => isDark ? `rgba(255,240,215,${a})` : `rgba(50,14,59,${a})`;
  const acc = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  const { toast } = useToast();
  const router = useRouter();

  const [moodsByDate, setMoodsByDate]       = useState<Record<string, StoredMood>>({});
  const [analysesByDate, setAnalysesByDate] = useState<Record<string, StoredAnalysis[]>>({});
  const [habitsByDate, setHabitsByDate]     = useState<Record<string, string[]>>({});
  const [drawsByDate, setDrawsByDate]       = useState<Record<string, string>>({}); // dateStr -> prizeId

  const [selectedDay, setSelectedDay] = useState(new Date());
  const [journalNote, setJournalNote] = useState('');
  const [dayMood, setDayMood] = useState<StoredMood | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);     // weeks from the current week
  const [expanded, setExpanded] = useState(false);     // day panel open/closed
  const touchStartX = useRef<number | null>(null);

  const [themeGroups, setThemeGroups] = useState<ReflectionThemesOutput | null>(null);
  const [isAnalyzingThemes, setIsAnalyzingThemes] = useState(false);

  // "now"/"selectedDay" are computed from the browser's local clock+timezone; rendering them
  // during SSR can disagree with the client (e.g. server in UTC vs. a non-UTC visitor), which
  // throws a hydration mismatch. Deferring the real render to after mount avoids that entirely.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  const monthName = format(now, 'MMMM');

  const weekStart = addDays(startOfWeek(now, { weekStartsOn: 1 }), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const selectedStr = format(selectedDay, 'yyyy-MM-dd');
  const isToday = isSameDay(selectedDay, now);
  const isFuture = startOfDay(selectedDay).getTime() > startOfDay(now).getTime();
  const moon = getMoonPhase(selectedDay);
  const practices = getSuggestedPractices(moon.index);
  const selectedPrize = drawsByDate[selectedStr] ? getPrizeById(drawsByDate[selectedStr]) : null;

  // Load month summary (habit fan, bingo) + this week's prize draws
  useEffect(() => {
    if (authLoading || !user) return;
    const start = startOfMonth(now);
    const end   = endOfMonth(now);

    const fetchMoods    = getDocs(query(collection(firestore, 'users', user.uid, 'moods'),        where('loggedAt',  '>=', start), where('loggedAt',  '<=', end)));
    const fetchAnalyses = getDocs(query(collection(firestore, 'users', user.uid, 'poseAnalyses'), where('createdAt', '>=', start), where('createdAt', '<=', end)));
    const fetchHabits   = getDocs(query(collection(firestore, 'users', user.uid, 'habits'),       where('date', '>=', format(start,'yyyy-MM-dd')), where('date', '<=', format(end,'yyyy-MM-dd'))));

    Promise.all([fetchMoods, fetchAnalyses, fetchHabits]).then(([mSnap, aSnap, hSnap]) => {
      const moods: Record<string, StoredMood> = {};
      mSnap.forEach(d => { const m = d.data() as StoredMood; if (m.loggedAt) moods[format(m.loggedAt.toDate(), 'yyyy-MM-dd')] = m; });
      setMoodsByDate(moods);

      const analyses: Record<string, StoredAnalysis[]> = {};
      aSnap.forEach(d => { const a = { id: d.id, ...d.data() } as StoredAnalysis; if (a.createdAt) { const k = format(a.createdAt.toDate(), 'yyyy-MM-dd'); analyses[k] = [...(analyses[k] || []), a]; } });
      setAnalysesByDate(analyses);

      const habits: Record<string, string[]> = {};
      hSnap.forEach(d => { const h = d.data() as { date: string; completed: string[] }; habits[h.date] = h.completed || []; });
      setHabitsByDate(habits);
    });
  }, [user, authLoading]);

  // Claimed prize draws for the currently displayed week (re-fetched on week change)
  useEffect(() => {
    if (!user) return;
    Promise.all(weekDays.map(d => getDoc(doc(firestore, 'users', user.uid, 'draws', format(d, 'yyyy-MM-dd'))))).then(snaps => {
      const draws: Record<string, string> = {};
      snaps.forEach((s, i) => { if (s.exists() && s.data().prizeId) draws[format(weekDays[i], 'yyyy-MM-dd')] = s.data().prizeId; });
      setDrawsByDate(prev => ({ ...prev, ...draws }));
    });
  }, [user, weekOffset]);

  // Load the selected day's mood summary + journal note, and claim today's draw
  useEffect(() => {
    if (!user) return;
    const ds = format(selectedDay, 'yyyy-MM-dd');

    getDoc(doc(firestore, 'users', user.uid, 'moods', ds)).then(snap => {
      setDayMood(snap.exists() ? snap.data() as StoredMood : null);
    });
    getDoc(doc(firestore, 'users', user.uid, 'journal', ds)).then(snap => {
      setJournalNote(snap.exists() ? (snap.data().note || '') : '');
    });

    // One draw per day — claimed automatically the first time today is viewed.
    if (isSameDay(selectedDay, now)) {
      const ref = doc(firestore, 'users', user.uid, 'draws', ds);
      getDoc(ref).then(snap => {
        let prizeId: string;
        if (snap.exists() && snap.data().prizeId) {
          prizeId = snap.data().prizeId;
        } else {
          prizeId = pickPrizeForDate(user.uid, ds).id;
          setDoc(ref, { prizeId, claimedAt: serverTimestamp() }, { merge: true });
        }
        setDrawsByDate(prev => ({ ...prev, [ds]: prizeId }));
      });
    }
  }, [selectedDay, user]);

  // Tapping a day expands the panel; tapping the open day again collapses it.
  const handleDayClick = (d: Date) => {
    if (isSameDay(d, selectedDay) && expanded) {
      setExpanded(false);
    } else {
      setSelectedDay(d);
      setExpanded(true);
    }
  };

  // Move one week and keep the selected weekday in view.
  const goWeek = (delta: number) => {
    setWeekOffset(o => o + delta);
    setSelectedDay(d => addDays(d, delta * 7));
  };

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) goWeek(dx < 0 ? 1 : -1); // swipe left → next week
    touchStartX.current = null;
  };

  const saveJournal = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid, 'journal', selectedStr), {
        note: journalNote,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error("Journal save failed", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscoverThemes = async () => {
    const reflections = Object.values(moodsByDate).map(m => m.reflection).filter((r): r is string => !!r && r.trim().length > 0);
    if (reflections.length < 3) {
      toast({ title: "More Reflections Needed", description: "Keep reflecting — themes appear once you've logged a few entries this month." });
      return;
    }
    setIsAnalyzingThemes(true);
    try {
      const result = await analyzeReflectionThemes({ reflections });
      setThemeGroups(result);
    } catch (e) {
      console.error("AI Analysis failed", e);
      toast({ title: "Analysis Failed", description: "Could not analyze themes at this time. Please try again later.", variant: "destructive" });
    } finally {
      setIsAnalyzingThemes(false);
    }
  };

  const bingoStatus = useMemo(() => {
    const allAnalyses = Object.values(analysesByDate).flat();
    const allHabitEntries = Object.values(habitsByDate);
    const countHabit = (id: string) => allHabitEntries.filter(h => h.includes(id)).length;
    const squares = [
      { label: 'Mindful Start', emoji: '🧘', done: allAnalyses.length > 0 },
      { label: 'Hydration Goal', emoji: '💧', done: countHabit('hydrate') >= 5 },
      { label: 'Deep Rest', emoji: '🌙', done: countHabit('rest') >= 7 },
      { label: 'Sun Seeker', emoji: '☀️', done: countHabit('sunlight') >= 3 },
      { label: 'Practice Pro', emoji: '✨', done: countHabit('practice') >= 10, milestone: true },
      { label: 'Perfect Form', emoji: '💯', done: allAnalyses.some(a => a.score === 100) },
      { label: 'Mood Master', emoji: '😌', done: Object.keys(moodsByDate).length >= 5 },
      { label: 'Active Soul', emoji: '🔥', done: countHabit('active') >= 5 },
      { label: 'Monthly Goal', emoji: '🏆', done: allAnalyses.length >= 15, milestone: true },
    ];
    return { squares, completeCount: squares.filter(s => s.done).length };
  }, [analysesByDate, habitsByDate, moodsByDate]);

  const reflectionsCount = Object.values(moodsByDate).filter(m => !!m.reflection).length;

  if (!mounted) return <AppShell><div className="flex items-center justify-center min-h-screen"><MoonPhaseRingLoader /></div></AppShell>;

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');
        @keyframes syWeekSwap { from { opacity: 0.45; transform: translateY(-3px); } to { opacity: 1; transform: none; } }`}</style>
      <div style={{ padding: '16px 14px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <TopBarIcons className="mb-3" />

        {/* HEADER */}
        <header>
          <h1 className="text-3xl font-bold" style={{ color: tokens.title, textShadow: tokens.titleShadow, fontFamily: FONT_PANCAKE, fontWeight: 600 }}>Practice Journal</h1>
          <p className="text-[11px] uppercase tracking-widest mt-1" style={{ color: tokens.muted, fontFamily: FONT_CASUAL }}>Your mindful journey log</p>
          <div style={{ width: 26, height: 1, background: acc(0.22), marginTop: 5 }} />
        </header>

        {/* WEEK ROW + EXPANDING DAY PANEL */}
        <section>
          {/* ‹  week  › — also swipeable left/right to change weeks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => goWeek(-1)}
              aria-label="Previous week"
              style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', border: `0.5px solid ${acc(0.30)}`, background: isDark ? 'rgba(193,154,107,0.08)' : 'rgba(255,255,255,0.10)', color: tokens.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div style={{ flex: 1, overflow: 'hidden' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div key={weekOffset} style={{ display: 'flex', gap: 5, animation: 'syWeekSwap 0.3s ease' }}>
                {weekDays.map((d, i) => {
                  const ds = format(d, 'yyyy-MM-dd');
                  const sel = isSameDay(d, selectedDay);
                  const prize = drawsByDate[ds] ? getPrizeById(drawsByDate[ds]) : null;
                  return (
                    <button
                      key={i}
                      onClick={() => handleDayClick(d)}
                      style={{
                    flex: 1, borderRadius: 13, padding: '6px 0 5px', textAlign: 'center', cursor: 'pointer',
                    background: sel
                      ? (isDark ? 'linear-gradient(180deg, rgba(214,178,130,0.92), rgba(193,154,107,0.78))' : '#320E3B')
                      : (isDark ? 'rgba(193,154,107,0.05)' : 'rgba(255,255,255,0.10)'),
                    border: `0.5px solid ${sel ? acc(0.85) : acc(0.22)}`,
                    boxShadow: sel ? (isDark ? '0 0 18px rgba(214,178,130,0.35)' : '0 4px 14px rgba(50,14,59,0.25)') : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ fontSize: 7.5, letterSpacing: 1, textTransform: 'uppercase', color: sel ? (isDark ? 'rgba(40,30,20,0.7)' : 'rgba(255,248,235,0.75)') : txt(0.55), fontFamily: FONT_CASUAL }}>{format(d, 'EE')}</div>
                  <div style={{ fontFamily: FONT_PANCAKE, fontSize: 15, fontWeight: 600, color: sel ? (isDark ? '#2a1e12' : 'rgba(255,248,235,0.96)') : txt(0.9), marginTop: 1 }}>{format(d, 'd')}</div>
                  {prize ? (
                    <div style={{ width: 16, height: 16, borderRadius: 5, margin: '3px auto 0', overflow: 'hidden', background: 'rgba(255,240,215,0.12)' }}>
                      <img src={prize.img} alt={prize.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div style={{ height: 16, marginTop: 3 }} />
                  )}
                </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => goWeek(1)}
              aria-label="Next week"
              style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', border: `0.5px solid ${acc(0.30)}`, background: isDark ? 'rgba(193,154,107,0.08)' : 'rgba(255,255,255,0.10)', color: tokens.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Collapsed: a thin line beneath the dates; tap a day to unfold */}
          <div style={{ height: 2, borderRadius: 2, margin: '12px 8px 0', background: `linear-gradient(90deg, transparent, ${acc(0.85)}, transparent)` }} />
          {!expanded && (
            <p style={{ textAlign: 'center', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: acc(0.55), margin: '8px 0 0', fontFamily: FONT_CASUAL }}>
              Tap a day to open ↓
            </p>
          )}

          {/* Animated expand wrapper (unfolds from the line above) */}
          <div style={{ maxHeight: expanded ? 2000 : 0, opacity: expanded ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease, opacity 0.3s ease' }}>
            <div style={{ marginTop: 8, borderRadius: 20, border: `0.5px solid ${isDark ? 'rgba(214,178,130,0.4)' : 'rgba(255,255,255,0.40)'}`, background: isDark ? 'rgba(193,154,107,0.10)' : 'rgba(255,255,255,0.12)', padding: 16, backdropFilter: 'blur(14px)', boxShadow: `${tokens.cardShadow}, inset 0 1px 0 ${tokens.cardHi}` }}>
            <p style={{ fontFamily: FONT_PANCAKE, fontSize: 20, fontWeight: 500, color: tokens.title, margin: '0 0 12px' }}>{format(selectedDay, 'EEEE, d MMMM')}</p>

            {/* Moon phase for yogis (always shown) */}
            <PanelLabel>🌙 Moon phase for yogis</PanelLabel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
              {['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'].map((m, i) => (
                <span key={i} style={{ fontSize: i === moon.index ? 25 : 16, opacity: i === moon.index ? 1 : 0.4, textShadow: i === moon.index ? '0 0 12px rgba(214,178,130,0.6)' : 'none' }}>{m}</span>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontFamily: FONT_PANCAKE, fontSize: 16, color: tokens.title, margin: '9px 0 2px' }}>{moon.name}</p>
            <p style={{ textAlign: 'center', fontSize: 10.5, color: acc(0.7), fontStyle: 'italic', margin: 0 }}>{moon.note}</p>

            {isFuture ? (
              <p style={{ textAlign: 'center', fontSize: 10, color: acc(0.6), fontStyle: 'italic', marginTop: 14 }}>
                Practices, draw &amp; check-in unlock on the day.
              </p>
            ) : (
              <>
                {/* Suggested practice */}
                <div style={{ marginTop: 14 }}>
                  <PanelLabel>Suggested practice</PanelLabel>
                  <div style={{ display: 'flex', gap: 7 }}>
                    {practices.map((p, i) => (
                      <div key={i} style={{ flex: 1, borderRadius: 12, border: `0.5px solid ${acc(0.22)}`, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.10)', padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ fontSize: 16 }}>{p.icon}</div>
                        <div style={{ fontSize: 9, color: txt(0.8), marginTop: 4, lineHeight: 1.2 }}>{p.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: acc(0.14), margin: '13px 0' }} />

                {/* How did you feel — read-only summary from the Daily Check-in */}
                <PanelLabel>How did you feel?</PanelLabel>
                {dayMood ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.10)', border: `0.5px solid ${acc(0.16)}`, borderRadius: 12, padding: '10px 12px' }}>
                    <span style={{ fontSize: 24 }}>{dayMood.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: acc(0.95), textTransform: 'uppercase', letterSpacing: 1 }}>{dayMood.name}</div>
                      {dayMood.reflection && (
                        <div style={{ fontSize: 11, color: txt(0.6), fontStyle: 'italic', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dayMood.reflection.replace(/\n/g, ' ')}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 9, color: acc(0.55), fontStyle: 'italic', marginLeft: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>from Daily<br />Check-in</span>
                  </div>
                ) : (
                  <button
                    onClick={() => router.push('/mood-tracker')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: `0.5px dashed ${acc(0.4)}`, borderRadius: 12, padding: 13, color: acc(0.95), fontFamily: FONT_PANCAKE, fontSize: 15, cursor: 'pointer', background: 'transparent' }}
                  >
                    ＋ Check-in now ›
                  </button>
                )}

                {/* Yoga collection · daily draw */}
                {(isToday || selectedPrize) && (
                  <div style={{ marginTop: 14 }}>
                    <PanelLabel>Yoga collection · {isToday ? "today's draw" : 'draw'}</PanelLabel>
                    {selectedPrize ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, border: `0.5px solid ${acc(0.35)}`, background: isDark ? 'linear-gradient(135deg, rgba(193,154,107,0.16), rgba(180,110,65,0.10))' : 'rgba(255,255,255,0.12)', padding: '11px 13px' }}>
                        <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,#f4ecdd,#e3d4ba)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          <img src={selectedPrize.img} alt={selectedPrize.name} style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: FONT_PANCAKE, fontSize: 16, color: txt(0.94), margin: 0 }}>{selectedPrize.name}</p>
                          <p style={{ fontSize: 10, color: acc(0.75), margin: '2px 0 0' }}>{isToday ? 'Added to your collection · next draw tomorrow' : 'In your collection'}</p>
                        </div>
                        <span onClick={() => router.push('/yoga-collection')} style={{ marginLeft: 'auto', fontSize: 11, color: acc(0.95), fontFamily: FONT_PANCAKE, whiteSpace: 'nowrap', cursor: 'pointer' }}>View ›</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, border: `0.5px dashed ${acc(0.4)}`, padding: 14, color: acc(0.9), fontFamily: FONT_PANCAKE, fontSize: 14 }}>
                        <Loader2 className="h-4 w-4 animate-spin" /> Revealing today's prize…
                      </div>
                    )}
                  </div>
                )}

                {/* Journal note */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <PanelLabel>Journal note</PanelLabel>
                    {isSaving && <Loader2 className="h-3 w-3 animate-spin" style={{ color: tokens.accent }} />}
                  </div>
                  <Textarea
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    onBlur={saveJournal}
                    placeholder="Reflections on your presence today..."
                    style={{ borderRadius: 12, border: '0.5px solid rgba(193,154,107,0.18)', background: 'rgba(0,0,0,0.18)', minHeight: 110, fontFamily: FONT_PANCAKE, color: 'rgba(255,240,215,0.85)' }}
                    className="placeholder:text-[rgba(255,240,215,0.3)]"
                  />
                </div>

                <p style={{ marginTop: 12, fontSize: 10, color: acc(0.6), textAlign: 'center', fontStyle: 'italic' }}>↳ Body check-in lives in your Daily Check-in</p>
              </>
            )}
            </div>
          </div>
        </section>

        {/* RADIAL HABIT FAN */}
        <section>
          <SectionHead>Habit Tracker · {monthName}</SectionHead>
          <div style={{ borderRadius: 20, border: `0.5px solid ${tokens.cardBorder}`, background: tokens.cardBg, padding: '24px 16px', backdropFilter: 'blur(14px)', boxShadow: `${tokens.cardShadow}, inset 0 1px 0 ${tokens.cardHi}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="0 0 160 100" width="100%" height="auto" style={{ maxWidth: '300px' }}>
              {HABITS_CONFIG.map((h) => {
                const anglePerDay = 210 / daysInMonth;
                return Array.from({ length: daysInMonth }).map((_, i) => {
                  const dateStr = format(new Date(now.getFullYear(), now.getMonth(), i + 1), 'yyyy-MM-dd');
                  const done = habitsByDate[dateStr]?.includes(h.id);
                  const startAngle = 165 + (i * anglePerDay);
                  const endAngle = 165 + ((i + 1) * anglePerDay);
                  return (
                    <path key={`${h.id}-${i}`} d={describeArcSegment(80, 90, h.radius, h.radius + 8, startAngle, endAngle)}
                      fill={done ? h.color : (isDark ? 'rgba(255,240,215,0.05)' : 'rgba(50,14,59,0.06)')} stroke={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'} strokeWidth="0.5" />
                  );
                });
              })}
            </svg>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px', marginTop: 16, width: '100%' }}>
              {HABITS_CONFIG.map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.color }} />
                  <span style={{ fontSize: 9, color: tokens.text, fontFamily: FONT_CASUAL, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SELF-CARE BINGO */}
        <section>
          <SectionHead>Self-Care Bingo · {monthName}</SectionHead>
          <div style={{ borderRadius: 20, border: `0.5px solid ${tokens.cardBorder}`, background: tokens.cardBg, padding: '16px', backdropFilter: 'blur(14px)', boxShadow: `${tokens.cardShadow}, inset 0 1px 0 ${tokens.cardHi}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {bingoStatus.squares.map((s, i) => (
                <div key={i} style={{ aspectRatio: '1/1', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 4, textAlign: 'center',
                  background: s.done ? (s.milestone ? acc(0.16) : 'rgba(120,155,95,0.18)') : (isDark ? 'rgba(255,240,215,0.03)' : 'rgba(255,255,255,0.08)'),
                  border: `0.5px solid ${s.done ? (s.milestone ? acc(0.3) : 'rgba(120,155,95,0.3)') : (isDark ? 'rgba(255,240,215,0.05)' : 'rgba(50,14,59,0.10)')}`, transition: 'all 0.4s ease' }}>
                  <span style={{ fontSize: 18, opacity: s.done ? 1 : 0.3 }}>{s.emoji}</span>
                  <span style={{ fontSize: 7, fontWeight: 600, textTransform: 'uppercase', color: s.done ? tokens.text : tokens.muted, lineHeight: 1.1 }}>{s.label}</span>
                  {s.done && <CheckCircle2 style={{ width: 10, height: 10, color: s.milestone ? acc(0.8) : 'rgba(120,155,95,0.8)' }} />}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: tokens.muted, fontFamily: FONT_CASUAL }}>Monthly Wellness Progress</span>
                <span style={{ fontSize: 9, color: tokens.accent, fontWeight: 700 }}>{bingoStatus.completeCount} / 9</span>
              </div>
              <div style={{ height: 3, background: isDark ? 'rgba(255,240,215,0.05)' : 'rgba(50,14,59,0.10)', borderRadius: 2 }}>
                <div style={{ height: '100%', background: tokens.accent, borderRadius: 2, width: `${(bingoStatus.completeCount / 9) * 100}%`, transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>
        </section>

        {/* REFLECTION THEMES AI */}
        <section>
          <SectionHead>Reflection Themes · AI Insight</SectionHead>
          <div style={{ borderRadius: 20, border: `0.5px solid ${tokens.cardBorder}`, background: tokens.cardBg, padding: '16px', backdropFilter: 'blur(14px)', boxShadow: `${tokens.cardShadow}, inset 0 1px 0 ${tokens.cardHi}` }}>
            {!themeGroups && !isAnalyzingThemes && (
              <div className="text-center py-4 space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full" style={{ background: acc(0.10), border: `1px solid ${acc(0.25)}` }}>
                    <BrainCircuit className="w-8 h-8" style={{ color: tokens.accent }} />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold" style={{ fontFamily: FONT_PANCAKE, color: tokens.text }}>Monthly Reflection Summary</h4>
                  <p className="text-[11px] mt-1" style={{ color: tokens.muted }}>Our AI analyzes your journaling to find growth patterns and emotional recurring themes.</p>
                </div>
                {reflectionsCount >= 3 ? (
                  <Button onClick={handleDiscoverThemes} className="w-full h-10 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase" style={{ background: acc(0.12), border: `1px solid ${acc(0.40)}`, color: isDark ? 'rgba(193,154,107,0.92)' : '#320E3B' }}>
                    Discover My Themes
                  </Button>
                ) : (
                  <p className="text-[10px] italic" style={{ color: acc(0.55) }}>Keep reflecting — themes appear once you've logged a few entries this month ({reflectionsCount}/3).</p>
                )}
              </div>
            )}
            {isAnalyzingThemes && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 animate-pulse">
                <Sparkles className="w-8 h-8" style={{ color: tokens.accent, opacity: 0.6 }} />
                <p className="text-[11px] uppercase tracking-widest" style={{ color: tokens.muted }}>AI Analyzing your presence...</p>
              </div>
            )}
            {themeGroups && (
              <div className="space-y-6 animate-in fade-in duration-700">
                {themeGroups.themes.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: group.color }} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: group.color }}>{group.theme}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.keywords.map((kw, kIdx) => (
                        <div key={kIdx} style={{ background: group.color.replace('0.85', '0.14'), border: `0.5px solid ${group.color.replace('0.85', '0.35')}`, color: group.color.replace('0.85', '0.95'), padding: '4px 10px', borderRadius: 12, fontSize: 9, fontWeight: 600, fontFamily: FONT_CASUAL }}>
                          {kw.word} · {kw.count}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => setThemeGroups(null)} className="text-[9px] uppercase tracking-widest transition-colors w-full text-center pt-2" style={{ color: tokens.muted }}>Reset Analysis</button>
              </div>
            )}
          </div>
        </section>

      </div>
    </AppShell>
  );
}
