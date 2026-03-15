
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where, type Timestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Activity, Smile, Clock, Sparkles, ChevronDown, RefreshCcw } from 'lucide-react';
import { startOfDay, format, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { SmileyPebbleIcon } from '@/components/icons/smiley-pebble-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Brand colour tokens ────────────────────────────────────────────────────
const GOLD        = 'rgba(193,154,107';
const PARCHMENT   = 'rgba(255,240,215';
const TERRACOTTA  = 'rgba(180,110,65';
const SAGE        = 'rgba(120,140,100';
const DEEP_BARK   = 'rgba(25,16,8';

// ─── Shared card shell ────────────────────────────────────────────────────────
function GlassCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn('transition-transform duration-300 hover:scale-[1.015]', className)}
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

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs tracking-widest uppercase font-medium font-serif italic"
      style={{ color: `${PARCHMENT},0.40)` }}
    >
      {children}
    </p>
  );
}

// ─── Data models ─────────────────────────────────────────────────────────────
interface StoredAnalysis {
  id: string;
  createdAt: Timestamp;
  identifiedPose?: string;
  score?: number;
}

interface StoredMood {
  id: string;
  loggedAt: Timestamp;
  name: string;
  emoji: string;
}

type ViewMode = 'mood' | 'practice';

const moodToColor: Record<string, string> = {
  'Joyful': 'bg-green-300',
  'Calm': 'bg-blue-300',
  'Emotional': 'bg-orange-300',
  'Fatigue': 'bg-amber-400',
};

const moodToFace: Record<string, 'happy' | 'neutral' | 'sad'> = {
  'Joyful': 'happy',
  'Calm': 'happy',
  'Emotional': 'neutral',
  'Fatigue': 'sad',
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PracticeCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('practice');
  const [moodsByDate, setMoodsByDate] = useState<Record<string, StoredMood>>({});
  const [analysesByDate, setAnalysesByDate] = useState<Record<string, StoredAnalysis[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfDay(new Date()));
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    
    setIsLoadingData(true);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const fetchMoods = getDocs(query(collection(firestore, 'users', user.uid, 'moods'), where('loggedAt', '>=', start), where('loggedAt', '<=', end)));
    const fetchAnalyses = getDocs(query(collection(firestore, 'users', user.uid, 'poseAnalyses'), where('createdAt', '>=', start), where('createdAt', '<=', end)));

    Promise.all([fetchMoods, fetchAnalyses]).then(([moodsSnapshot, analysesSnapshot]) => {
        const fetchedMoods: Record<string, StoredMood> = {};
        moodsSnapshot.forEach(doc => {
            const mood = { id: doc.id, ...doc.data() } as StoredMood;
            if(mood.loggedAt) fetchedMoods[format(mood.loggedAt.toDate(), 'yyyy-MM-dd')] = mood;
        });
        setMoodsByDate(fetchedMoods);

        const fetchedAnalyses: Record<string, StoredAnalysis[]> = {};
        analysesSnapshot.forEach(doc => {
            const analysis = { id: doc.id, ...doc.data() } as StoredAnalysis;
            if(analysis.createdAt) {
                const dateStr = format(analysis.createdAt.toDate(), 'yyyy-MM-dd');
                if (!fetchedAnalyses[dateStr]) fetchedAnalyses[dateStr] = [];
                fetchedAnalyses[dateStr].push(analysis);
            }
        });
        setAnalysesByDate(fetchedAnalyses);
    }).catch((err) => {
        console.error("Error fetching calendar data:", err);
        setError("Failed to load practice history.");
    }).finally(() => {
        setIsLoadingData(false);
    });
  }, [user, authLoading, currentMonth]);

  const DayContent = (props: { date: Date }) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const mood = moodsByDate[dateStr];
    const analyses = analysesByDate[dateStr];

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-0.5 pt-1">
            <span className={cn(
                "relative z-10 text-[10px] font-medium", 
                isSameDay(props.date, new Date()) ? "text-primary font-bold" : "text-white/40",
            )}>
                {format(props.date, 'd')}
            </span>
            {viewMode === 'mood' && mood && (
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", moodToColor[mood.name] || 'bg-muted')}>
                    <SmileyPebbleIcon mood={moodToFace[mood.name] || 'neutral'} className="w-3.5 h-3.5" />
                </div>
            )}
            {viewMode === 'practice' && analyses && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${GOLD},0.2)` }}>
                    <Activity className="w-3 h-3" style={{ color: `${GOLD},0.9)` }} />
                </div>
            )}
        </div>
    );
  };

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const dayAnalyses = selectedDateStr ? analysesByDate[selectedDateStr] || [] : [];
  const dayMood = selectedDateStr ? moodsByDate[selectedDateStr] : null;

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen">
        <header className="container mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold tracking-tight" style={{ color: `${PARCHMENT},0.92)` }}>
                Practice Calendar
              </h1>
              <p className="text-xs font-serif italic mt-0.5" style={{ color: `${PARCHMENT},0.38)` }}>
                Your journey through movement and mood.
              </p>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date())} className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10">
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 pb-20 space-y-2">
          {/* ROW 1 — Calendar (2/3) + Info (1/3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <GlassCard className="md:col-span-2 px-4 py-3" style={{ borderRadius: '32px 32px 16px 32px' }}>
              <div className="flex items-center justify-between mb-2">
                <CardLabel>{format(currentMonth, 'MMMM yyyy')}</CardLabel>
                <div className="p-1 rounded-full" style={{ background: `${GOLD},0.12)` }}>
                  <Sparkles className="h-3 w-3" style={{ color: `${GOLD},0.70)` }} />
                </div>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="p-0 border-none bg-transparent"
                classNames={{
                    months: 'p-0',
                    month: 'p-0 space-y-2',
                    caption: "hidden",
                    head_row: "flex justify-around mb-1",
                    head_cell: "text-white/20 font-serif italic text-[10px] w-full uppercase tracking-tighter",
                    row: "flex w-full justify-around",
                    cell: "h-12 w-12 text-center text-sm p-0 relative rounded-lg",
                    day: "h-12 w-12 p-0 font-normal rounded-lg hover:bg-white/5 transition-colors",
                    day_selected: "bg-white/10 ring-1 ring-white/20",
                    day_today: "",
                    day_outside: "opacity-10",
                }}
                components={{ DayContent: DayContent }}
              />
            </GlassCard>

            <GlassCard
              className="px-4 py-3 flex flex-col justify-between"
              style={{
                background: `${TERRACOTTA},0.18)`,
                border: `0.5px solid ${GOLD},0.28)`,
                borderRadius: '16px 32px 32px 16px',
              }}
            >
              <div className="space-y-4">
                <div>
                    <CardLabel>View Mode</CardLabel>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between mt-1 h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white">
                                <div className="flex items-center gap-2">
                                    {viewMode === 'mood' ? <Smile className="h-4 w-4"/> : <Activity className="h-4 w-4"/>}
                                    <span className="capitalize text-sm font-serif">{viewMode}</span>
                                </div>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/80 backdrop-blur-lg border-white/10 text-white w-48">
                            <DropdownMenuLabel>View Activity By</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuRadioGroup value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                                <DropdownMenuRadioItem value="mood" className="focus:bg-white/10 cursor-pointer">
                                    <Smile className="mr-2 h-4 w-4" /> Mood
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="practice" className="focus:bg-white/10 cursor-pointer">
                                    <Activity className="mr-2 h-4 w-4" /> Practice
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-2">
                    <CardLabel>Month Summary</CardLabel>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-lg font-serif font-bold text-white/90">{Object.keys(analysesByDate).length}</p>
                            <p className="text-[8px] uppercase tracking-widest text-white/30">Sessions</p>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-lg font-serif font-bold text-white/90">{Object.keys(moodsByDate).length}</p>
                            <p className="text-[8px] uppercase tracking-widest text-white/30">Moods Logged</p>
                        </div>
                    </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-serif italic" style={{ color: `${PARCHMENT},0.40)` }}>
                  Yoga is the journey of the self, through the self, to the self.
                </p>
              </div>
            </GlassCard>
          </div>

          {/* ROW 2 — Stats (1/3) + Day Details (2/3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <GlassCard
              className="px-4 py-3 flex flex-col gap-3"
              style={{
                background: `${DEEP_BARK},0.50)`,
                border: `0.5px solid ${GOLD},0.18)`,
                borderRadius: '16px 16px 32px 32px',
              }}
            >
              <div className="flex items-center justify-between">
                <CardLabel>Practice Consistency</CardLabel>
                <Clock className="h-3 w-3" style={{ color: `${GOLD},0.45)` }} />
              </div>

              <div className="grid grid-cols-7 gap-1 px-1 py-2">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-colors duration-500",
                      i < Object.keys(analysesByDate).length ? "bg-primary/80" : "bg-white/10"
                    )} 
                  />
                ))}
              </div>

              <div>
                <p className="text-[10px] font-serif italic" style={{ color: `${PARCHMENT},0.32)` }}>
                  {Object.keys(analysesByDate).length} of 28 days this cycle
                </p>
              </div>
            </GlassCard>

            <GlassCard
              className="md:col-span-2 px-4 py-3"
              style={{ borderRadius: '32px 32px 32px 16px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <CardLabel>Details: {selectedDate ? format(selectedDate, 'MMM d') : 'No date selected'}</CardLabel>
                <Activity className="h-3 w-3" style={{ color: `${GOLD},0.45)` }} />
              </div>
              
              <div className="space-y-3 max-h-[140px] overflow-y-auto pr-2 no-scrollbar">
                {dayMood && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", moodToColor[dayMood.name])}>
                                <SmileyPebbleIcon mood={moodToFace[dayMood.name]} className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-serif font-semibold text-white/90">{dayMood.name} Mood</p>
                                <p className="text-[10px] text-white/40">Logged at {format(dayMood.loggedAt.toDate(), 'p')}</p>
                            </div>
                        </div>
                        <span className="text-xl">{dayMood.emoji}</span>
                    </div>
                )}

                {dayAnalyses.length > 0 ? dayAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
                                <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-serif font-semibold text-white/90">{analysis.identifiedPose || 'Yoga Session'}</p>
                                <p className="text-[10px] text-white/40">Score: {analysis.score ? Math.round(analysis.score) : 'N/A'}</p>
                            </div>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10">
                            <Link href={`/analysis/${analysis.id}`}>View Report</Link>
                        </Button>
                    </div>
                )) : !dayMood && (
                    <div className="flex flex-col items-center justify-center h-24 text-white/20">
                        <CalendarDays className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-xs font-serif italic">No activity recorded for this day.</p>
                    </div>
                )}
              </div>
            </GlassCard>
          </div>
        </main>

        {error && (
            <div className="fixed bottom-20 left-4 right-4 z-50">
                <Alert variant="destructive" className="bg-red-900/80 backdrop-blur-md border-red-500/50 text-white rounded-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )}
      </div>
    </AppShell>
  );
}
