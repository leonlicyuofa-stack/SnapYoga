
"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Smile, Wind, Frown, Meh, Activity, Flame, Droplets, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── Brand tokens (matching dashboard) ───────────────────────────────────────
const GOLD      = 'rgba(193,154,107';
const PARCHMENT = 'rgba(255,240,215';
const TERRACOTTA= 'rgba(180,110,65';
const SAGE      = 'rgba(120,140,100';
const DEEP_BARK = 'rgba(25,16,8';

const FONT_PANCAKE = "Didot, 'Bodoni MT', 'Century Schoolbook', 'Palatino Linotype', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

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
  { id: 'hydrate',  label: 'Hydrate',  icon: Droplets, color: 'rgba(100,160,200,0.85)' },
  { id: 'rest',     label: 'Rest',     icon: Moon,     color: `${GOLD},0.85)` },
  { id: 'sunlight', label: 'Sunlight', icon: Sun,      color: 'rgba(220,180,80,0.85)' },
  { id: 'active',   label: 'Active',   icon: Flame,    color: `${SAGE},0.85)` },
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
    <p className="text-[10px] uppercase tracking-[0.25em] font-bold mb-4"
       style={{ color: `${GOLD},0.60)`, fontFamily: FONT_CASUAL }}>
      {children}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });

  const [moodsByDate, setMoodsByDate]       = useState<Record<string, StoredMood>>({});
  const [analysesByDate, setAnalysesByDate] = useState<Record<string, StoredAnalysis[]>>({});
  const [habitsByDate, setHabitsByDate]     = useState<Record<string, string[]>>({});
  const [selectedDay, setSelectedDay]       = useState<Date | null>(null);
  const [isLogging, setIsLogging]           = useState(false);

  const touchStartX = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) setWeekStart(w => addWeeks(w, 1));
      else         setWeekStart(w => subWeeks(w, 1));
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
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

  const logMood = async (moodName: string, moodEmoji: string) => {
    if (!user || isLogging || !selectedDay) return;
    setIsLogging(true);
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    try {
      await setDoc(doc(firestore, 'users', user.uid, 'moods', dateStr), {
        name: moodName, emoji: moodEmoji, loggedAt: serverTimestamp(),
      }, { merge: true });
      setMoodsByDate(prev => ({
        ...prev,
        [dateStr]: { name: moodName, emoji: moodEmoji, loggedAt: {} as Timestamp },
      }));
      // Removed the 'Mood saved' toast here as requested.
    } catch { toast({ title: 'Error', description: 'Could not save mood.', variant: 'destructive' }); }
    finally { setIsLogging(false); }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user || !selectedDay) return;
    const dateStr  = format(selectedDay, 'yyyy-MM-dd');
    const current  = habitsByDate[dateStr] || [];
    const updated  = current.includes(habitId) ? current.filter(h => h !== habitId) : [...current, habitId];
    setHabitsByDate(prev => ({ ...prev, [dateStr]: updated }));
    try {
      await setDoc(doc(firestore, 'users', user.uid, 'habits', dateStr), {
        date: dateStr, completed: updated, updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch { /* silent fail — optimistic update already applied */ }
  };

  const selectedDateStr  = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedMood     = selectedDateStr ? moodsByDate[selectedDateStr] : null;
  const selectedAnalyses = selectedDateStr ? (analysesByDate[selectedDateStr] || []) : [];
  const selectedHabits   = selectedDateStr ? (habitsByDate[selectedDateStr] || []) : [];

  const weekStats = {
    practiceDays: weekDays.filter(d => (analysesByDate[format(d,'yyyy-MM-dd')] || []).length > 0).length,
    moodDays:     weekDays.filter(d =>  moodsByDate[format(d,'yyyy-MM-dd')]).length,
    habitDots:    weekDays.reduce((sum, d) => sum + (habitsByDate[format(d,'yyyy-MM-dd')] || []).length, 0),
  };

  const weekLabel = `${format(weekStart, 'dd/MM/yyyy')} – ${format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'dd/MM/yyyy')}`;

  return (
    <AppShell>
      <div
        className="flex flex-col min-h-screen p-4 gap-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header>
          <h1 className="text-3xl font-bold" style={{ color: `${PARCHMENT},0.92)`, fontFamily: FONT_PANCAKE }}>
            Practice Journal
          </h1>
          <p className="text-[11px] uppercase tracking-widest mt-1" style={{ color: `${GOLD},0.50)`, fontFamily: FONT_CASUAL }}>
            Your mindful journey log
          </p>
        </header>

        {/* ── WEEK NAVIGATOR ──────────────────────────────────────────── */}
        <GlassCard className="p-4" style={{ borderRadius: '24px' }}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setWeekStart(w => subWeeks(w, 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: `${GOLD},0.12)`, border: `0.5px solid ${GOLD},0.25)` }}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: `${GOLD},0.80)` }} />
            </button>

            <p className="text-[13px] font-medium" style={{ color: `${GOLD},0.90)`, fontFamily: FONT_PANCAKE }}>
              {weekLabel}
            </p>

            <button
              onClick={() => setWeekStart(w => addWeeks(w, 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: `${GOLD},0.12)`, border: `0.5px solid ${GOLD},0.25)` }}
            >
              <ChevronRight className="h-4 w-4" style={{ color: `${GOLD},0.80)` }} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const dateStr  = format(day, 'yyyy-MM-dd');
              const isActive = selectedDay && isSameDay(day, selectedDay);
              const today    = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center gap-1.5 py-3 transition-all"
                  style={{
                    borderRadius: '16px',
                    background: isActive ? `${GOLD},0.18)` : 'transparent',
                    border: isActive ? `1px solid ${GOLD},0.40)` : '1px solid transparent',
                  }}
                >
                  <span
                    className="text-[9px] uppercase font-bold"
                    style={{ color: today ? `${GOLD},0.90)` : `${PARCHMENT},0.35)`, fontFamily: FONT_CASUAL }}
                  >
                    {format(day, 'EEE')[0]}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center relative"
                    style={{
                      background: `${PARCHMENT},0.05)`,
                      border: `1px solid ${isActive ? GOLD : PARCHMENT},0.10)`,
                    }}
                  >
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: `${PARCHMENT},0.85)` }}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* ── WEEK SUMMARY STATS ──────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="p-3 text-center" style={{ borderRadius: '16px' }}>
            <p className="text-2xl font-bold" style={{ color: `${TERRACOTTA},0.90)`, fontFamily: FONT_PANCAKE }}>{weekStats.practiceDays}</p>
            <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: `${GOLD},0.50)`, fontFamily: FONT_CASUAL }}>sessions</p>
          </GlassCard>
          <GlassCard className="p-3 text-center" style={{ borderRadius: '16px' }}>
            <p className="text-2xl font-bold" style={{ color: `${GOLD},0.90)`, fontFamily: FONT_PANCAKE }}>{weekStats.moodDays}</p>
            <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: `${GOLD},0.50)`, fontFamily: FONT_CASUAL }}>moods</p>
          </GlassCard>
          <GlassCard className="p-3 text-center" style={{ borderRadius: '16px' }}>
            <p className="text-2xl font-bold" style={{ color: `${SAGE},0.90)`, fontFamily: FONT_PANCAKE }}>{weekStats.habitDots}</p>
            <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: `${GOLD},0.50)`, fontFamily: FONT_CASUAL }}>habits</p>
          </GlassCard>
        </div>

        {/* ── SELECTED DAY DETAIL (EXPANSION) ─────────────────────────── */}
        {selectedDay && (
          <GlassCard
            className="p-6 animate-in slide-in-from-top-4 duration-300"
            style={{
              background: `${DEEP_BARK},0.45)`,
              border: `0.5px solid ${GOLD},0.18)`,
              borderRadius: '24px',
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: `${GOLD},0.85)`, fontFamily: FONT_PANCAKE }}>
              {isToday(selectedDay) ? 'Today — ' : ''}{format(selectedDay, 'dd/MM/yyyy')}
            </h2>

            <div className="space-y-8">
              {/* Mood */}
              <div>
                <SectionLabel>HOW DID YOU FEEL?</SectionLabel>
                <div className="flex justify-between">
                  {MOODS.map(m => {
                    const active = selectedMood?.name === m.name;
                    return (
                      <button
                        key={m.name}
                        onClick={() => logMood(m.name, m.emoji)}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{
                            background: active ? m.fill : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${active ? m.ring : 'rgba(255,255,255,0.08)'}`,
                            boxShadow: active ? `0 0 15px ${m.fill}` : 'none',
                          }}
                        >
                          <span className={cn("text-xl grayscale transition-all", active && "grayscale-0 scale-110")}>{m.emoji}</span>
                        </div>
                        <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: active ? m.text : `${PARCHMENT},0.30)`, fontFamily: FONT_CASUAL }}>
                          {m.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Habits */}
              <div>
                <SectionLabel>HABITS</SectionLabel>
                <div className="flex justify-between">
                  {HABITS.map(h => {
                    const done = selectedHabits.includes(h.id);
                    return (
                      <button
                        key={h.id}
                        onClick={() => toggleHabit(h.id)}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{
                            background: done ? h.color : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${done ? h.color : 'rgba(255,255,255,0.08)'}`,
                          }}
                        >
                          <h.icon className={cn("h-5 w-5", done ? "text-white" : "text-white/20")} />
                        </div>
                        <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: done ? 'white' : `${PARCHMENT},0.30)`, fontFamily: FONT_CASUAL }}>
                          {h.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sessions */}
              <div>
                <SectionLabel>PRACTICE SESSIONS</SectionLabel>
                {selectedAnalyses.length === 0 ? (
                  <p className="text-sm italic opacity-30" style={{ fontFamily: FONT_PANCAKE }}>No sessions recorded</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAnalyses.map(a => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.05)' }}
                      >
                        <div>
                          <p className="text-sm font-bold" style={{ color: `${PARCHMENT},0.90)`, fontFamily: FONT_PANCAKE }}>{a.identifiedPose || 'Yoga Practice'}</p>
                          <p className="text-[10px] opacity-40 uppercase" style={{ fontFamily: FONT_CASUAL }}>{format(a.createdAt.toDate(), 'h:mm a')}</p>
                        </div>
                        {a.score && (
                          <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-xs font-bold text-gold" style={{ borderColor: `${GOLD},0.30)`, color: `${GOLD},0.90)` }}>
                            {a.score}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* ── WEEK AT A GLANCE ────────────────────────────────────────── */}
        <GlassCard className="p-5" style={{ borderRadius: '24px' }}>
          <SectionLabel>WEEK AT A GLANCE</SectionLabel>
          <div className="space-y-3">
            {[...HABITS, { id: 'mood', label: 'Mood', icon: Smile, color: `${GOLD},0.85)` }].map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-24 flex items-center gap-2">
                   <item.icon className="h-3 w-3" style={{ color: (item as any).color || `${GOLD},0.60)` }} />
                   <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: `${PARCHMENT},0.30)`, fontFamily: FONT_CASUAL }}>{item.label}</span>
                </div>
                <div className="flex-1 grid grid-cols-7 gap-1">
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    if (item.id === 'mood') {
                      const m = moodsByDate[dateStr];
                      return (
                        <div key={dateStr} className="aspect-[2/1] rounded-sm flex items-center justify-center text-[10px]" style={{ background: m ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)' }}>
                          {m ? m.emoji : ''}
                        </div>
                      );
                    } else {
                      const done = (habitsByDate[dateStr] || []).includes(item.id);
                      const hasYoga = item.id === 'practice' && (analysesByDate[dateStr] || []).length > 0;
                      const active = done || hasYoga;
                      return (
                        <div key={dateStr} className="aspect-[2/1] rounded-sm transition-colors duration-500" 
                          style={{ background: active ? (item as any).color : 'rgba(255,255,255,0.03)' }} />
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </AppShell>
  );
}
