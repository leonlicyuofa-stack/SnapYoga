"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, PlusCircle, Crown, Copy, Mail, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// ─── Data ──────────────────────────────────────────────────────────────────
type Category = 'Balancing' | 'Strength' | 'Mobility' | 'Flexibility';
const CATEGORIES: Category[] = ['Balancing', 'Strength', 'Mobility', 'Flexibility'];

interface PoseChallenge {
  id: string; name: string; category: Category; emoji: string; grad: string;
  difficulty: number; status: 'active' | 'upcoming' | 'completed';
  daysInChallenge?: number; totalDays?: number; detailLink: string;
}

const poseChallenges: PoseChallenge[] = [
  { id: 'headstand',  name: 'Headstand',    category: 'Balancing',   emoji: '🧘', grad: 'linear-gradient(160deg,#3a4a63,#1a2233)', difficulty: 4, status: 'active', daysInChallenge: 12, totalDays: 30, detailLink: '/challenges/headstand' },
  { id: 'warrior',    name: 'Warrior III',  category: 'Balancing',   emoji: '🏹', grad: 'linear-gradient(160deg,#3f5560,#16222a)', difficulty: 3, status: 'completed', detailLink: '#' },
  { id: 'crow',       name: 'Crow Pose',    category: 'Strength',    emoji: '🦅', grad: 'linear-gradient(160deg,#5a3a3a,#241414)', difficulty: 3, status: 'upcoming', detailLink: '/challenges/crow' },
  { id: 'plank',      name: 'Plank Flow',   category: 'Strength',    emoji: '💪', grad: 'linear-gradient(160deg,#5a4632,#241b10)', difficulty: 2, status: 'upcoming', detailLink: '#' },
  { id: 'pigeon',     name: 'Pigeon Pose',  category: 'Mobility',    emoji: '🕊️', grad: 'linear-gradient(160deg,#3a5a4a,#142419)', difficulty: 2, status: 'upcoming', detailLink: '#' },
  { id: 'forwardfold',name: 'Forward Fold', category: 'Flexibility', emoji: '🙆', grad: 'linear-gradient(160deg,#4a3a5a,#1c1424)', difficulty: 2, status: 'upcoming', detailLink: '#' },
];

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

const sectionCardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '0.5px solid rgba(193,154,107,0.18)',
  background: 'rgba(13,20,30,0.50)',
  backdropFilter: 'blur(14px)',
};

function SectionHead({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '22px 0 10px' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.6)', fontWeight: 600, fontFamily: FONT_CASUAL }}>{children}</p>
      {action}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return <span style={{ fontSize: 9, color: 'rgba(214,178,130,0.9)', letterSpacing: 1 }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

function ComingSoon() {
  return <span style={{ fontSize: 7.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(214,178,130,0.85)', background: 'rgba(193,154,107,0.14)', border: '0.5px solid rgba(193,154,107,0.25)', borderRadius: 999, padding: '2px 7px' }}>Coming soon</span>;
}

// ─── Invite friend dialog (unchanged behaviour) ─────────────────────────────
function InviteFriendDialog() {
  const { toast } = useToast();
  const { t } = useLanguage();
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full" style={{ border: '0.5px solid rgba(193,154,107,0.30)', background: 'rgba(193,154,107,0.06)', color: 'rgba(214,178,130,0.9)', padding: '8px 18px' }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl bg-black/50 backdrop-blur-lg border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Invite a Friend</DialogTitle>
          <DialogDescription className="text-white/80">
            Share your love for yoga! Invite friends to join you on SnapYoga using any of the options below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center p-3 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-sm font-medium">{t('referralBonusText')}</div>
          <div className="space-y-2">
            <Label htmlFor="invite-link">Copy your invite link</Label>
            <div className="flex space-x-2">
              <Input id="invite-link" value={inviteLink} readOnly className="h-11 rounded-lg text-base bg-black/20 border-white/20" />
              <Button type="button" size="icon" onClick={handleCopyLink} className="rounded-lg bg-white/20 hover:bg-white/30"><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild className="rounded-lg h-11 bg-transparent border-white/20 hover:bg-white/10"><a href={whatsappLink} target="_blank" rel="noopener noreferrer"><Share2 className="mr-2 h-4 w-4" /> WhatsApp</a></Button>
            <Button variant="outline" asChild className="rounded-lg h-11 bg-transparent border-white/20 hover:bg-white/10"><a href={mailtoLink} target="_blank" rel="noopener noreferrer"><Mail className="mr-2 h-4 w-4" /> Email</a></Button>
            <Button variant="outline" onClick={handleInstagramShare} className="rounded-lg h-11 bg-transparent border-white/20 hover:bg-white/10"><Share2 className="mr-2 h-4 w-4" /> Instagram</Button>
            <Button variant="outline" asChild className="rounded-lg h-11 bg-transparent border-white/20 hover:bg-white/10"><a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer"><PinterestIcon className="mr-2 h-4 w-4" /> Pinterest</a></Button>
          </div>
        </div>
        <DialogFooter>
          <p className="text-xs text-white/70 text-center w-full">Sharing is caring! Grow your yoga community.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bookmark button ─────────────────────────────────────────────────────────
function BookmarkBtn({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-label={active ? 'Remove from your plan' : 'Add to your plan'}
      style={{ position: 'absolute', top: 7, right: 7, width: 24, height: 24, borderRadius: '50%', background: 'rgba(13,20,30,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', zIndex: 2 }}
    >
      <Bookmark className="h-3.5 w-3.5" style={{ color: 'rgba(214,178,130,0.95)', fill: active ? 'rgba(214,178,130,0.95)' : 'none' }} />
    </button>
  );
}

export default function ChallengesPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const friends = [
    { id: '1', name: 'Elena' },
    { id: '2', name: 'Marcus' },
    { id: '3', name: 'Anya' },
  ];

  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const [practicedDaysCount, setPracticedDaysCount] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState(30);
  const [isLoadingPracticed, setIsLoadingPracticed] = useState(true);

  // Hydrate bookmarks from the user profile.
  useEffect(() => {
    const saved = (profile as any)?.bookmarkedItems;
    if (Array.isArray(saved)) setBookmarks(saved);
  }, [profile]);

  // Days-practiced tracker (activity ∩ analyses ∩ challenge tasks).
  useEffect(() => {
    if (!user) return;
    const fetchPracticedDays = async () => {
      setIsLoadingPracticed(true);
      try {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        setDaysInMonth(getDaysInMonth(now));

        const activitySnap = await getDocs(query(collection(firestore, `users/${user.uid}/activity`), where('__name__', '>=', format(start, 'yyyy-MM-dd')), where('__name__', '<=', format(end, 'yyyy-MM-dd'))));
        const activityDates = new Set(activitySnap.docs.map(d => d.id));

        const analysesSnap = await getDocs(query(collection(firestore, `users/${user.uid}/poseAnalyses`), where('createdAt', '>=', start), where('createdAt', '<=', end)));
        const analysesDates = new Set(analysesSnap.docs.map(d => { const data = d.data(); return data.createdAt ? format(data.createdAt.toDate(), 'yyyy-MM-dd') : null; }).filter(Boolean));

        const tasksSnap = await getDocs(query(collection(firestore, `users/${user.uid}/challengeTasks`), where('__name__', '>=', format(start, 'yyyy-MM-dd')), where('__name__', '<=', format(end, 'yyyy-MM-dd') + '')));
        const tasksDates = new Set(tasksSnap.docs.map(d => d.id.split('_')[0]));

        let count = 0;
        for (let i = 1; i <= now.getDate(); i++) {
          const dateStr = format(new Date(now.getFullYear(), now.getMonth(), i), 'yyyy-MM-dd');
          if (activityDates.has(dateStr) && analysesDates.has(dateStr) && tasksDates.has(dateStr)) count++;
        }
        setPracticedDaysCount(count);
      } catch (err) {
        console.error("Error calculating practiced days:", err);
      } finally {
        setIsLoadingPracticed(false);
      }
    };
    fetchPracticedDays();
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

  const visibleChallenges = selectedCategory === 'All' ? poseChallenges : poseChallenges.filter(c => c.category === selectedCategory);
  const planIds = bookmarks.filter(id => planLookup[id]);

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div style={{ padding: '18px 14px 28px', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <header>
          <h1 style={{ fontFamily: FONT_PANCAKE, fontWeight: 600, color: 'rgba(255,240,215,0.94)', fontSize: 26, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Crown className="h-6 w-6" style={{ color: 'rgba(193,154,107,0.85)' }} /> Yoga Challenges
          </h1>
          <p style={{ color: 'rgba(255,240,215,0.4)', fontStyle: 'italic', fontFamily: FONT_PANCAKE, fontSize: 13, margin: '3px 0 0' }}>Build your practice, your way.</p>
          <div style={{ width: 26, height: 1, background: 'rgba(193,154,107,0.22)', marginTop: 7 }} />
        </header>

        {/* THIS MONTH'S PRACTICE (reward removed) */}
        <div style={{ ...sectionCardStyle, borderRadius: '20px 10px 20px 20px', padding: '14px 16px', marginTop: 18 }}>
          <span style={{ fontFamily: FONT_PANCAKE, fontSize: 34, fontWeight: 600, color: 'rgba(255,240,215,0.94)' }}>{isLoadingPracticed ? '—' : practicedDaysCount}</span>
          <span style={{ fontFamily: FONT_PANCAKE, fontSize: 18, color: 'rgba(193,154,107,0.7)' }}> / {daysInMonth}</span>
          <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(193,154,107,0.6)', fontWeight: 600, marginTop: 2, fontFamily: FONT_CASUAL }}>days practiced</div>
          <div style={{ height: 10, background: 'rgba(255,240,215,0.08)', borderRadius: 6, overflow: 'hidden', marginTop: 10 }}>
            <div style={{ height: '100%', width: `${(practicedDaysCount / daysInMonth) * 100}%`, background: 'linear-gradient(90deg, rgba(193,154,107,0.7), rgba(210,180,110,0.95))', borderRadius: 6, transition: 'width 1.2s ease' }} />
          </div>
          <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,240,215,0.5)', marginTop: 8, fontFamily: FONT_PANCAKE }}>Practice daily to fill your month.</p>
        </div>

        {/* YOUR PLAN */}
        <SectionHead>Your Plan · bookmarked</SectionHead>
        {planIds.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {planIds.map(id => {
              const it = planLookup[id];
              return (
                <div key={id} style={{ borderRadius: 14, overflow: 'hidden', border: '0.5px solid rgba(214,178,130,0.3)', background: 'rgba(193,154,107,0.08)', position: 'relative' }}>
                  <BookmarkBtn active onToggle={() => toggleBookmark(id)} />
                  <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontFamily: FONT_PANCAKE, color: 'rgba(255,240,215,0.92)', background: it.grad }}>{it.emoji}</div>
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontFamily: FONT_PANCAKE, fontSize: 12, fontWeight: 600, color: 'rgba(255,240,215,0.92)', lineHeight: 1.1 }}>{it.name}</div>
                    <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(193,154,107,0.7)', marginTop: 3 }}>{it.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ borderRadius: 14, border: '0.5px dashed rgba(193,154,107,0.3)', background: 'rgba(193,154,107,0.04)', padding: 18, textAlign: 'center', color: 'rgba(193,154,107,0.55)', fontSize: 11, fontStyle: 'italic' }}>
            Bookmark a challenge, program or routine to build your plan.
          </div>
        )}

        {/* CHALLENGES */}
        <SectionHead>Challenges</SectionHead>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['All', ...CATEGORIES] as const).map(cat => {
            const on = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  borderRadius: 999, padding: '6px 14px', fontSize: 11, whiteSpace: 'nowrap', cursor: 'pointer',
                  border: `0.5px solid ${on ? 'rgba(214,178,130,0.85)' : 'rgba(193,154,107,0.28)'}`,
                  background: on ? 'linear-gradient(180deg, rgba(214,178,130,0.92), rgba(193,154,107,0.78))' : 'rgba(193,154,107,0.05)',
                  color: on ? '#2a1e12' : 'rgba(255,240,215,0.7)', fontWeight: on ? 600 : 400, fontFamily: FONT_CASUAL,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          {visibleChallenges.map(c => (
            <div key={c.id} onClick={() => openChallenge(c)} style={{ borderRadius: 14, overflow: 'hidden', border: '0.5px solid rgba(193,154,107,0.18)', background: 'rgba(13,20,30,0.5)', position: 'relative', cursor: 'pointer' }}>
              <BookmarkBtn active={bookmarks.includes(c.id)} onToggle={() => toggleBookmark(c.id)} />
              <div style={{ height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, background: c.grad }}>
                {c.emoji}
                {c.status === 'active' && c.daysInChallenge && (
                  <span style={{ position: 'absolute', bottom: 7, left: 7, fontSize: 8, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,240,215,0.9)', background: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: '2px 7px' }}>Day {c.daysInChallenge}/{c.totalDays}</span>
                )}
                {c.status === 'completed' && (
                  <span style={{ position: 'absolute', bottom: 7, left: 7, fontSize: 8, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(160,195,130,0.95)', background: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: '2px 7px' }}>Completed</span>
                )}
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontFamily: FONT_PANCAKE, fontSize: 14, fontWeight: 600, color: 'rgba(255,240,215,0.92)', lineHeight: 1.1 }}>{c.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                  <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(193,154,107,0.7)' }}>{c.category}</span>
                  <Stars n={c.difficulty} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PROGRAMS */}
        <SectionHead>Programs · multi-day</SectionHead>
        <div style={{ display: 'flex', gap: 10 }}>
          {programs.map(p => (
            <div key={p.id} style={{ flex: 1, borderRadius: 14, border: '0.5px solid rgba(193,154,107,0.2)', background: 'linear-gradient(160deg, rgba(193,154,107,0.14), rgba(13,20,30,0.5))', padding: '12px 8px 10px', textAlign: 'center', position: 'relative' }}>
              <BookmarkBtn active={bookmarks.includes(p.id)} onToggle={() => toggleBookmark(p.id)} />
              <div style={{ fontFamily: FONT_PANCAKE, fontSize: 24, fontWeight: 600, color: 'rgba(255,240,215,0.94)', lineHeight: 1 }}>{p.days}</div>
              <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(193,154,107,0.7)' }}>day</div>
              <div style={{ fontSize: 10, color: 'rgba(255,240,215,0.8)', margin: '6px 0 7px', lineHeight: 1.2 }}>{p.name}</div>
              <ComingSoon />
            </div>
          ))}
        </div>

        {/* QUICK ROUTINES */}
        <SectionHead>Quick Routines</SectionHead>
        <div style={{ display: 'flex', gap: 10 }}>
          {routines.map(r => (
            <div key={r.id} style={{ flex: 1, borderRadius: 14, border: '0.5px solid rgba(193,154,107,0.2)', background: 'rgba(13,20,30,0.5)', padding: 12, position: 'relative' }}>
              <BookmarkBtn active={bookmarks.includes(r.id)} onToggle={() => toggleBookmark(r.id)} />
              <div style={{ fontSize: 22 }}>{r.icon}</div>
              <div style={{ fontFamily: FONT_PANCAKE, fontSize: 15, color: 'rgba(255,240,215,0.92)', marginTop: 4 }}>{r.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(193,154,107,0.7)', margin: '2px 0 8px' }}>{r.meta}</div>
              <ComingSoon />
            </div>
          ))}
        </div>

        {/* COMMUNITY */}
        <SectionHead>Community</SectionHead>
        <div style={{ ...sectionCardStyle, borderRadius: 18, padding: 18, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_PANCAKE, fontSize: 18, fontWeight: 600, color: 'rgba(255,240,215,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Users className="h-5 w-5" style={{ color: 'rgba(193,154,107,0.8)' }} /> {t('challengesWithFriendsTitle')}
          </div>
          <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,240,215,0.5)', margin: '4px 0 12px' }}>{t('challengesWithFriendsDesc')}</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            {friends.map((f, i) => (
              <Avatar key={f.id} style={{ width: 40, height: 40, border: '3px solid #11121d', marginLeft: i === 0 ? 0 : -10 }}>
                <AvatarFallback style={{ background: 'rgba(193,154,107,0.2)', color: 'rgba(214,178,130,0.9)', fontSize: 13 }}>{f.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <InviteFriendDialog />
        </div>

      </div>
    </AppShell>
  );
}
