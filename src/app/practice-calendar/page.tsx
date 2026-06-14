
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, type Timestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, getDaysInMonth, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Smile, Wind, Frown, Meh, Activity, Flame, Droplets, Moon, Sun, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── Brand tokens ────────────────────────────────────────────────────────────
const GOLD      = 'rgba(193,154,107';
const PARCHMENT = 'rgba(255,240,215';
const TERRACOTTA= 'rgba(180,110,65';
const SAGE      = 'rgba(120,140,100';

const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function getThemeTokens(isDark: boolean) {
  return {
    text: isDark ? 'rgba(255,240,215,0.92)' : 'rgba(25,16,8,0.95)',
    muted: isDark ? 'rgba(255,240,215,0.40)' : 'rgba(25,16,8,0.55)',
    cardBg: isDark ? `rgba(13,20,30,0.50)` : `rgba(255,255,255,0.65)`,
    cardBorder: `rgba(193,154,107,0.18)`,
    accent: `rgba(193,154,107,0.85)`,
  };
}

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

// ─── Habit config ─────────────────────────────────────────────────────────────
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
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArcSegment(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, outerRadius, endAngle);
  const end = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ 
      fontSize: 9, 
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const tokens = getThemeTokens(isDark);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [moodsByDate, setMoodsByDate]       = useState<Record<string, StoredMood>>({});
  const [analysesByDate, setAnalysesByDate] = useState<Record<string, StoredAnalysis[]>>({});
  const [habitsByDate, setHabitsByDate]     = useState<Record<string, string[]>>({});

  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  const monthName = format(now, 'MMMM');

  useEffect(() => {
    if (authLoading || !user) return;
    const start = startOfMonth(now);
    const end   = endOfMonth(now);

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
  }, [user, authLoading]);

  // Bingo Rules Logic
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
    
    return {
      squares,
      completeCount: squares.filter(s => s.done).length
    };
  }, [analysesByDate, habitsByDate, moodsByDate]);

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

        {/* BASE SUMMARY LAYER — always visible */}
        <div style={{ position: 'absolute', inset: 0, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', paddingBottom: 120 }}>
          <header className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: tokens.text, fontFamily: FONT_PANCAKE, fontWeight: 600 }}>
                Practice Journal
              </h1>
              <p className="text-[11px] uppercase tracking-widest mt-1" style={{ color: tokens.muted, fontFamily: FONT_CASUAL }}>
                Your mindful journey log
              </p>
              <div style={{ width: 26, height: 1, background: 'rgba(193,154,107,0.22)', marginTop: 5 }} />
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1.5px solid rgba(193,154,107,0.30)',
                background: 'rgba(193,154,107,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {isDark
                ? <Sun style={{ width: 14, height: 14, color: 'rgba(193,154,107,0.75)' }} />
                : <Moon style={{ width: 14, height: 14, color: 'rgba(193,154,107,0.75)' }} />
              }
            </button>
          </header>

          {/* RADIAL HABIT FAN */}
          <section>
            <SectionHead>Habit Tracker · {monthName}</SectionHead>
            <div style={{ 
              borderRadius: '20px 10px 20px 20px', 
              border: `0.5px solid ${tokens.cardBorder}`, 
              background: tokens.cardBg, 
              padding: '24px 16px',
              backdropFilter: 'blur(14px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <svg viewBox="0 0 160 100" width="100%" height="auto" style={{ maxWidth: '300px' }}>
                {HABITS_CONFIG.map((h) => {
                  const anglePerDay = 210 / daysInMonth;
                  return Array.from({ length: daysInMonth }).map((_, i) => {
                    const dateStr = format(new Date(now.getFullYear(), now.getMonth(), i + 1), 'yyyy-MM-dd');
                    const done = habitsByDate[dateStr]?.includes(h.id);
                    const startAngle = 165 + (i * anglePerDay);
                    const endAngle = 165 + ((i + 1) * anglePerDay);
                    
                    return (
                      <path
                        key={`${h.id}-${i}`}
                        d={describeArcSegment(80, 90, h.radius, h.radius + 8, startAngle, endAngle)}
                        fill={done ? h.color : 'rgba(255,240,215,0.05)'}
                        stroke={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="0.5"
                      />
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
            <div style={{ 
              borderRadius: '10px 20px 20px 20px', 
              border: `0.5px solid ${tokens.cardBorder}`, 
              background: tokens.cardBg, 
              padding: '16px',
              backdropFilter: 'blur(14px)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {bingoStatus.squares.map((s, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      aspectRatio: '1/1',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      padding: 4,
                      textAlign: 'center',
                      background: s.done 
                        ? (s.milestone ? 'rgba(193,154,107,0.18)' : 'rgba(120,155,95,0.18)')
                        : 'rgba(255,240,215,0.03)',
                      border: `0.5px solid ${s.done ? (s.milestone ? 'rgba(193,154,107,0.3)' : 'rgba(120,155,95,0.3)') : 'rgba(255,240,215,0.05)'}`,
                      transition: 'all 0.4s ease'
                    }}
                  >
                    <span style={{ fontSize: 18, opacity: s.done ? 1 : 0.3 }}>{s.emoji}</span>
                    <span style={{ fontSize: 7, fontWeight: 600, textTransform: 'uppercase', color: s.done ? tokens.text : tokens.muted, lineHeight: 1.1 }}>{s.label}</span>
                    {s.done && <CheckCircle2 style={{ width: 10, height: 10, color: s.milestone ? 'rgba(193,154,107,0.8)' : 'rgba(120,155,95,0.8)' }} />}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: tokens.muted, fontFamily: FONT_CASUAL }}>Monthly Wellness Progress</span>
                  <span style={{ fontSize: 9, color: tokens.accent, fontWeight: 700 }}>{bingoStatus.completeCount} / 9</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,240,215,0.05)', borderRadius: 2 }}>
                  <div style={{ 
                    height: '100%', 
                    background: tokens.accent, 
                    borderRadius: 2, 
                    width: `${(bingoStatus.completeCount / 9) * 100}%`,
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* JOURNAL BOTTOM SHEET — toggles collapsed/expanded */}
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(175deg, #1d1812 0%, #141a24 100%)',
            borderTop: '0.5px solid rgba(193,154,107,0.25)',
            borderRadius: sheetOpen ? '0' : '22px 22px 0 0',
            boxShadow: '0 -12px 40px rgba(0,0,0,0.5)',
            padding: '10px 14px 80px',
            height: sheetOpen ? '88%' : '92px',
            transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1), border-radius 0.35s ease',
            overflowY: sheetOpen ? 'auto' : 'hidden',
            zIndex: 10,
          }}
        >
          {/* Grabber handle — tapping it toggles the sheet */}
          <button
            onClick={() => setSheetOpen((o) => !o)}
            style={{ display: 'block', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label={sheetOpen ? 'Collapse journal' : 'Expand journal'}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(193,154,107,0.35)', margin: '0 auto 8px' }} />
            {!sheetOpen && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,240,215,0.85)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Today's Journal</span>
                <span style={{ fontSize: 9, color: 'rgba(193,154,107,0.60)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tap to open ↑</span>
              </div>
            )}
          </button>

          {/* Journal content goes here — day entry */}
          {sheetOpen && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <h3 style={{ fontFamily: FONT_PANCAKE, color: 'rgba(255,240,215,0.92)', fontSize: 24 }}>Daily Log</h3>
                <p style={{ color: 'rgba(193,154,107,0.60)', fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>Capture your practice and presence.</p>
                <div style={{ padding: '40px 0', color: 'rgba(255,240,215,0.20)' }}>Journal entry system coming soon.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
