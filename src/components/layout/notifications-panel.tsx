"use client";

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Trophy, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, orderBy, limit, getDocs, type Timestamp } from 'firebase/firestore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { poseChallenges } from '@/lib/challenges-data';
import { ensureChallengeStarted, computeChallengeDay } from '@/lib/challenge-progress';
import { differenceInCalendarDays, isToday, formatDistanceToNowStrict } from 'date-fns';

const READ_KEY = 'sy_read_notifications';

interface Note {
  id: string;
  icon: LucideIcon;
  tint: string;
  title: string;
  sub: string;
  date: Date;
  href: string;
}

interface AnalysisDoc {
  id: string;
  identifiedPose: string;
  score: number;
  createdAt: Timestamp;
}

// Longest run of consecutive calendar days ending today or yesterday.
function computeStreak(dates: Date[]): number {
  const days = Array.from(new Set(dates.map(d => Math.floor(d.getTime() / 86400000)))).sort((a, b) => b - a);
  if (!days.length) return 0;
  const today = Math.floor(Date.now() / 86400000);
  if (today - days[0] > 1) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === 1) streak++;
    else break;
  }
  return streak;
}

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  // Light = amethyst on lavender; dark = the original parchment/gold on ink.
  const txt = (a: number) => isDark ? `rgba(255,245,230,${a})` : `rgba(50,14,59,${a})`;
  const acc = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  const sheetBg = isDark
    ? 'radial-gradient(120% 40% at 50% 0%, #1a2230 0%, #0d1016 55%)'
    : 'linear-gradient(175deg,#B0B5C0 0%,#9DA4B0 35%,#A8A0BC 70%,#9B96B5 100%)';
  const sheetBorder = isDark ? 'rgba(193,154,107,0.2)' : 'rgba(255,255,255,0.40)';
  const divider = isDark ? 'rgba(193,154,107,0.14)' : 'rgba(50,14,59,0.12)';
  const unreadBg = isDark ? 'rgba(193,154,107,0.07)' : 'rgba(255,255,255,0.30)';
  const unreadDot = isDark ? '#c19a6b' : '#320E3B';
  const [analyses, setAnalyses] = useState<AnalysisDoc[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [challengeDays, setChallengeDays] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open || !user) return;
    const active = poseChallenges.filter(c => c.status === 'active' && c.totalDays);
    Promise.all(active.map(async c => {
      const startDate = await ensureChallengeStarted(user.uid, c.id);
      return [c.id, computeChallengeDay(startDate, c.totalDays!)] as const;
    })).then(entries => setChallengeDays(Object.fromEntries(entries)));
  }, [open, user]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      if (raw) setRead(new Set(JSON.parse(raw)));
    } catch { /* ignore malformed storage */ }
  }, []);

  useEffect(() => {
    if (!open || loaded || !user) return;
    const ref = collection(firestore, `users/${user.uid}/poseAnalyses`);
    getDocs(query(ref, orderBy('createdAt', 'desc'), limit(20)))
      .then(snap => setAnalyses(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnalysisDoc))))
      .catch(err => console.error('Notifications fetch failed:', err))
      .finally(() => setLoaded(true));
  }, [open, loaded, user]);

  const notes = useMemo<Note[]>(() => {
    const out: Note[] = [];
    const dated = analyses.filter(a => a.createdAt?.toDate);

    dated.slice(0, 3).forEach(a => {
      const score = Math.min(Math.round(a.score < 1 ? a.score * 100 : a.score), 100);
      out.push({
        id: `analysis-${a.id}`, icon: Sparkles, tint: 'rgba(193,154,107',
        title: `Your ${a.identifiedPose} analysis is ready`, sub: `Scored ${score} · view feedback`,
        date: a.createdAt.toDate(), href: `/analysis/${a.id}`,
      });
    });

    const streak = computeStreak(dated.map(a => a.createdAt.toDate()));
    if (streak >= 2) {
      out.push({
        id: `streak-${streak}`, icon: Flame, tint: 'rgba(216,118,58',
        title: `${streak}-day streak unlocked`, sub: 'Keep your practice going',
        date: dated[0].createdAt.toDate(), href: '/practice-calendar',
      });
    }

    poseChallenges.filter(c => c.status === 'active' && challengeDays[c.id]).forEach(c => {
      out.push({
        id: `challenge-${c.id}-day${challengeDays[c.id]}`, icon: Trophy, tint: 'rgba(193,154,107',
        title: `${c.name} · Day ${challengeDays[c.id]}/${c.totalDays}`, sub: 'Continue your challenge',
        date: new Date(Date.now() - 86400000), href: c.detailLink !== '#' ? c.detailLink : '/challenges',
      });
    });

    return out.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [analyses, challengeDays]);

  const persist = (next: Set<string>) => {
    setRead(next);
    try { localStorage.setItem(READ_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
  };
  const markAll = () => persist(new Set([...read, ...notes.map(n => n.id)]));
  const markOne = (id: string) => persist(new Set([...read, id]));

  const today = notes.filter(n => isToday(n.date));
  const earlier = notes.filter(n => !isToday(n.date));

  const row = (n: Note) => {
    const unread = !read.has(n.id);
    return (
      <Link key={n.id} href={n.href} onClick={() => { markOne(n.id); onClose(); }} className="block">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 12px', borderRadius: 12, background: unread ? unreadBg : 'transparent', marginBottom: 6 }}>
          <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', background: `${n.tint},${isDark ? 0.15 : 0.2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <n.icon className="h-[18px] w-[18px]" style={{ color: `${n.tint},0.9)` }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: unread ? txt(0.92) : txt(0.7), margin: 0 }}>{n.title}</p>
            <p style={{ fontSize: 11, color: txt(0.5), margin: '2px 0 0' }}>{n.sub}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <span style={{ fontSize: 10, color: txt(0.4), whiteSpace: 'nowrap' }}>{shortAgo(n.date)}</span>
            {unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: unreadDot }} />}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="p-0 w-full sm:max-w-md border-l overflow-y-auto"
        style={{ background: sheetBg, borderColor: sheetBorder }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 14px', borderBottom: `0.5px solid ${divider}` }}>
          <SheetTitle style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 21, fontWeight: 600, color: isDark ? 'rgba(255,245,230,0.94)' : '#320E3B' }}>
            Notifications
          </SheetTitle>
          {notes.length > 0 && (
            <button onClick={markAll} style={{ border: 'none', background: 'transparent', color: acc(0.85), fontSize: 11, cursor: 'pointer', marginRight: 24 }}>
              Mark all read
            </button>
          )}
        </div>

        <div className="px-4 py-4 pb-8">
          {notes.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: 40, fontSize: 13, fontStyle: 'italic', color: txt(0.4) }}>
              {loaded ? "You're all caught up." : 'Loading…'}
            </p>
          ) : (
            <>
              {today.length > 0 && <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: acc(0.55), margin: '0 0 8px 2px' }}>Today</p>}
              {today.map(row)}
              {earlier.length > 0 && <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: acc(0.55), margin: '16px 0 8px 2px' }}>Earlier</p>}
              {earlier.map(row)}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function shortAgo(date: Date): string {
  const days = differenceInCalendarDays(new Date(), date);
  if (days >= 1) return `${days}d`;
  return formatDistanceToNowStrict(date, { roundingMethod: 'floor' })
    .replace(/ seconds?/, 's').replace(/ minutes?/, 'm').replace(/ hours?/, 'h');
}
