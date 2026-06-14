"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Smile, Wind, Frown, Meh, Activity, Flame, Droplets, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── Brand tokens ────────────────────────────────────────────────────────────
const GOLD      = 'rgba(193,154,107';
const PARCHMENT = 'rgba(255,240,215';
const TERRACOTTA= 'rgba(180,110,65';
const SAGE      = 'rgba(120,140,100';
const DEEP_BARK = 'rgba(25,16,8';

const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function getThemeTokens(isDark: boolean) {
  return {
    text: 'rgba(255,240,215,0.92)',
    muted: 'rgba(255,240,215,0.40)',
    cardBg: `rgba(193,154,107,0.045)`,
    cardBorder: `rgba(193,154,107,0.18)`,
    accent: `rgba(193,154,107,0.85)`,
    dayText: 'rgba(255,240,215,0.85)',
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

// ─── Mood config ─────────────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const tokens = getThemeTokens(isDark);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });

  const [moodsByDate, setMoodsByDate]       = useState<Record<string, StoredMood>>({});
  const [analysesByDate, setAnalysesByDate] = useState<Record<string, StoredAnalysis[]>>({});
  const [habitsByDate, setHabitsByDate]     = useState<Record<string, string[]>>({});
  const [selectedDay, setSelectedDay]       = useState<Date | null>(null);
  const [isLogging, setIsLogging]           = useState(false);

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

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

        {/* BASE SUMMARY LAYER — always visible */}
        <div style={{ position: 'absolute', inset: 0, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 100 }}>
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

          <div>SUMMARY PLACEHOLDER — habit fan + bingo go here</div>
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
              <div>JOURNAL PLACEHOLDER — day entry goes here</div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}