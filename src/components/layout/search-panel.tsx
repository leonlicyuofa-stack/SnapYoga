"use client";

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, orderBy, getDocs, type Timestamp } from 'firebase/firestore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { poseChallenges } from '@/lib/challenges-data';
import { format } from 'date-fns';

interface AnalysisHit {
  id: string;
  identifiedPose: string;
  score: number;
  createdAt: Timestamp;
}

type Tab = 'all' | 'challenges' | 'history';

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  // Light = amethyst on lavender; dark = the original parchment/gold on ink.
  const txt = (a: number) => isDark ? `rgba(255,245,230,${a})` : `rgba(50,14,59,${a})`;
  const acc = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  const sheetBg = isDark
    ? 'radial-gradient(120% 40% at 50% 0%, #1a2230 0%, #0d1016 55%)'
    : 'linear-gradient(175deg,#B0B5C0 0%,#9DA4B0 35%,#A8A0BC 70%,#9B96B5 100%)';
  const sheetBorder = isDark ? 'rgba(193,154,107,0.2)' : 'rgba(255,255,255,0.40)';
  const rowDivider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(50,14,59,0.08)';

  const LABEL: React.CSSProperties = { fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: acc(0.55), margin: '0 0 8px 2px' };
  const CARD: React.CSSProperties = {
    borderRadius: 14,
    border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.40)'}`,
    background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  };

  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [analyses, setAnalyses] = useState<AnalysisHit[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch practice history once, the first time the panel opens.
  useEffect(() => {
    if (!open || loaded || !user) return;
    const ref = collection(firestore, `users/${user.uid}/poseAnalyses`);
    getDocs(query(ref, orderBy('createdAt', 'desc')))
      .then(snap => setAnalyses(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnalysisHit))))
      .catch(err => console.error('Search history fetch failed:', err))
      .finally(() => setLoaded(true));
  }, [open, loaded, user]);

  const needle = q.trim().toLowerCase();

  const challengeHits = useMemo(
    () => needle ? poseChallenges.filter(c => c.name.toLowerCase().includes(needle) || c.category.toLowerCase().includes(needle)) : [],
    [needle]
  );
  const historyHits = useMemo(
    () => needle ? analyses.filter(a => a.identifiedPose?.toLowerCase().includes(needle)) : analyses.slice(0, 5),
    [needle, analyses]
  );

  const showChallenges = (tab === 'all' || tab === 'challenges') && challengeHits.length > 0;
  const showHistory = (tab === 'all' || tab === 'history') && historyHits.length > 0;
  const nothing = needle && !showChallenges && !showHistory;
  const hoverClass = isDark ? 'hover:bg-[rgba(193,154,107,0.05)]' : 'hover:bg-[rgba(50,14,59,0.05)]';

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="p-0 w-full sm:max-w-md border-l overflow-y-auto"
        style={{ background: sheetBg, borderColor: sheetBorder }}
      >
        <SheetTitle className="sr-only">Search</SheetTitle>

        <div className="p-4 pt-5 pr-12">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 14px', borderRadius: 999, border: `0.5px solid ${acc(0.3)}`, background: isDark ? 'rgba(193,154,107,0.06)' : 'rgba(255,255,255,0.15)' }}>
            <Search className="h-[18px] w-[18px]" style={{ color: acc(0.7) }} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search poses, challenges, history…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: txt(0.92), fontSize: 14 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {(['all', 'challenges', 'history'] as Tab[]).map(tk => {
              const on = tab === tk;
              return (
                <button
                  key={tk}
                  onClick={() => setTab(tk)}
                  style={{
                    fontSize: 11, padding: '5px 14px', borderRadius: 999, textTransform: 'capitalize', cursor: 'pointer',
                    background: on ? acc(0.85) : 'transparent',
                    color: on ? (isDark ? '#1a1210' : 'rgba(255,248,235,0.95)') : txt(0.6),
                    border: on ? 'none' : `0.5px solid ${acc(0.25)}`,
                    fontWeight: on ? 600 : 400,
                  }}
                >
                  {tk}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-8">
          {showChallenges && (
            <>
              <p style={LABEL}>Challenges</p>
              <div style={{ ...CARD, marginBottom: 16 }}>
                {challengeHits.map((c, i) => {
                  const inner = (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i === 0 ? 'none' : `0.5px solid ${rowDivider}` }}>
                      <Trophy className="h-5 w-5" style={{ color: acc(0.85), flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: txt(0.9), margin: 0 }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: txt(0.5), margin: '1px 0 0', fontStyle: 'italic' }}>{c.category}</p>
                      </div>
                      {c.detailLink !== '#' && <ChevronRight className="h-4 w-4" style={{ color: txt(0.35) }} />}
                    </div>
                  );
                  return c.detailLink !== '#'
                    ? <Link key={c.id} href={c.detailLink} onClick={onClose} className={`block ${hoverClass}`}>{inner}</Link>
                    : <div key={c.id}>{inner}</div>;
                })}
              </div>
            </>
          )}

          {showHistory && (
            <>
              <p style={LABEL}>{needle ? 'My Practice' : 'Recent Practice'}</p>
              <div style={CARD}>
                {historyHits.map((a, i) => (
                  <Link key={a.id} href={`/analysis/${a.id}`} onClick={onClose} className={`block ${hoverClass}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i === 0 ? 'none' : `0.5px solid ${rowDivider}` }}>
                      <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '10px 10px 10px 4px', background: 'linear-gradient(135deg, rgba(193,154,107,0.25), rgba(180,110,65,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧘</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="truncate" style={{ fontSize: 13, fontWeight: 500, color: txt(0.9), margin: 0 }}>{a.identifiedPose}</p>
                        <p style={{ fontSize: 11, color: txt(0.5), margin: '1px 0 0', fontStyle: 'italic' }}>{a.createdAt ? format(a.createdAt.toDate(), 'PP') : ''}</p>
                      </div>
                      <span style={{ background: acc(0.2), color: acc(0.92), borderRadius: 999, padding: '2px 9px', fontWeight: 500, fontSize: 11, flexShrink: 0 }}>
                        {Math.min(Math.round(a.score < 1 ? a.score * 100 : a.score), 100)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {nothing && (
            <p style={{ textAlign: 'center', marginTop: 40, fontSize: 13, fontStyle: 'italic', color: txt(0.4) }}>
              No matches for “{q.trim()}”.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
