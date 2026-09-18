"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { GlossyButton } from '@/components/ui/glossy-button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Gift, Copy, Mail, Share2, Bookmark, X, ChevronDown, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopBarIcons } from '@/components/layout/top-bar-icons';
import { type Category, type PoseChallenge, CATEGORIES, poseChallenges } from '@/lib/challenges-data';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth, getDaysInMonth, startOfWeek, addDays, getDate } from 'date-fns';
import { ensureChallengeStarted, computeChallengeDay } from '@/lib/challenge-progress';
import { loadPracticeDays, readStreak, currentStreak, streakFromDays, todayStillOpen, dayKey } from '@/lib/practice-streak';

const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
// The brand guide gives serif to titles and numbers, and system sans to labels,
// body and data. The app body is font-serif, so sans has to be asked for.
const FONT_SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// ─── Data ──────────────────────────────────────────────────────────────────
// Challenge catalog lives in @/lib/challenges-data (shared with search).

const programs = [
  { id: 'prog-7',  days: 7,  name: 'Kickstart' },
  { id: 'prog-14', days: 14, name: 'Reset' },
  { id: 'prog-30', days: 30, name: 'Journey' },
];

const routines = [
  { id: 'rout-morning', name: 'Morning Rise', icon: '☀️', meta: '30 min · energising' },
  { id: 'rout-restore', name: 'Restorative',  icon: '🌙', meta: '30 min · calming' },
];

// Lookup for rendering bookmarked items in "Your Plan"
const planLookup: Record<string, { name: string; sub: string; emoji: string; grad: string }> = {};
poseChallenges.forEach(c => { planLookup[c.id] = { name: c.name, sub: c.category, emoji: c.emoji, grad: c.grad }; });
programs.forEach(p => { planLookup[p.id] = { name: p.name, sub: `${p.days}-day program`, emoji: `${p.days}`, grad: 'linear-gradient(160deg,#5a4632,#1a2233)' }; });
routines.forEach(r => { planLookup[r.id] = { name: r.name, sub: 'Quick routine', emoji: r.icon, grad: 'linear-gradient(160deg,#3f4a5a,#16202a)' }; });

function SectionHead({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '22px 0 10px' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? 'rgba(193,154,107,0.6)' : '#320E3B', fontWeight: 600, fontFamily: FONT_CASUAL }}>{children}</p>
      {action}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  const { isDark } = useTheme();
  return <span style={{ fontSize: 9, color: isDark ? 'rgba(214,178,130,0.9)' : 'rgba(50,14,59,0.8)', letterSpacing: 1 }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

function ComingSoon() {
  const { isDark } = useTheme();
  return <span style={{ fontSize: 7.5, letterSpacing: 1, textTransform: 'uppercase', color: isDark ? 'rgba(214,178,130,0.85)' : '#320E3B', background: isDark ? 'rgba(193,154,107,0.14)' : 'rgba(50,14,59,0.10)', border: `0.5px solid ${isDark ? 'rgba(193,154,107,0.25)' : 'rgba(50,14,59,0.25)'}`, borderRadius: 999, padding: '2px 7px' }}>Coming soon</span>;
}

// ─── Invite friend dialog (unchanged behaviour) ─────────────────────────────
function InviteFriendDialog() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [inviteLink, setInviteLink] = useState('');

  React.useEffect(() => { if (typeof window !== 'undefined') setInviteLink(window.location.origin); }, []);

  const handleCopyLink = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        toast({ title: "Link Copied!", description: "A shareable link has been copied to your clipboard." });
      }).catch(() => toast({ title: "Copy Failed", description: "Could not copy the link.", variant: "destructive" }));
    }
  };

  const shareText = `Hey! I'm using SnapYoga to improve my practice. You should check it out: ${inviteLink}`;
  const mailtoLink = `mailto:?subject=${encodeURIComponent("Join me on SnapYoga!")}&body=${encodeURIComponent(shareText)}`;
  const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(inviteLink)}&media=${encodeURIComponent('https://placehold.co/600x400.png')}&description=${encodeURIComponent(shareText)}`;

  const handleInstagramShare = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        toast({ title: "Link Copied!", description: "Paste this link in your Instagram bio or stories to share.", duration: 5000 });
      }).catch(() => toast({ title: "Copy Failed", description: "Could not copy the link.", variant: "destructive" }));
    }
  };

  // Nothing here may assume a theme — the dialog used to be pinned to black
  // with white text, so it stayed black on the light theme too.
  const txt  = (a: number) => isDark ? `rgba(255,240,215,${a})` : `rgba(50,14,59,${a})`;
  const acc  = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  const panel = isDark
    ? 'linear-gradient(160deg, rgba(38,33,30,0.97) 0%, rgba(20,17,22,0.97) 100%)'
    : 'linear-gradient(160deg, rgba(255,253,250,0.98) 0%, rgba(243,237,250,0.98) 100%)';
  const field = isDark ? 'rgba(255,240,215,0.07)' : 'rgba(255,255,255,0.75)';
  const shareBtn: React.CSSProperties = {
    height: 44, borderRadius: 12, background: isDark ? 'rgba(255,240,215,0.05)' : 'rgba(255,255,255,0.7)',
    border: `1px solid ${acc(isDark ? 0.22 : 0.18)}`, color: txt(0.88),
    fontFamily: FONT_SANS, fontSize: 13.5, fontWeight: 500,
  };
  // Eyebrow: sans 600, uppercase, .28em tracking, full-strength colour.
  const eyebrow: React.CSSProperties = {
    fontFamily: FONT_SANS, fontSize: 10, fontWeight: 600, letterSpacing: '0.28em',
    textTransform: 'uppercase', color: acc(isDark ? 0.9 : 1),
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Was hard-coded gold, which all but vanished on the light theme's
            lavender ground. The shared glossy pill carries both themes. */}
        {/* "Share your link" is what the button actually does — it opens a
            sharing sheet rather than adding anyone. */}
        <GlossyButton variant="primary" icon={<Share2 className="h-4 w-4" />} style={{ height: 42, fontSize: 14 }}>
          Share your link
        </GlossyButton>
      </DialogTrigger>
      <DialogContent
        className="rounded-2xl backdrop-blur-lg"
        style={{
          // Sit inside the page rather than running edge to edge.
          width: 'calc(100% - 48px)',
          maxWidth: 380,
          borderRadius: 20,   // the brand's uniform card radius
          background: panel,
          border: `1px solid ${acc(isDark ? 0.24 : 0.16)}`,
          boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.6)' : '0 24px 60px rgba(50,14,59,0.22)',
          color: txt(0.9),
        }}
      >
        {/* Let people leave without sharing anything. */}
        <DialogClose
          aria-label="Close"
          style={{
            position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isDark ? 'rgba(255,240,215,0.07)' : 'rgba(50,14,59,0.07)',
            border: `1px solid ${acc(0.2)}`, color: txt(0.7), cursor: 'pointer',
          }}
        >
          <X className="h-4 w-4" />
        </DialogClose>

        <DialogHeader>
          <p style={{ ...eyebrow, textAlign: 'center', margin: 0 }}>SnapYoga · Community</p>
          <DialogTitle style={{ fontFamily: FONT_PANCAKE, fontSize: 22, fontWeight: 600, color: txt(0.96), textAlign: 'center', margin: '2px 0 0' }}>
            Share your link
          </DialogTitle>
          {/* The reward is made on the card now, so this only has to hand over
              the link and the places to send it. */}
          <DialogDescription style={{ fontFamily: FONT_SANS, fontSize: 12.5, lineHeight: 1.5, fontWeight: 400, color: txt(0.62), textAlign: 'center', margin: '5px 0 0' }}>
            Send it any way you like — the $3 lands when they sign up.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-link" style={eyebrow}>Your invite link</Label>
            <div className="flex space-x-2">
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="h-11 rounded-lg"
                style={{ background: field, border: `1px solid ${acc(0.2)}`, color: txt(0.9), fontFamily: FONT_SANS, fontSize: 13 }}
              />
              <Button
                type="button"
                size="icon"
                onClick={handleCopyLink}
                aria-label="Copy invite link"
                className="rounded-lg"
                style={{ background: acc(isDark ? 0.18 : 0.10), border: `1px solid ${acc(0.24)}`, color: txt(0.9) }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild className="rounded-lg" style={shareBtn}><a href={whatsappLink} target="_blank" rel="noopener noreferrer"><Share2 className="mr-2 h-4 w-4" /> WhatsApp</a></Button>
            <Button variant="outline" asChild className="rounded-lg" style={shareBtn}><a href={mailtoLink} target="_blank" rel="noopener noreferrer"><Mail className="mr-2 h-4 w-4" /> Email</a></Button>
            <Button variant="outline" onClick={handleInstagramShare} className="rounded-lg" style={shareBtn}><Share2 className="mr-2 h-4 w-4" /> Instagram</Button>
            <Button variant="outline" asChild className="rounded-lg" style={shareBtn}><a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer"><PinterestIcon className="mr-2 h-4 w-4" /> Pinterest</a></Button>
          </div>
        </div>
        <DialogFooter>
          <p className="text-center w-full" style={{ fontFamily: FONT_SANS, fontSize: 11, color: txt(0.5) }}>Sharing is caring! Grow your yoga community.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bookmark button ─────────────────────────────────────────────────────────
function BookmarkBtn({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const { isDark } = useTheme();
  const mark = isDark ? 'rgba(214,178,130,0.95)' : '#320E3B';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-label={active ? 'Remove from your plan' : 'Add to your plan'}
      style={{ position: 'absolute', top: 7, right: 7, width: 24, height: 24, borderRadius: '50%', background: isDark ? 'rgba(13,20,30,0.6)' : 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', zIndex: 2 }}
    >
      <Bookmark className="h-3.5 w-3.5" style={{ color: mark, fill: active ? mark : 'none' }} />
    </button>
  );
}

export default function ChallengesPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { isDark } = useTheme();

  // Light-mode = amethyst on lavender; dark-mode = the original cream/gold on ink.
  const TITLE   = isDark ? 'rgba(255,240,215,0.94)' : 'rgba(255,248,235,0.96)';
  const TITLE_SH = isDark ? 'none' : '0 1px 3px rgba(70,60,80,0.32)';
  const txt = (a: number) => isDark ? `rgba(255,240,215,${a})` : `rgba(50,14,59,${a})`;
  const acc = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  const card = isDark ? 'rgba(13,20,30,0.50)' : 'rgba(255,255,255,0.12)';
  const cardBorder = isDark ? 'rgba(193,154,107,0.18)' : 'rgba(255,255,255,0.40)';
  const sectionCard: React.CSSProperties = { borderRadius: 16, border: `0.5px solid ${cardBorder}`, background: card, backdropFilter: 'blur(14px)' };

  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');

  // Arriving from a profile interest tile pre-selects that category.
  // Read from the URL directly rather than useSearchParams, which would drag a
  // Suspense boundary around this whole page.
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat && (CATEGORIES as string[]).includes(cat)) setSelectedCategory(cat as Category);
  }, []);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  // Hero breakdown: the range behind the dropdown, and the days behind the bars.
  const [range, setRange] = useState<'week' | 'month'>('month');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [practiceDays, setPracticeDays] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [streakOpen, setStreakOpen] = useState(true);
  const [minutes, setMinutes] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [practicedDaysCount, setPracticedDaysCount] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState(30);
  const [isLoadingPracticed, setIsLoadingPracticed] = useState(true);
  const [challengeDays, setChallengeDays] = useState<Record<string, number>>({});

  // Real per-user Day X/Y for each active challenge (start date recorded on first view).
  useEffect(() => {
    if (!user) return;
    const active = poseChallenges.filter(c => c.status === 'active' && c.totalDays);
    Promise.all(active.map(async c => {
      const startDate = await ensureChallengeStarted(user.uid, c.id);
      return [c.id, computeChallengeDay(startDate, c.totalDays!)] as const;
    })).then(entries => setChallengeDays(Object.fromEntries(entries)));
  }, [user]);

  // Hydrate bookmarks from the user profile.
  useEffect(() => {
    const saved = (profile as any)?.bookmarkedItems;
    if (Array.isArray(saved)) setBookmarks(saved);
  }, [profile]);

  // Days-practiced tracker (activity ∩ analyses ∩ challenge tasks).
  useEffect(() => {
    if (!user) return;
    const fetchPractice = async () => {
      setIsLoadingPracticed(true);
      try {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        setDaysInMonth(getDaysInMonth(now));

        // Every day practised this month. This used to require an activity doc
        // AND an analysis AND a challenge task on the same day — and nothing
        // ever wrote the activity doc, so the count was always zero.
        const days = await loadPracticeDays(user.uid, start, end);
        setPracticeDays(days);
        setPracticedDaysCount(days.size);

        // Prefer the stored streak; fall back to counting the run in this
        // month's days for accounts that practised before streaks existed.
        const stored = await readStreak(user.uid);
        setStreak(Math.max(currentStreak(stored, now), streakFromDays(days, now)));
        setStreakOpen(todayStillOpen(stored, now));

        // Bento figures: 15 minutes an analysis, and the best score so far.
        const analyses = await getDocs(query(collection(firestore, 'users', user.uid, 'poseAnalyses'), where('createdAt', '>=', start), where('createdAt', '<=', end)));
        setMinutes(analyses.size * 15);
        let best = 0;
        analyses.forEach(d => { const sc = (d.data() as any).score; if (typeof sc === 'number' && sc > best) best = Math.round(sc); });
        setBestScore(best);
      } catch (err) {
        console.error('Error loading practice data:', err);
      } finally {
        setIsLoadingPracticed(false);
      }
    };
    fetchPractice();
  }, [user]);

  const toggleBookmark = async (id: string) => {
    const next = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(next);
    if (user) {
      try { await createUserProfileDocument(user, { bookmarkedItems: next }); }
      catch (e) { console.error("Failed to save bookmark", e); }
    }
  };

  const openChallenge = (c: PoseChallenge) => {
    if (c.detailLink !== '#') router.push(c.detailLink);
    else toast({ title: c.name, description: "This challenge's guide is coming soon." });
  };

  // Hero panel material — the same solid cover used on the profile.
  const heroBg   = isDark
    ? 'linear-gradient(150deg,#3A2D1E 0%,#2A2320 52%,#1E1A20 100%)'
    : 'linear-gradient(150deg,#5B3A6E 0%,#3E2352 55%,#320E3B 100%)';
  const heroLine = isDark ? 'rgba(193,154,107,0.30)' : 'rgba(255,248,235,0.32)';
  const heroInk  = isDark ? 'rgba(255,240,215,0.96)' : 'rgba(255,248,235,0.97)';

  // The bars behind the dropdown. A week gets a bar a day; a month gets a bar
  // a week, so the labels stay readable on a phone.
  const rangeStats = React.useMemo(() => {
    const now = new Date();
    if (range === 'week') {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const bars = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i);
        const done = practiceDays.has(dayKey(d));
        return { label: format(d, 'EEEEE'), v: done ? 1 : 0, now: dayKey(d) === dayKey(now) };
      });
      return { done: bars.filter(b => b.v > 0).length, of: 7, bars };
    }
    const monthStart = startOfMonth(now);
    const weeks: { label: string; v: number; now: boolean }[] = [];
    for (let w = 0; w < 5; w++) {
      const from = addDays(monthStart, w * 7);
      if (getDate(from) > daysInMonth || (w > 0 && from > endOfMonth(now))) break;
      let hit = 0;
      for (let i = 0; i < 7; i++) {
        const d = addDays(from, i);
        if (d > endOfMonth(now)) break;
        if (practiceDays.has(dayKey(d))) hit++;
      }
      const inThisWeek = now >= from && now < addDays(from, 7);
      weeks.push({ label: 'W' + (w + 1), v: hit / 7, now: inThisWeek });
    }
    return { done: practicedDaysCount, of: daysInMonth, bars: weeks };
  }, [range, practiceDays, practicedDaysCount, daysInMonth]);

  // This week, as ticks, for the streak tile.
  const weekMarks = React.useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      return { label: format(d, 'EEEEE'), done: practiceDays.has(dayKey(d)), today: dayKey(d) === dayKey(now) };
    });
  }, [practiceDays]);
  const visibleChallenges = selectedCategory === 'All' ? poseChallenges : poseChallenges.filter(c => c.category === selectedCategory);
  const planIds = bookmarks.filter(id => planLookup[id]);

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');
        .sy-rail{ -ms-overflow-style:none; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
        .sy-rail::-webkit-scrollbar{ display:none; }`}</style>
      <div style={{ padding: '16px 14px 28px', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <TopBarIcons />

        <header>
          <h1 style={{ fontFamily: FONT_PANCAKE, fontWeight: 600, color: TITLE, textShadow: TITLE_SH, fontSize: 26, margin: 0 }}>
            Yoga Challenges
          </h1>
          <p style={{ color: txt(0.55), fontStyle: 'italic', fontFamily: FONT_PANCAKE, fontSize: 13, margin: '3px 0 0' }}>Build your practice, your way.</p>
          <div style={{ width: 26, height: 1, background: acc(0.22), marginTop: 7 }} />
        </header>

        {/* ── THIS WEEK / THIS MONTH — a chart, with a range behind a dropdown */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, padding: '16px 16px 14px', marginTop: 18, background: heroBg, border: `1px solid ${heroLine}`, boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.48)' : '0 12px 30px rgba(90,80,120,0.18)', color: heroInk }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: -64, right: -50, width: 180, height: 180, borderRadius: '50%', border: `1px dashed ${heroLine}` }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <p style={{ fontSize: 8.5, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.7, margin: 0, fontFamily: FONT_CASUAL }}>Days practised</p>
              <p style={{ fontFamily: FONT_PANCAKE, fontSize: 44, fontWeight: 600, lineHeight: 0.95, letterSpacing: '-1px', margin: '4px 0 0' }}>
                {isLoadingPracticed ? '—' : rangeStats.done}
                <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.7, marginLeft: 5, letterSpacing: 0 }}>of {rangeStats.of}</span>
              </p>
              <p style={{ fontSize: 9.5, opacity: 0.62, margin: '7px 0 0', letterSpacing: '0.04em', fontFamily: FONT_CASUAL }}>
                {rangeStats.done * 15} min · {rangeStats.done} {rangeStats.done === 1 ? 'session' : 'sessions'}
              </p>
            </div>

            <div style={{ position: 'relative', flex: 'none' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setRangeOpen(o => !o); }}
                aria-haspopup="true"
                aria-expanded={rangeOpen}
                style={{ fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 999, padding: '6px 11px', border: `1px solid ${heroLine}`, background: 'rgba(255,255,255,0.10)', display: 'inline-flex', gap: 6, alignItems: 'center', cursor: 'pointer', color: 'inherit', fontFamily: FONT_CASUAL }}
              >
                {range === 'week' ? 'This week' : 'This month'}
                <ChevronDown style={{ width: 11, height: 11, transform: rangeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>
              {rangeOpen && (
                <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 5, minWidth: 128, borderRadius: 14, overflow: 'hidden', border: `1px solid ${heroLine}`, boxShadow: '0 14px 30px rgba(0,0,0,0.45)', background: isDark ? 'rgba(34,29,26,0.98)' : 'rgba(58,33,72,0.98)' }}>
                  {(['week', 'month'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      role="menuitemradio"
                      aria-checked={range === r}
                      onClick={(e) => { e.stopPropagation(); setRange(r); setRangeOpen(false); }}
                      style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', background: 'none', border: 'none', borderTop: r === 'month' ? `1px solid ${heroLine}` : 'none', color: heroInk, cursor: 'pointer', fontFamily: FONT_CASUAL, textAlign: 'left' }}
                    >
                      {r === 'week' ? 'This week' : 'This month'}
                      {/* Rendered only when chosen, so a screen reader doesn't
                          announce a tick against every option. */}
                      <span style={{ fontSize: 11 }}>{range === r ? '✓' : ''}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* One bar a day for a week; one bar a week for a month, because
              thirty bars is unreadable at phone width. */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6, height: 76, marginTop: 14 }}>
            {rangeStats.bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'block', width: '100%', borderRadius: 8, height: Math.max(6, Math.round(b.v * 58)), background: b.v > 0 ? heroInk : 'rgba(255,255,255,0.16)', opacity: b.v > 0 ? 0.9 : 1, boxShadow: b.now ? '0 0 0 3px rgba(255,255,255,0.14)' : 'none', transition: 'height 0.5s ease' }} />
                <span style={{ fontSize: 7.5, opacity: 0.6, letterSpacing: '0.06em', fontFamily: FONT_CASUAL }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTINUE — the page's answer to "what do I do now?" */}
        {(() => {
          const live = poseChallenges.find(c => c.status === 'active' && challengeDays[c.id]);
          const target = live ?? poseChallenges.find(c => c.status !== 'completed') ?? poseChallenges[0];
          const day = live ? challengeDays[live.id] : 0;
          const pct = live && live.totalDays ? Math.round((day / live.totalDays) * 100) : 0;
          return (
            <div
              onClick={() => openChallenge(target)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChallenge(target); } }}
              className="active:scale-[0.98] transition-transform cursor-pointer"
              style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, marginTop: 14, padding: '15px 15px 14px', background: live ? target.grad : (isDark ? 'linear-gradient(150deg,rgba(90,70,110,0.45),rgba(20,17,26,0.8))' : 'linear-gradient(150deg,rgba(110,76,122,0.75),rgba(50,14,59,0.9))'), border: live ? 'none' : `1px dashed ${cardBorder}`, boxShadow: '0 12px 30px rgba(20,14,30,0.35)', color: '#F3EAF2', display: 'flex', gap: 13, alignItems: 'center' }}
            >
              <span style={{ width: 64, height: 64, borderRadius: 20, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, background: 'rgba(255,255,255,0.14)', border: '0.5px solid rgba(255,255,255,0.22)', opacity: live ? 1 : 0.75 }}>{target.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
                  {live ? (
                    <>
                      <span style={{ fontSize: 7.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 999, padding: '3px 8px', background: 'rgba(160,195,130,0.9)', color: '#1c2a12' }}>Active</span>
                      <span style={{ fontSize: 7.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 999, padding: '3px 8px', background: 'rgba(255,255,255,0.18)' }}>Day {day} of {target.totalDays}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 7.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 999, padding: '3px 8px', background: 'rgba(255,255,255,0.18)' }}>Nothing started</span>
                  )}
                </div>
                <h3 style={{ fontFamily: FONT_PANCAKE, fontSize: 19, fontWeight: 600, margin: 0, lineHeight: 1.1 }}>{live ? target.name : 'Start a challenge'}</h3>
                <p style={{ fontSize: 10, opacity: 0.75, margin: '2px 0 7px', fontFamily: FONT_CASUAL }}>
                  {live ? `${target.category} · 15 min today` : `${target.name} · ${target.category} · ${target.totalDays ?? 30} days`}
                </p>
                {live && (
                  <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.20)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: `${pct}%`, borderRadius: 999, background: '#fff', transition: 'width 0.9s ease' }} />
                  </div>
                )}
              </div>
              <span style={{ width: 42, height: 42, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.92)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>
                <Play style={{ width: 15, height: 15, color: '#1a2233', marginLeft: 2 }} fill="#1a2233" />
              </span>
            </div>
          );
        })()}

        {/* ── YOUR NUMBERS — led by the streak */}
        <SectionHead action={<span style={{ fontSize: 10, color: acc(0.5), fontFamily: FONT_CASUAL }}>This month</span>}>Your Numbers</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 10 }}>
          <div style={{ ...sectionCard, borderRadius: 18, padding: '12px 13px 10px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: 'rgba(232,131,106,0.22)' }}>🔥</span>
              <div>
                <p style={{ fontFamily: FONT_PANCAKE, fontSize: 26, fontWeight: 600, lineHeight: 1, color: TITLE, margin: 0 }}>{streak}</p>
                <p style={{ fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: txt(0.45), margin: '1px 0 0', fontFamily: FONT_CASUAL }}>Day streak</p>
              </div>
            </div>
            {/* the week laid out, so the run — and what would break it — is visible */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
              {weekMarks.map((m, i) => (
                <span key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, background: m.done ? 'rgba(232,131,106,0.92)' : (isDark ? 'rgba(255,240,215,0.14)' : 'rgba(50,14,59,0.14)'), color: m.done ? '#2a1208' : 'transparent', boxShadow: m.today ? '0 0 0 2px rgba(232,131,106,0.45)' : 'none' }}>✓</span>
                  <span style={{ fontSize: 7, color: txt(0.45), fontWeight: 700, fontFamily: FONT_CASUAL }}>{m.label}</span>
                </span>
              ))}
            </div>
            <p style={{ fontSize: 8.5, color: txt(0.45), margin: 0, letterSpacing: '0.04em', fontFamily: FONT_CASUAL }}>
              {streakOpen ? 'Practise today to keep it' : 'Logged today — nice one'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10 }}>
            <div style={{ ...sectionCard, borderRadius: 18, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: 'rgba(214,178,130,0.22)' }}>⏱</span>
              <div>
                <p style={{ fontFamily: FONT_PANCAKE, fontSize: 21, fontWeight: 600, lineHeight: 1, color: TITLE, margin: 0 }}>{minutes}</p>
                <p style={{ fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: txt(0.45), margin: '1px 0 0', fontFamily: FONT_CASUAL }}>Minutes</p>
              </div>
            </div>
            <div style={{ ...sectionCard, borderRadius: 18, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: 'rgba(160,195,130,0.20)' }}>⭐</span>
              <div>
                <p style={{ fontFamily: FONT_PANCAKE, fontSize: 21, fontWeight: 600, lineHeight: 1, color: TITLE, margin: 0 }}>{bestScore || '—'}</p>
                <p style={{ fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: txt(0.45), margin: '1px 0 0', fontFamily: FONT_CASUAL }}>Best score</p>
              </div>
            </div>
          </div>
        </div>

        {/* YOUR PLAN */}
        <SectionHead>Your Plan · bookmarked</SectionHead>
        {planIds.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {planIds.map(id => {
              const it = planLookup[id];
              return (
                <div key={id} style={{ borderRadius: 14, overflow: 'hidden', border: `0.5px solid ${acc(0.3)}`, background: isDark ? 'rgba(193,154,107,0.08)' : 'rgba(255,255,255,0.12)', position: 'relative' }}>
                  <BookmarkBtn active onToggle={() => toggleBookmark(id)} />
                  <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontFamily: FONT_PANCAKE, color: 'rgba(255,240,215,0.92)', background: it.grad }}>{it.emoji}</div>
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontFamily: FONT_PANCAKE, fontSize: 12, fontWeight: 600, color: TITLE, lineHeight: 1.1 }}>{it.name}</div>
                    <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: acc(0.7), marginTop: 3 }}>{it.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ borderRadius: 14, border: `0.5px dashed ${acc(0.3)}`, background: isDark ? 'rgba(193,154,107,0.04)' : 'rgba(255,255,255,0.08)', padding: 18, textAlign: 'center', color: acc(0.55), fontSize: 11, fontStyle: 'italic' }}>
            Bookmark a challenge, program or routine to build your plan.
          </div>
        )}

        {/* CHALLENGES */}
        <SectionHead>Challenges</SectionHead>
        {/* Segmented pills — a control, not a row of labels. */}
        <div className='sy-rail' style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {(['All', ...CATEGORIES] as const).map(cat => {
            const on = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={on}
                style={{
                  flex: 'none', borderRadius: 999, padding: '8px 14px', fontSize: 11, whiteSpace: 'nowrap', cursor: 'pointer',
                  fontWeight: 600, fontFamily: FONT_CASUAL, transition: 'all 0.18s ease',
                  border: on ? '1px solid transparent' : '0.5px solid ' + cardBorder,
                  background: on ? (isDark ? 'rgba(214,178,130,0.92)' : '#320E3B') : (isDark ? 'rgba(255,240,215,0.07)' : 'rgba(255,255,255,0.55)'),
                  color: on ? (isDark ? '#2a1e12' : 'rgba(255,248,235,0.96)') : txt(0.66),
                  boxShadow: on ? (isDark ? '0 6px 16px rgba(0,0,0,0.4)' : '0 6px 16px rgba(50,14,59,0.22)') : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          {visibleChallenges.map(c => (
            <div key={c.id} onClick={() => openChallenge(c)} className="active:scale-[0.97] transition-transform" style={{ borderRadius: 18, overflow: 'hidden', border: `0.5px solid ${cardBorder}`, background: card, position: 'relative', cursor: 'pointer', boxShadow: isDark ? '0 10px 24px rgba(0,0,0,0.42)' : '0 10px 24px rgba(90,80,120,0.16)' }}>
              <BookmarkBtn active={bookmarks.includes(c.id)} onToggle={() => toggleBookmark(c.id)} />
              <div style={{ height: 82, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: c.grad }}>
                {c.emoji}
                {/* Status reads at a glance, so started and untouched challenges
                    no longer look identical. */}
                {c.status === 'active' && (
                  <span style={{ position: 'absolute', top: 7, left: 7, fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#1c2a12', background: 'rgba(160,195,130,0.92)', borderRadius: 999, padding: '3px 7px' }}>Active</span>
                )}
                {c.status === 'completed' && (
                  <span style={{ position: 'absolute', top: 7, left: 7, fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#FFF8EB', background: 'rgba(255,255,255,0.22)', borderRadius: 999, padding: '3px 7px' }}>Done</span>
                )}
              </div>
              <div style={{ padding: '9px 10px 10px' }}>
                <div style={{ fontFamily: FONT_PANCAKE, fontSize: 15, fontWeight: 600, color: TITLE, lineHeight: 1.15 }}>{c.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                  <span style={{ fontSize: 7.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: txt(0.45), fontFamily: FONT_CASUAL }}>{c.category}</span>
                  <Stars n={c.difficulty} />
                </div>
                {(() => {
                  const pct = c.status === 'completed' ? 100
                    : (c.status === 'active' && challengeDays[c.id] && c.totalDays)
                      ? Math.round((challengeDays[c.id] / c.totalDays) * 100)
                      : 0;
                  if (!pct) return null;
                  return (
                    <div style={{ height: 3, borderRadius: 999, background: isDark ? 'rgba(255,240,215,0.14)' : 'rgba(50,14,59,0.14)', marginTop: 7, overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${pct}%`, borderRadius: 999, background: acc(0.9), transition: 'width 0.9s ease' }} />
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* PROGRAMS */}
        <SectionHead>Programs · multi-day</SectionHead>
        <div className='sy-rail' style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {programs.map(p => (
            <div key={p.id} style={{ flex: '0 0 118px', borderRadius: 18, border: `0.5px solid ${acc(0.2)}`, background: isDark ? 'linear-gradient(160deg, rgba(193,154,107,0.14), rgba(13,20,30,0.5))' : 'rgba(255,255,255,0.12)', padding: '12px 8px 10px', textAlign: 'center', position: 'relative' }}>
              <BookmarkBtn active={bookmarks.includes(p.id)} onToggle={() => toggleBookmark(p.id)} />
              <div style={{ fontFamily: FONT_PANCAKE, fontSize: 24, fontWeight: 600, color: TITLE, lineHeight: 1 }}>{p.days}</div>
              <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: acc(0.7) }}>day</div>
              <div style={{ fontSize: 10, color: txt(0.8), margin: '6px 0 7px', lineHeight: 1.2 }}>{p.name}</div>
              <ComingSoon />
            </div>
          ))}
        </div>

        {/* QUICK ROUTINES */}
        <SectionHead>Quick Routines</SectionHead>
        <div className='sy-rail' style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {routines.map(r => (
            <div key={r.id} style={{ flex: '0 0 118px', borderRadius: 18, border: `0.5px solid ${acc(0.2)}`, background: card, padding: 12, position: 'relative' }}>
              <BookmarkBtn active={bookmarks.includes(r.id)} onToggle={() => toggleBookmark(r.id)} />
              <div style={{ fontSize: 22 }}>{r.icon}</div>
              <div style={{ fontFamily: FONT_PANCAKE, fontSize: 15, color: TITLE, marginTop: 4 }}>{r.name}</div>
              <div style={{ fontSize: 10, color: acc(0.7), margin: '2px 0 8px' }}>{r.meta}</div>
              <ComingSoon />
            </div>
          ))}
        </div>

        {/* COMMUNITY */}
        <SectionHead>Community</SectionHead>
        {/*
          The reward leads. This used to show three invented friends (Elena /
          Marcus / Anya) above a button, with the $3 hidden inside the dialog —
          so the card promised a friends list the app doesn't have, and buried
          the only reason to tap.
        */}
        <div style={{ ...sectionCard, borderRadius: 20, padding: 18, position: 'relative', overflow: 'hidden' }}>
          {/* orbit motif */}
          <div aria-hidden="true" style={{ position: 'absolute', top: -38, right: -26, width: 130, height: 130, borderRadius: '50%', border: `1px dashed ${acc(0.34)}` }} />

          <p style={{ fontFamily: FONT_PANCAKE, fontSize: 26, fontWeight: 600, lineHeight: 1.1, color: TITLE, margin: 0, position: 'relative' }}>
            <span style={{ color: acc(isDark ? 0.95 : 1) }}>$3</span> for every friend who joins
          </p>
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, lineHeight: 1.5, color: txt(0.66), margin: '7px 0 0', position: 'relative' }}>
            Earn $3 each time a friend signs up with your link — and practise the monthly challenges side by side.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, margin: '15px 0 0', position: 'relative' }}>
            {[
              { key: 'cash',  art: null, icon: <Gift className="h-4 w-4" style={{ color: acc(0.95) }} />,  title: '$3 a friend',                  line: 'Paid when they sign up with your link.' },
              { key: 'pair',  art: null, icon: <Users className="h-4 w-4" style={{ color: acc(0.95) }} />, title: 'Practise together',            line: 'Join the same monthly challenges and compare notes.' },
              { key: 'pouch', art: '/images/collectible_Yoga Bottle.png', icon: null,                      title: 'Unlock the Community Carafe',  line: 'A Rare collectible, earned on your first invite.' },
            ].map(b => (
              <div key={b.key} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: isDark ? 'rgba(255,240,215,0.07)' : 'rgba(255,255,255,0.7)', border: `0.5px solid ${cardBorder}` }}>
                  {b.art
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={b.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : b.icon}
                </span>
                <div>
                  <p style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: txt(0.92), margin: 0, lineHeight: 1.3 }}>{b.title}</p>
                  <p style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: txt(0.62), margin: '2px 0 0', lineHeight: 1.4 }}>{b.line}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, position: 'relative' }}>
            <InviteFriendDialog />
          </div>
        </div>

      </div>
    </AppShell>
  );
}
