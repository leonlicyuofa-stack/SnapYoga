"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Smile, Wind, Frown, Meh, Activity, Flame, Droplets, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── Brand tokens (matching dashboard) ───────────────────────────────────────
const GOLD      = 'rgba(193,154,107';
const PARCHMENT = 'rgba(255,240,215';
const TERRACOTTA= 'rgba(180,110,65';
const SAGE      = 'rgba(120,140,100';
const DEEP_BARK = 'rgba(25,16,8';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoredMood {
  name: string;
  emoji: string;
  loggedAt: Timestamp;
}
interface StoredAnalysis {
  id: string;
  createdAt: Timestamp;
  identifiedPose?: string;
  score?: number;
}

// ─── Mood config (matches dashboard) ─────────────────────────────────────────
const MOODS = [
  { name: 'Joyful',    icon: Smile,  emoji: '😊', ring: `${SAGE},0.50)`,       fill: `${SAGE},0.22)`,       text: 'rgba(160,195,130,1)' },
  { name: 'Calm',      icon: Wind,   emoji: '😌', ring: 'rgba(130,165,195,0.5)', fill: 'rgba(100,130,160,0.22)', text: 'rgba(140,185,215,1)' },
  { name: 'Emotional', icon: Frown,  emoji: '😢', ring: `${GOLD},0.50)`,        fill: `${TERRACOTTA},0.22)`,   text: `${GOLD},1)` },
  { name: 'Fatigue',   icon: Meh,    emoji: '😫', ring: 'rgba(139,100,75,0.5)',  fill: 'rgba(139,100,75,0.20)', text: 'rgba(200,160,120,1)' },
];

// ─── Habit config ─────────────────────────────────────────────────────────────
const HABITS = [
  { id: 'practice', label: 'Practice', icon: Activity, color: `${TERRACOTTA},0.85)` },
  { id: 'hydration', label: 'Hydrate',  icon: Droplets, color: 'rgba(100,160,200,0.85)' },
  { id: 'rest',      label: 'Rest',     icon: Moon,     color: `${GOLD},0.85)` },
  { id: 'sunlight',  label: 'Sunlight', icon: Sun,      color: 'rgba(220,180,80,0.85)' },
  { id: 'streak',    label: 'Active',   icon: Flame,    color: `${SAGE},0.85)` },
];

// ─── Glass card (same pattern as dashboard) ───────────────────────────────────
function GlassCard({ children, className, style }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn('transition-all duration-200', className)}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] uppercase tracking-widest font-serif italic mb-1.5"
       style={{ color: `${PARCHMENT},0.38)` }}>
      {children}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Week navigation
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });

  // Data
  const [moodsByDate, setMoodsByDate]       = useState<Record<string, StoredMood>>({});
  const [analysesByDate, setAnalysesByDate] = useState<Record<string, StoredAnalysis[]>>({});
  const [habitsByDate, setHabitsByDate]     = useState<Record<string, string[]>>({});
  const [selectedDay, setSelectedDay]       = useState<Date>(new Date());
  const [isLogging, setIsLogging]           = useState(false);

  // Swipe detection
  const touchStartX = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) setWeekStart(w => addWeeks(w, 1));
      else         setWeekStart(w => subWeeks(w, 1));
    }
  };

  // Fetch data whenever week changes
  useEffect(() => {
    if (authLoading || !user) return;
    // Fetch slightly beyond the week to ensure coverage
    const start = subWeeks(weekStart, 0);
    const end   = endOfWeek(weekStart, { weekStartsOn: 1 });

    const fetchMoods    = getDocs(query(collection(firestore, 'users', user.uid, 'moods'),        where('loggedAt',  '>=', start), where('loggedAt',  '<=', end)));
    const fetchAnalyses = getDocs(query(collection(firestore, 'users', user.uid, 'poseAnalyses'), where('createdAt', '>=', start), where('createdAt', '<=', end)));
    const fetchHabits   = getDocs(query(collection(firestore, 'users', user.uid, 'habits'),       where('date', '>=', format(start,'yyyy-MM-dd')), where('date', '<=', format(end,'yyyy-MM-dd'))));

    Promise.all([fetchMoods, fetchAnalyses, fetchHabits]).then(([mSnap, aSnap, hSnap]) => {
      const moods: Record<string, StoredMood> = {};
      mSnap.forEach(d => {
        const m = d.data() as StoredMood;
        if (m.loggedAt) moods[format(m.loggedAt.toDate(), 'yyyy-MM-dd')] = m;
      });
      setMoodsByDate(moods);

      const analyses: Record<string, StoredAnalysis[]> = {};
      aSnap.forEach(d => {
        const a = { id: d.id, ...d.data() } as StoredAnalysis;
        if (a.createdAt) {
          const k = format(a.createdAt.toDate(), 'yyyy-MM-dd');
          analyses[k] = [...(analyses[k] || []), a];
        }
      });
      setAnalysesByDate(analyses);

      const habits: Record<string, string[]> = {};
      hSnap.forEach(d => {
        const h = d.data() as { date: string; completed: string[] };
        habits[h.date] = h.completed || [];
      });
      setHabitsByDate(habits);
    });
  }, [user, authLoading, weekStart]);

  // Log mood for selected day
  const logMood = async (moodName: string, moodEmoji: string) => {
    if (!user || isLogging) return;
    setIsLogging(true);
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    try {
      await setDoc(doc(firestore, 'users', user.uid, 'moods', dateStr), {
        name: moodName, emoji: moodEmoji, loggedAt: serverTimestamp(),
      });
      setMoodsByDate(prev => ({
        ...prev,
        [dateStr]: { name: moodName, emoji: moodEmoji, loggedAt: {} as Timestamp },
      }));
      toast({ title: 'Mood saved', description: `${moodEmoji} ${moodName}` });
    } catch { toast({ title: 'Error', description: 'Could not save mood.', variant: 'destructive' }); }
    finally { setIsLogging(false); }
  };

  // Toggle habit for selected day
  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const dateStr  = format(selectedDay, 'yyyy-MM-dd');
    const current  = habitsByDate[dateStr] || [];
    const updated  = current.includes(habitId) ? current.filter(h => h !== habitId) : [...current, habitId];
    setHabitsByDate(prev => ({ ...prev, [dateStr]: updated }));
    try {
      await setDoc(doc(firestore, 'users', user.uid, 'habits', dateStr), {
        date: dateStr, completed: updated,
      });
    } catch { /* silent fail — optimistic update already applied */ }
  };

  // Derived data for selected day
  const selectedDateStr  = format(selectedDay, 'yyyy-MM-dd');
  const selectedMood     = moodsByDate[selectedDateStr];
  const selectedAnalyses = analysesByDate[selectedDateStr] || [];
  const selectedHabits   = habitsByDate[selectedDateStr]   || [];

  // Week summary stats
  const weekStats = {
    practiceDays: weekDays.filter(d => (analysesByDate[format(d,'yyyy-MM-dd')] || []).length > 0).length,
    moodDays:     weekDays.filter(d =>  moodsByDate[format(d,'yyyy-MM-dd')]).length,
    habitDots:    weekDays.reduce((sum, d) => sum + (habitsByDate[format(d,'yyyy-MM-dd')] || []).length, 0),
  };

  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}`;
  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <AppShell>
      <div
        className="flex flex-col min-h-screen font-serif"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-serif font-semibold" style={{ color: `${PARCHMENT},0.92)` }}>
            Practice Calendar
          </h1>
          <p className="text-[10px] font-serif italic" style={{ color: `${PARCHMENT},0.35)` }}>
            Swipe to navigate weeks
          </p>
        </header>

        <main className="flex-1 px-3 pb-24 space-y-2">

          {/* ── WEEK NAVIGATOR ──────────────────────────────────────────── */}
          <GlassCard className="px-3 py-2.5" style={{ borderRadius: '24px' }}>
            {/* Week label + arrows */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setWeekStart(w => subWeeks(w, 1))}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ background: `${GOLD},0.12)`, border: `0.5px solid ${GOLD},0.25)` }}
              >
                <ChevronLeft className="h-3.5 w-3.5" style={{ color: `${GOLD},0.80)` }} />
              </button>

              <div className="text-center">
                <p className="text-[10px] font-serif italic" style={{ color: `${GOLD},0.70)` }}>
                  {weekLabel}
                </p>
                {isCurrentWeek && (
                  <span className="text-[8px] uppercase tracking-widest" style={{ color: `${SAGE},0.80)` }}>
                    this week
                  </span>
                )}
              </div>

              <button
                onClick={() => setWeekStart(w => addWeeks(w, 1))}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ background: `${GOLD},0.12)`, border: `0.5px solid ${GOLD},0.25)` }}
              >
                <ChevronRight className="h-3.5 w-3.5" style={{ color: `${GOLD},0.80)` }} />
              </button>
            </div>

            {/* Day strip */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => {
                const dateStr  = format(day, 'yyyy-MM-dd');
                const mood     = moodsByDate[dateStr];
                const hasYoga  = (analysesByDate[dateStr] || []).length > 0;
                const habits   = habitsByDate[dateStr] || [];
                const isActive = isSameDay(day, selectedDay);
                const today    = isToday(day);

                const moodCfg = mood ? MOODS.find(m => m.name === mood.name) : null;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(day)}
                    className="flex flex-col items-center gap-0.5 py-1.5 transition-all"
                    style={{
                      borderRadius: '14px',
                      background: isActive ? `${GOLD},0.18)` : 'transparent',
                      border: isActive ? `1px solid ${GOLD},0.40)` : '1px solid transparent',
                    }}
                  >
                    {/* Day name */}
                    <span
                      className="text-[8px] uppercase tracking-wider"
                      style={{ color: today ? `${GOLD},0.90)` : `${PARCHMENT},0.35)` }}
                    >
                      {format(day, 'EEE')[0]}
                    </span>

                    {/* Day number with mood fill */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center relative"
                      style={{
                        background: moodCfg ? moodCfg.fill : `${PARCHMENT},0.05)`,
                        border: `1px solid ${moodCfg ? moodCfg.ring : `${PARCHMENT},0.10)`}`,
                      }}
                    >
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: moodCfg ? moodCfg.text : `${PARCHMENT},0.70)` }}
                      >
                        {format(day, 'd')}
                      </span>
                      {/* Yoga dot */}
                      {hasYoga && (
                        <div
                          className="absolute -bottom-0.5 right-0 w-1.5 h-1.5 rounded-full"
                          style={{ background: `${TERRACOTTA},0.90)` }}
                        />
                      )}
                    </div>

                    {/* Habit dots row (max 3) */}
                    <div className="flex gap-0.5 h-1.5">
                      {habits.slice(0, 3).map(h => {
                        const cfg = HABITS.find(hb => hb.id === h);
                        return (
                          <div key={h} className="w-1 h-1 rounded-full"
                            style={{ background: cfg ? cfg.color : `${GOLD},0.60)` }} />
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* ── WEEK SUMMARY STRIP ──────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2">
            <GlassCard className="px-3 py-2 text-center" style={{ borderRadius: '16px 16px 28px 16px' }}>
              <p className="text-lg font-semibold font-serif" style={{ color: `${TERRACOTTA},0.90)` }}>
                {weekStats.practiceDays}
              </p>
              <p className="text-[8px] uppercase tracking-wider" style={{ color: `${PARCHMENT},0.35)` }}>
                sessions
              </p>
            </GlassCard>
            <GlassCard className="px-3 py-2 text-center" style={{ borderRadius: '16px' }}>
              <p className="text-lg font-semibold font-serif" style={{ color: `${GOLD},0.90)` }}>
                {weekStats.moodDays}
              </p>
              <p className="text-[8px] uppercase tracking-wider" style={{ color: `${PARCHMENT},0.35)` }}>
                moods logged
              </p>
            </GlassCard>
            <GlassCard className="px-3 py-2 text-center" style={{ borderRadius: '16px 16px 16px 28px' }}>
              <p className="text-lg font-semibold font-serif" style={{ color: `${SAGE},0.90)` }}>
                {weekStats.habitDots}
              </p>
              <p className="text-[8px] uppercase tracking-wider" style={{ color: `${PARCHMENT},0.35)` }}>
                habits done
              </p>
            </GlassCard>
          </div>

          {/* ── SELECTED DAY DETAIL ─────────────────────────────────────── */}
          <GlassCard
            className="px-4 py-3"
            style={{
              background: `${DEEP_BARK},0.45)`,
              border: `0.5px solid ${GOLD},0.18)`,
              borderRadius: '28px 16px 28px 28px',
            }}
          >
            <p className="text-xs font-serif font-semibold mb-3" style={{ color: `${GOLD},0.80)` }}>
              {isToday(selectedDay) ? 'Today — ' : ''}{format(selectedDay, 'EEEE, MMMM d')}
            </p>

            {/* Mood selector */}
            <SectionLabel>How did you feel?</SectionLabel>
            <div className="flex justify-between mb-3">
              {MOODS.map(mood => {
                const isActive = selectedMood?.name === mood.name;
                return (
                  <button
                    key={mood.name}
                    onClick={() => logMood(mood.name, mood.emoji)}
                    disabled={isLogging}
                    className="flex flex-col items-center gap-1 transition-all"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        background: isActive ? mood.fill : `${PARCHMENT},0.04)`,
                        border: `1px solid ${isActive ? mood.ring : `${PARCHMENT},0.10)`}`,
                        boxShadow: isActive ? `0 0 10px ${mood.fill}` : 'none',
                        transform: isActive ? 'scale(1.12)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <mood.icon className="h-4 w-4" style={{ color: isActive ? mood.text : `${PARCHMENT},0.40)` }} />
                    </div>
                    <span className="text-[7px] uppercase tracking-wider font-serif"
                          style={{ color: isActive ? mood.text : `${PARCHMENT},0.25)` }}>
                      {mood.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Habit tracker */}
            <SectionLabel>Habits</SectionLabel>
            <div className="flex gap-2 mb-3">
              {HABITS.map(habit => {
                const done = selectedHabits.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className="flex flex-col items-center gap-1 flex-1 transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-2xl flex items-center justify-center transition-all"
                      style={{
                        background: done ? habit.color : `${PARCHMENT},0.05)`,
                        border: `1px solid ${done ? habit.color : `${PARCHMENT},0.10)`}`,
                        transform: done ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      <habit.icon className="h-3.5 w-3.5"
                        style={{ color: done ? `${DEEP_BARK},0.90)` : `${PARCHMENT},0.35)` }} />
                    </div>
                    <span className="text-[7px] uppercase tracking-wider font-serif"
                          style={{ color: done ? `${PARCHMENT},0.65)` : `${PARCHMENT},0.22)` }}>
                      {habit.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Yoga analyses for this day */}
            <SectionLabel>Practice sessions</SectionLabel>
            {selectedAnalyses.length === 0 ? (
              <p className="text-[10px] font-serif italic py-1" style={{ color: `${PARCHMENT},0.22)` }}>
                No sessions recorded
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedAnalyses.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between px-3 py-2 rounded-2xl"
                    style={{ background: `${TERRACOTTA},0.14)`, border: `0.5px solid ${TERRACOTTA},0.28)` }}
                  >
                    <div>
                      <p className="text-[11px] font-semibold font-serif"
                         style={{ color: `${PARCHMENT},0.82)` }}>
                        {a.identifiedPose || 'Pose analysis'}
                      </p>
                      <p className="text-[9px] font-serif italic"
                         style={{ color: `${PARCHMENT},0.35)` }}>
                        {format(a.createdAt.toDate(), 'h:mm a')}
                      </p>
                    </div>
                    {a.score !== undefined && (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold font-serif"
                          style={{
                            background: `${GOLD},0.18)`,
                            border: `1px solid ${GOLD},0.40)`,
                            color: `${GOLD},0.90)`,
                          }}
                        >
                          {a.score}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* ── FULL WEEK HABIT HEATMAP ─────────────────────────────────── */}
          <GlassCard className="px-4 py-3" style={{ borderRadius: '16px 28px 28px 16px' }}>
            <SectionLabel>Week at a glance</SectionLabel>
            <div className="space-y-1.5">
              {HABITS.map(habit => (
                <div key={habit.id} className="flex items-center gap-2">
                  <habit.icon className="h-3 w-3 flex-shrink-0" style={{ color: habit.color }} />
                  <span className="text-[8px] uppercase tracking-wider w-12 flex-shrink-0 font-serif"
                        style={{ color: `${PARCHMENT},0.35)` }}>
                    {habit.label}
                  </span>
                  <div className="flex gap-1 flex-1">
                    {weekDays.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const done    = (habitsByDate[dateStr] || []).includes(habit.id);
                      const hasMood = !!moodsByDate[dateStr];
                      return (
                        <div
                          key={dateStr}
                          className="flex-1 h-4 rounded"
                          style={{
                            background: done ? habit.color : `${PARCHMENT},0.06)`,
                            border: `0.5px solid ${done ? habit.color : `${PARCHMENT},0.08)`}`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* Mood row */}
              <div className="flex items-center gap-2 mt-1">
                <Smile className="h-3 w-3 flex-shrink-0" style={{ color: `${GOLD},0.70)` }} />
                <span className="text-[8px] uppercase tracking-wider w-12 flex-shrink-0 font-serif"
                      style={{ color: `${PARCHMENT},0.35)` }}>
                  Mood
                </span>
                <div className="flex gap-1 flex-1">
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const mood    = moodsByDate[dateStr];
                    const cfg     = mood ? MOODS.find(m => m.name === mood.name) : null;
                    return (
                      <div
                        key={dateStr}
                        className="flex-1 h-4 rounded flex items-center justify-center text-[8px]"
                        style={{
                          background: cfg ? cfg.fill : `${PARCHMENT},0.06)`,
                          border: `0.5px solid ${cfg ? cfg.ring : `${PARCHMENT},0.08)`}`,
                        }}
                      >
                        {cfg ? mood?.emoji : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassCard>

        </main>
      </div>
    </AppShell>
  );
}
