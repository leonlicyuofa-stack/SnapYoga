"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, orderBy, getDocs, type Timestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { format, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import type { DayContentProps } from 'react-day-picker';
import { cn } from '@/lib/utils';


interface AnalysisSummary {
  id: string;
  createdAt: Timestamp;
  identifiedPose: string;
  score: number;
  userNotes?: string;
}

export default function AnalysisLogsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  // Light = amethyst on lavender; dark = the original cream/gold on ink.
  const txt = (a: number) => isDark ? `rgba(255,240,215,${a})` : `rgba(50,14,59,${a})`;
  const acc = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  const labelStyle: React.CSSProperties = {
    fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: acc(0.55),
  };
  const cardStyle: React.CSSProperties = {
    borderRadius: 18,
    border: `0.5px solid ${isDark ? 'rgba(193,154,107,0.18)' : 'rgba(255,255,255,0.40)'}`,
    background: isDark ? 'rgba(13,20,30,0.55)' : 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(14px)',
  };
  const TITLE = isDark ? 'rgba(255,240,215,0.94)' : 'rgba(255,248,235,0.96)';
  const TITLE_SH = isDark ? 'none' : '0 1px 3px rgba(70,60,80,0.32)';
  // The populated results list is an amethyst-filled panel in light mode (dark = the original ink card).
  const listPanel: React.CSSProperties = {
    borderRadius: 18,
    border: `0.5px solid ${isDark ? 'rgba(193,154,107,0.18)' : 'rgba(255,255,255,0.12)'}`,
    background: isDark ? 'rgba(13,20,30,0.55)' : 'linear-gradient(160deg,#3a1545,#2c0e36)',
    backdropFilter: 'blur(14px)',
    boxShadow: isDark ? 'none' : '0 10px 26px rgba(40,12,48,0.30)',
  };
  const onPanelName = isDark ? 'rgba(255,240,215,0.90)' : 'rgba(255,248,235,0.96)';
  const onPanelMuted = isDark ? 'rgba(255,240,215,0.40)' : 'rgba(255,248,235,0.55)';
  const onPanelAccent = isDark ? 'rgba(193,154,107,0.70)' : 'rgba(214,180,140,0.90)';
  const onPanelChevron = isDark ? 'rgba(193,154,107,0.45)' : 'rgba(255,248,235,0.40)';
  const onPanelDivider = isDark ? 'rgba(193,154,107,0.10)' : 'rgba(255,255,255,0.09)';
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setError("You must be logged in to view analysis history.");
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch from the 'poseAnalyses' collection in Firestore
    const analysesCollectionRef = collection(firestore, `users/${currentUser.uid}/poseAnalyses`);
    const q = query(analysesCollectionRef, orderBy('createdAt', 'desc'));

    getDocs(q)
      .then((querySnapshot) => {
        const fetchedAnalyses: AnalysisSummary[] = [];
        querySnapshot.forEach((doc) => {
          fetchedAnalyses.push({ id: doc.id, ...doc.data() } as AnalysisSummary);
        });

        setAnalyses(fetchedAnalyses);
        if (fetchedAnalyses.length === 0) {
          setError("No analysis history found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching analysis history from Firestore:", err);
        setError("Failed to fetch analysis history. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser, authLoading]);

  const filteredAnalyses = analyses.filter(analysis =>
      selectedDate ? isSameDay(analysis.createdAt.toDate(), selectedDate) : true
  );

  const analysisDates = useMemo(() => {
    const dates = new Set<string>();
    analyses.forEach(analysis => {
      dates.add(format(analysis.createdAt.toDate(), 'yyyy-MM-dd'));
    });
    return dates;
  }, [analyses]);

  const DayWithDot = (props: DayContentProps) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const hasAnalysis = analysisDates.has(dateStr);
    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center pt-1">
        <span>{format(props.date, 'd')}</span>
        <div className={cn(
            "h-1.5 w-1.5 rounded-full mt-0.5",
            hasAnalysis ? "bg-primary" : "bg-transparent"
        )} />
      </div>
    );
  };

  if (authLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <SmileyRockLoader />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* BACK */}
        <Link
          href="/profile"
          className="group inline-flex items-center gap-2 mb-8"
          style={{ fontSize: 12, color: txt(0.55) }}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" style={{ color: acc(0.75) }} />
          Back to Profile
        </Link>

        {/* HEADER */}
        <div className="mb-6">
          <p style={labelStyle}>My Practices</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, fontWeight: 600, color: TITLE, textShadow: TITLE_SH, marginTop: 4 }}>
            Practice History
          </h1>
        </div>

        {/* CALENDAR */}
        <div style={cardStyle} className="p-4 mb-8 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="p-0"
            components={{
              DayContent: DayWithDot
            }}
            styles={{
              day_selected: {
                backgroundColor: isDark ? 'rgba(193,154,107,0.85)' : '#320E3B',
                color: isDark ? 'rgba(25,16,8,0.95)' : 'rgba(255,248,235,0.95)',
                borderRadius: '9999px',
              },
              day_today: {
                color: isDark ? 'rgba(214,178,130,0.95)' : '#320E3B',
                fontWeight: 700,
              }
            }}
          />
        </div>

        {/* RESULTS */}
        <div className="space-y-3">
          <p style={labelStyle}>
            {selectedDate ? format(selectedDate, 'PPP') : 'All Time'}
          </p>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full bg-white/5" />
              <Skeleton className="h-16 w-full bg-white/5" />
              <Skeleton className="h-16 w-full bg-white/5" />
            </div>
          ) : filteredAnalyses.length > 0 ? (
            <div style={listPanel} className="overflow-hidden">
              {filteredAnalyses.map((analysis, i) => {
                const scoreValue = analysis.score < 1 ? analysis.score * 100 : analysis.score;
                const score = Math.min(Math.round(scoreValue), 100);
                return (
                  <Link
                    key={analysis.id}
                    href={`/analysis/${analysis.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[rgba(193,154,107,0.05)]"
                    style={{ borderTop: i === 0 ? 'none' : `0.5px solid ${onPanelDivider}` }}
                  >
                    {/* Pose thumbnail */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center text-lg"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px 12px 12px 4px',
                        background: 'linear-gradient(135deg, rgba(193,154,107,0.25), rgba(180,110,65,0.20))',
                      }}
                    >
                      🧘
                    </div>

                    {/* Pose + time */}
                    <div className="flex-grow min-w-0">
                      <div className="truncate" style={{ fontSize: 14, fontWeight: 600, color: onPanelName }}>
                        {analysis.identifiedPose}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span style={{ fontSize: 11, fontStyle: 'italic', color: onPanelMuted }}>
                          {format(analysis.createdAt.toDate(), 'p')}
                        </span>
                        {analysis.userNotes && (
                          <span className="inline-flex items-center gap-1" style={{ fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase', color: onPanelAccent }}>
                            <MessageCircle className="h-2.5 w-2.5" /> Note
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score chip */}
                    <span
                      className="flex-shrink-0"
                      style={{ background: isDark ? acc(0.20) : 'rgba(214,180,140,0.92)', color: isDark ? acc(0.92) : '#2c0e36', borderRadius: 999, padding: '2px 10px', fontWeight: 700, fontSize: 12 }}
                    >
                      {score}
                    </span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: onPanelChevron }} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ ...cardStyle, borderStyle: 'dashed' }} className="px-6 py-10 text-center">
              <p style={{ fontSize: 28, marginBottom: 8 }}>🧘</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 600, color: txt(0.80) }}>
                No practices {selectedDate ? 'on this day' : 'yet'}
              </p>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: txt(0.40), marginTop: 4 }}>
                {error && analyses.length === 0
                  ? 'Try the Analyze tab to record your first practice.'
                  : selectedDate ? `Nothing recorded on ${format(selectedDate, 'PPP')}.` : 'Select a date to view your practices.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
