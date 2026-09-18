
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Share2, Copy, MessageSquare, Sun, Moon, Pencil, KeyRound, Star, Crown, LogOut, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { firestore } from '@/lib/firebase/clientApp';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { cn } from '@/lib/utils';
import { MoonPhaseRingLoader } from '@/components/layout/moon-phase-ring-loader';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfDay, startOfWeek, isToday, isYesterday, differenceInDays } from 'date-fns';
import { TierBadge } from '@/components/ui/tier-badge';
import { GlossyButton } from '@/components/ui/glossy-button';
import { allCollectibles } from '@/components/features/dashboard/rock-data';

const usernameChangeSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }).max(30, { message: "Username cannot be longer than 30 characters" }),
});

type UsernameChangeFormValues = z.infer<typeof usernameChangeSchema>;

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

// The pose interests saved at onboarding, with the illustration for each and the
// challenge category a tile opens.
const POSE_INTERESTS: Record<string, { label: string; image: string; category: string }> = {
  'dynamic-flow':         { label: 'Dynamic Flow',           image: '/images/dynamic_flow.png',        category: 'Mobility' },
  'structural-alignment': { label: 'Structural Alignment',   image: '/images/structural_alignment.png', category: 'Strength' },
  'inversions-balancing': { label: 'Inversions & Balancing', image: '/images/arm_balancing.png',        category: 'Balancing' },
  'backbend':             { label: 'Backbend',               image: '/images/backbend_alignment.png',   category: 'Flexibility' },
};

// Earned collectibles — placeholder, matching the collection page, until
// earning is recorded against the account.
const PROFILE_COLLECTED = ['welcome_mat', 'first_analysis_block', 'join_challenge_strap'];

export default function ProfilePage() {
  const { user, profile, updateUserPassword, updateUserDisplayName, signOutUser, loading: authLoading, membershipTier, isGold } = useAuth();
  // Prefer the live Firestore photoURL (updates instantly after an avatar save)
  // over the auth user's, which isn't refreshed until the next auth state change.
  const avatarUrl = profile?.photoURL || user?.photoURL;
  const displayNameResolved = profile?.displayName || user?.displayName;
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/auth/signin');
  };
  // Light = amethyst on lavender; dark = the original cream/gold on ink.
  const txt = (a: number) => isDark ? `rgba(255,240,215,${a})` : `rgba(50,14,59,${a})`;
  const acc = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  // Shared card cosmetic — the same frosted gradient the homepage/dashboard cards use,
  // so My Progress, Weekly Commitment and Account all read identically.
  const card = isDark
    ? 'linear-gradient(160deg,rgba(255,240,215,0.10),rgba(255,240,215,0.03))'
    : 'linear-gradient(160deg,rgba(255,255,255,0.32),rgba(255,255,255,0.14))';
  const cardBorder = isDark ? 'rgba(193,154,107,0.18)' : 'rgba(255,255,255,0.40)';
  const cardShadow = isDark ? '0 8px 22px rgba(0,0,0,0.45)' : '0 8px 22px rgba(90,80,120,0.16)';
  const cardHi = isDark ? 'rgba(255,240,215,0.10)' : 'rgba(255,255,255,0.60)';
  // Cover plane — gold hairlines on dark, cream on the amethyst cover in light.
  const coverLine = isDark ? 'rgba(193,154,107,0.30)' : 'rgba(255,248,235,0.32)';
  const coverInk  = isDark ? 'rgba(255,240,215,0.96)' : 'rgba(255,248,235,0.97)';
  const NAME_C = isDark ? 'rgba(255,240,215,0.94)' : 'rgba(255,248,235,0.96)';
  const NAME_SH = isDark ? 'none' : '0 1px 3px rgba(70,60,80,0.32)';
  // Account card shares the same frosted-gradient surface as the other cards.
  const panelBg = card;
  const panelBorder = cardBorder;
  const panelTitle = isDark ? 'rgba(255,240,215,0.70)' : 'rgba(50,14,59,0.70)';
  const panelSub = isDark ? 'rgba(255,240,215,0.32)' : 'rgba(50,14,59,0.60)';
  const panelIcon = isDark ? 'rgba(193,154,107,0.75)' : 'rgba(50,14,59,0.70)';
  const panelChevron = isDark ? 'rgba(193,154,107,0.50)' : 'rgba(50,14,59,0.40)';
  const panelDivider = isDark ? 'rgba(193,154,107,0.10)' : 'rgba(50,14,59,0.10)';
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isUsernameSubmitting, setIsUsernameSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  // Expanded section state
  const [expandedSection, setExpandedSection] = useState<'username' | 'subscription' | 'security' | 'invite' | null>(null);

  // Progress States
  const [practicePercent, setPracticePercent] = useState(0);
  const [moodPercent, setMoodPercent] = useState(0);
  const [habitsPercent, setHabitsPercent] = useState(0);
  const [recentPractices, setRecentPractices] = useState<any[]>([]);
  const [commitmentDays, setCommitmentDays] = useState<number>(5);
  // Raw figures behind the rings — tapping a ring flips the percentage to these.
  const [practiceRaw, setPracticeRaw] = useState('—');
  const [moodRaw,     setMoodRaw]     = useState('—');
  const [habitsRaw,   setHabitsRaw]   = useState('—');
  const [interests,   setInterests]   = useState<string[]>([]);
  const [flipped,     setFlipped]     = useState<Record<string, boolean>>({});
  const coverRef = useRef<HTMLDivElement | null>(null);

  // The cover drifts at about half the page's speed, so the card reads as
  // floating in front of it rather than printed on it.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onScroll = () => {
      if (coverRef.current) coverRef.current.style.transform = `translateY(${window.scrollY * 0.45}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { 
    register: registerUsername, 
    handleSubmit: handleSubmitUsername, 
    formState: { errors: usernameErrors },
    setValue: setUsernameValue,
  } = useForm<UsernameChangeFormValues>({
    resolver: zodResolver(usernameChangeSchema),
  });

  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(window.location.origin);
    }
    if (user?.displayName) {
      setUsernameValue('username', user.displayName);
    }
    if (user) {
      // Fetch Progress & Practices Data
      const fetchProgress = async () => {
        const now = new Date();
        const sevenDaysAgo = subDays(now, 7);
        const startOfSevenDaysAgo = startOfDay(sevenDaysAgo);

        // 0. Weekly commitment → exercise goal (hours per week)
        let days = 5;
        const profileSnap = await getDoc(doc(firestore, 'users', user.uid));
        if (profileSnap.exists() && typeof profileSnap.data().commitmentDays === 'number') {
          days = profileSnap.data().commitmentDays;
          setCommitmentDays(days);
        }
        if (profileSnap.exists() && Array.isArray(profileSnap.data().interestedPoses)) {
          setInterests(profileSnap.data().interestedPoses as string[]);
        }

        // 1. Practice — this week's hours vs the weekly goal
        const analysesRef = collection(firestore, 'users', user.uid, 'poseAnalyses');
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekAnalysesSnap = await getDocs(query(analysesRef, where('createdAt', '>=', weekStart)));
        const weeklyExerciseHrs = (weekAnalysesSnap.size * 15) / 60;
        setPracticePercent(Math.min(Math.round((weeklyExerciseHrs / days) * 100), 100));
        setPracticeRaw(`${Math.round(weeklyExerciseHrs * 10) / 10} of ${days} hrs`);

        // 2. Recent Practices
        const practicesQuery = query(analysesRef, orderBy('createdAt', 'desc'), limit(5));
        const practicesSnap = await getDocs(practicesQuery);
        setRecentPractices(practicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 3. Mood (Last 7 days)
        const moodsRef = collection(firestore, 'users', user.uid, 'moods');
        const moodsQuery = query(moodsRef, where('loggedAt', '>=', startOfSevenDaysAgo));
        const moodsSnap = await getDocs(moodsQuery);
        setMoodPercent(Math.min(Math.round((moodsSnap.size / 7) * 100), 100));
        setMoodRaw(`${moodsSnap.size} of 7 days`);

        // 4. Habits (Last 7 days)
        const habitsRef = collection(firestore, 'users', user.uid, 'habits');
        const habitsQuery = query(habitsRef, where('date', '>=', format(sevenDaysAgo, 'yyyy-MM-dd')));
        const habitsSnap = await getDocs(habitsQuery);
        let totalCompleted = 0;
        habitsSnap.forEach(doc => {
          totalCompleted += (doc.data().completed || []).length;
        });
        setHabitsPercent(Math.min(Math.round((totalCompleted / (5 * 7)) * 100), 100));
        setHabitsRaw(`${totalCompleted} of 35`);
      };

      fetchProgress();
    }
  }, [user, setUsernameValue]);

  const onUsernameSubmit: SubmitHandler<UsernameChangeFormValues> = async (data) => {
    setIsUsernameSubmitting(true);
    const success = await updateUserDisplayName(data.username);
    if (success) {
      setExpandedSection(null);
    }
    setIsUsernameSubmitting(false);
  };

  const onPasswordSubmit: SubmitHandler<PasswordChangeFormValues> = async (data) => {
    setIsPasswordSubmitting(true);
    const success = await updateUserPassword(data.currentPassword, data.newPassword);
    if (success) {
      resetPasswordForm();
      setExpandedSection(null);
    }
    setIsPasswordSubmitting(false);
  };
  
  const handleSetCommitment = async (days: number) => {
    setCommitmentDays(days);
    if (!user) return;
    try {
      await createUserProfileDocument(user, { commitmentDays: days });
      toast({ title: "Goal updated", description: `Weekly exercise goal set to ${days}h (${days} days/week).` });
    } catch (e) {
      console.error("Error saving commitment:", e);
      toast({ title: "Error", description: "Could not save your commitment.", variant: "destructive" });
    }
  };

  const handleCopyInviteLink = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({ title: "Link Copied!", description: "Invite link copied to your clipboard." });
        });
    }
  };

  const handleInstagramShare = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        toast({ title: "Link Copied for Instagram!", description: "Paste this link in your Instagram bio or stories." });
      });
    }
  };

  const getOffset = (pct: number) => 150.8 - (150.8 * pct / 100);

  const formatPracticeDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    const diff = differenceInDays(new Date(), date);
    return `${diff} days ago`;
  };
  
  if (authLoading && !user) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><MoonPhaseRingLoader /></div></AppShell>;
  }

  const whatsappShareUrl = inviteLink ? `whatsapp://send?text=${encodeURIComponent('Check out SnapYoga: ' + inviteLink)}` : '#';
  const pinterestShareUrl = inviteLink ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(inviteLink)}&media=${encodeURIComponent('https://placehold.co/600x400.png')}&description=Check out SnapYoga` : '#';

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');
        .sy-rail{ -ms-overflow-style:none; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
        .sy-rail::-webkit-scrollbar{ display:none; }`}</style>
      <div className="relative min-h-[calc(100vh-4rem)]">
        <div className="relative z-10 flex flex-col h-full">
            
            {/*
              PROFILE HERO — three planes, not one. The cover sits behind, the
              identity card in front of it, and the avatar bridges the two by
              breaking out of the card's top edge. That overlap is what stops
              the page reading as flat.
            */}
            <header style={{ position: 'relative' }}>
              {/* plane 1 — the cover */}
              <div
                ref={coverRef}
                aria-hidden="true"
                style={{
                  // Anchored 160px above its slot and that much taller, so the
                  // parallax drift can never expose the page behind it.
                  position: 'absolute', top: -160, left: 0, right: 0, height: 338, overflow: 'hidden', willChange: 'transform',
                  background: isDark
                    ? 'linear-gradient(150deg,#3A2D1E 0%,#2A2320 52%,#1E1A20 100%)'
                    : 'linear-gradient(150deg,#5B3A6E 0%,#3E2352 55%,#320E3B 100%)',
                }}
              >
                {/* the visible 178px, where the motif and the foot fade live */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 178 }}>
                  <div style={{ position: 'absolute', top: -56, right: -40, width: 180, height: 180, borderRadius: '50%', border: `1px dashed ${coverLine}` }}>
                    <span style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: coverInk, opacity: 0.85 }} />
                  </div>
                  <div style={{ position: 'absolute', top: -26, right: -8, width: 112, height: 112, borderRadius: '50%', border: `1px solid ${coverLine}`, opacity: 0.5 }} />
                  <div style={{ position: 'absolute', bottom: -70, left: -46, width: 150, height: 150, borderRadius: '50%', border: `1px solid ${coverLine}`, opacity: 0.35 }} />
                  {/* the cover fades out at its foot so it never ends on a hard line */}
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 62%, ${isDark ? 'rgba(13,24,33,0.85)' : 'rgba(223,214,239,0.75)'} 100%)` }} />
                </div>
              </div>

              {/* plane 2 — the identity card, lifted off the cover */}
              <div style={{ position: 'relative', padding: '104px 14px 0' }}>
                <div style={{
                  position: 'relative',
                  borderRadius: 22,
                  background: isDark
                    ? 'linear-gradient(160deg,rgba(38,33,30,0.96),rgba(22,19,24,0.96))'
                    : 'linear-gradient(160deg,rgba(255,253,250,0.98),rgba(246,241,252,0.98))',
                  border: `1px solid ${isDark ? 'rgba(193,154,107,0.20)' : 'rgba(255,255,255,0.70)'}`,
                  boxShadow: isDark ? '0 18px 40px rgba(0,0,0,0.55)' : '0 18px 40px rgba(60,40,80,0.22)',
                  padding: '52px 16px 0',
                  textAlign: 'center',
                }}>
                  {/* plane 3 — the avatar, breaking the card's edge */}
                  <div style={{ position: 'absolute', top: -46, left: '50%', transform: 'translateX(-50%)' }}>
                    <div style={{
                      position: 'relative', width: 92, height: 92, borderRadius: '50%', overflow: 'visible',
                      border: `3px solid ${isDark ? '#241F26' : '#FFFDFA'}`,
                      boxShadow: isDark
                        ? '0 10px 24px rgba(0,0,0,0.55), 0 0 0 4px rgba(193,154,107,0.22)'
                        : '0 10px 24px rgba(60,40,80,0.30), 0 0 0 4px rgba(255,255,255,0.55)',
                      background: isDark ? 'linear-gradient(160deg,#4A3A22,#241C16)' : '#4A2E6B',
                    }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={displayNameResolved || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: 36, color: 'rgba(255,248,235,0.92)', fontFamily: "'Cormorant Garamond', serif" }}>
                            {(displayNameResolved?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <a
                        href="/onboarding/gender-profile?edit=1"
                        aria-label="Edit your character"
                        style={{
                          position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isDark ? 'rgba(214,178,130,0.95)' : '#FBF4E6',
                          border: `2px solid ${isDark ? '#241F26' : '#FFFDFA'}`,
                        }}
                      >
                        <Pencil style={{ width: 12, height: 12, color: isDark ? '#1a1210' : '#320E3B' }} />
                      </a>
                    </div>
                  </div>

                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 600, color: txt(0.94), margin: 0 }}>
                    {displayNameResolved || user?.email?.split('@')[0] || 'Yogi'}
                  </h2>
                  {/* A brand line, the same for everyone — deliberately not editable. */}
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 12.5, color: txt(0.62), margin: '3px 0 0', padding: '0 18px' }}>
                    &ldquo;Move with your breath, rest with the moon.&rdquo;
                  </p>

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
                    <span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: isDark ? 'rgba(214,178,130,0.95)' : '#E8C98A', color: '#2a1e12' }}>
                      {isGold ? 'Gold' : 'Trial'}
                    </span>
                    <span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999, border: `0.5px solid ${cardBorder}`, background: isDark ? 'rgba(255,240,215,0.07)' : 'rgba(50,14,59,0.05)', color: txt(0.66) }}>
                      🔥 7-day streak
                    </span>
                  </div>

                  {/* the divided action strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 16, borderTop: `1px solid ${cardBorder}` }}>
                    {[
                      { href: '/snap-yoga',             Icon: Star,   n: recentPractices.length, w: 'Practices' },
                      { href: '/practice-calendar',     Icon: MessageSquare, n: commitmentDays,  w: 'Days/week' },
                      { href: '/yoga-collection',       Icon: Share2, n: 3,                      w: 'Collected' },
                    ].map((a, i) => {
                      const A = a.Icon;
                      return (
                        <Link
                          key={a.w}
                          href={a.href}
                          className="active:opacity-70 transition-opacity"
                          style={{ padding: '13px 4px 14px', textAlign: 'center', textDecoration: 'none', borderLeft: i === 0 ? 'none' : `1px solid ${cardBorder}` }}
                        >
                          <A style={{ width: 19, height: 19, color: acc(isDark ? 0.9 : 0.75), margin: '0 auto' }} />
                          <b style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: txt(0.92), marginTop: 4, lineHeight: 1 }}>{a.n}</b>
                          <span style={{ display: 'block', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: txt(0.44), marginTop: 4 }}>{a.w}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-grow container mx-auto px-4 mt-4">
              <div className="max-w-2xl mx-auto space-y-8 w-full pb-12">
                  
                  {/* MY PROGRESS — each ring is a button: tap to swap the
                      percentage for the figure behind it. */}
                  <div className="space-y-1">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: isDark ? 'rgba(193,154,107,0.55)' : '#320E3B' }}>My Progress</p>
                        <span style={{ fontSize: 11, color: acc(0.40) }}>Tap a ring</span>
                      </div>
                      <div style={{
                        borderRadius: 20,
                        border: `0.5px solid ${cardBorder}`,
                        background: card,
                        padding: '14px 16px',
                        backdropFilter: 'blur(14px)',
                        boxShadow: `${cardShadow}, inset 0 1px 0 ${cardHi}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                          {[
                            { id: 'practice', pct: practicePercent, raw: practiceRaw, label: 'Practice', color: acc(0.85) },
                            { id: 'mood',     pct: moodPercent,     raw: moodRaw,     label: 'Mood',     color: isDark ? 'rgba(160,195,130,0.85)' : 'rgba(59,109,17,0.90)' },
                            { id: 'habits',   pct: habitsPercent,   raw: habitsRaw,   label: 'Habits',   color: isDark ? 'rgba(200,140,90,0.85)' : 'rgba(168,83,28,0.90)' },
                          ].map(r => {
                            const on = !!flipped[r.id];
                            return (
                              <button
                                key={r.id}
                                type="button"
                                aria-pressed={on}
                                aria-label={`${r.label}: ${r.pct}%${r.raw === '—' ? '' : ` — ${r.raw}`}`}
                                // Nothing to flip to until the figures have loaded.
                                disabled={r.raw === '—'}
                                onClick={() => setFlipped(f => ({ ...f, [r.id]: !f[r.id] }))}
                                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: r.raw === '—' ? 'default' : 'pointer' }}
                              >
                                <span style={{ position: 'relative', width: 58, height: 58 }}>
                                  <svg width="58" height="58" viewBox="0 0 58 58">
                                    <circle cx="29" cy="29" r="24" fill="none" stroke={isDark ? 'rgba(255,240,215,0.07)' : 'rgba(50,14,59,0.10)'} strokeWidth="5"/>
                                    <circle cx="29" cy="29" r="24" fill="none" stroke={r.color} strokeWidth="5"
                                      strokeDasharray="150.8" strokeDashoffset={getOffset(r.pct)} strokeLinecap="round"
                                      transform="rotate(-90 29 29)" style={{ transition: 'stroke-dashoffset 0.9s ease' }}/>
                                  </svg>
                                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontWeight: 700, color: txt(0.92), opacity: on ? 0 : 1, transform: on ? 'scale(0.82)' : 'none', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
                                    {r.pct}%
                                  </span>
                                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.1, fontSize: 9, fontWeight: 600, color: txt(0.92), padding: '0 6px', opacity: on ? 1 : 0, transform: on ? 'none' : 'scale(0.82)', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
                                    {r.raw}
                                  </span>
                                </span>
                                <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: r.color }}>{r.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                  </div>

                  {/* WHAT I PRACTISE — the pose interests chosen at onboarding,
                      as picture tiles. Each one opens Challenges filtered to the
                      matching category. */}
                  <div className="space-y-1">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: isDark ? 'rgba(193,154,107,0.55)' : '#320E3B' }}>What I Practise</p>
                        <Link href="/onboarding/yoga-type?edit=1" style={{ fontSize: 11, color: acc(0.40), textDecoration: 'none' }}>Edit ›</Link>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
                        {interests.map(id => {
                          const p = POSE_INTERESTS[id];
                          if (!p) return null;
                          return (
                            <Link
                              key={id}
                              href={`/challenges?category=${p.category}`}
                              className="active:scale-95 transition-transform"
                              style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '1 / 1.18', display: 'block', textDecoration: 'none', border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.10)' }} />
                              <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24,14,30,0.86) 0%, rgba(24,14,30,0.22) 46%, transparent 72%)' }} />
                              <span style={{ position: 'absolute', left: 8, right: 8, bottom: 8, fontSize: 10.5, fontWeight: 600, color: '#FFF8EB', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{p.label}</span>
                            </Link>
                          );
                        })}
                        {/* A dashed slot when the row would otherwise look thin. */}
                        {interests.filter(id => POSE_INTERESTS[id]).length < 3 && (
                          <Link
                            href="/onboarding/yoga-type?edit=1"
                            aria-label="Add another pose interest"
                            className="active:scale-95 transition-transform"
                            style={{ borderRadius: 18, aspectRatio: '1 / 1.18', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${cardBorder}`, background: isDark ? 'rgba(255,240,215,0.05)' : 'rgba(50,14,59,0.04)', textDecoration: 'none' }}
                          >
                            <Plus style={{ width: 20, height: 20, color: acc(0.7) }} />
                          </Link>
                        )}
                      </div>
                  </div>

                  {/* COLLECTION — round, tactile, and the page's reward moment */}
                  <div className="space-y-1">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: isDark ? 'rgba(193,154,107,0.55)' : '#320E3B' }}>
                          Collection · {PROFILE_COLLECTED.length} of {allCollectibles.length}
                        </p>
                        <Link href="/yoga-collection" style={{ fontSize: 11, color: acc(0.40), textDecoration: 'none' }}>See all ›</Link>
                      </div>
                      <div className="sy-rail" style={{ display: 'flex', gap: 11, overflowX: 'auto', paddingBottom: 6 }}>
                        {allCollectibles.map(c => {
                          const got = PROFILE_COLLECTED.includes(c.id);
                          return (
                            <Link key={c.id} href="/yoga-collection" className="active:scale-95 transition-transform" style={{ flex: '0 0 66px', textAlign: 'center', textDecoration: 'none' }}>
                              <span style={{ display: 'block', width: 66, height: 66, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${cardBorder}`, background: isDark ? 'rgba(255,240,215,0.07)' : 'rgba(255,255,255,0.6)', boxShadow: cardShadow }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={c.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: got ? 'none' : 'grayscale(1)', opacity: got ? 1 : 0.4 }} />
                              </span>
                              <span style={{ display: 'block', fontSize: 9.5, color: txt(0.66), margin: '6px 0 0', lineHeight: 1.2 }}>{c.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                  </div>

                  {/* WEEKLY COMMITMENT — sets the exercise goal (days × 24h) */}
                  <div className="space-y-1">
                      <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: isDark ? 'rgba(193,154,107,0.55)' : '#320E3B', marginBottom: 6 }}>Weekly Commitment</p>
                      <div style={{ borderRadius: 20, border: `0.5px solid ${cardBorder}`, background: card, padding: '14px 16px', backdropFilter: 'blur(14px)', boxShadow: `${cardShadow}, inset 0 1px 0 ${cardHi}` }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? txt(0.90) : 'rgba(255,248,235,0.97)', fontFamily: "'Cormorant Garamond', serif", margin: 0 }}>How many days a week will you commit?</p>
                        <p style={{ fontSize: 11, color: txt(0.40), margin: '2px 0 0' }}>We'll set your exercise goal from this.</p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                          {[1,2,3,4,5,6,7].map(d => {
                            const sel = commitmentDays === d;
                            return (
                              <button
                                key={d}
                                onClick={() => handleSetCommitment(d)}
                                style={{
                                  flex: 1, height: 36, borderRadius: 10, cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif", fontSize: 14,
                                  border: `0.5px solid ${sel ? acc(0.6) : acc(0.25)}`,
                                  background: sel ? (isDark ? acc(0.20) : '#320E3B') : (isDark ? 'rgba(193,154,107,0.05)' : 'rgba(255,255,255,0.10)'),
                                  color: sel ? (isDark ? txt(0.95) : 'rgba(255,248,235,0.96)') : txt(0.65),
                                  boxShadow: sel && !isDark ? '0 3px 10px rgba(50,14,59,0.30)' : 'none',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                        <p style={{ textAlign: 'center', marginTop: 12, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: isDark ? txt(0.9) : 'rgba(255,248,235,0.96)' }}>
                          → Weekly goal: <span style={{ display: 'inline-flex', alignItems: 'center', background: isDark ? 'rgba(193,154,107,0.20)' : '#320E3B', color: isDark ? txt(0.95) : 'rgba(255,248,235,0.96)', borderRadius: 999, padding: '2px 11px', fontWeight: 600, margin: '0 2px' }}>{commitmentDays} h</span> <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11, color: txt(0.6) }}>/ week (≈1h each day)</span>
                        </p>
                      </div>
                  </div>

                  {/* MY PRACTICES */}
                  <div className="space-y-1">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: isDark ? 'rgba(193,154,107,0.55)' : '#320E3B' }}>My Practices</p>
                        <Link href="/profile/analysis-logs" style={{ fontSize: 11, color: acc(0.40) }}>Show all ›</Link>
                      </div>
                      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }} className="no-scrollbar">
                        {recentPractices.length > 0 ? (
                          recentPractices.map((practice) => (
                            <Link key={practice.id} href={`/analysis/${practice.id}`}>
                              <div style={{ flexShrink: 0, width: 130, borderRadius: 16, border: `0.5px solid ${acc(0.16)}`, background: isDark ? 'rgba(193,154,107,0.05)' : 'rgba(255,255,255,0.12)', overflow: 'hidden', boxShadow: cardShadow }}>
                                <div style={{ height: 70, background: 'linear-gradient(135deg, rgba(193,154,107,0.25), rgba(180,110,65,0.20))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                  🧘
                                </div>
                                <div style={{ padding: '8px 10px' }}>
                                  <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: txt(0.88) }}>{practice.identifiedPose}</div>
                                  <div style={{ fontSize: 9, color: txt(0.35), fontStyle: 'italic', marginTop: 2 }}>
                                    {formatPracticeDate(practice.createdAt)}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                                    <span style={{ background: isDark ? acc(0.20) : '#320E3B', color: isDark ? acc(0.90) : 'rgba(255,248,235,0.95)', borderRadius: 999, padding: '1px 6px', fontWeight: 600, fontSize: 11 }}>
                                      {Math.round(practice.score)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div style={{ flexShrink: 0, width: '100%', borderRadius: 16, border: `0.5px dashed ${acc(0.16)}`, background: isDark ? 'rgba(193,154,107,0.02)' : 'rgba(255,255,255,0.08)', padding: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: 12, color: txt(0.35), fontStyle: 'italic' }}>
                              No practices recorded yet — try the Analyze tab to get started.
                            </p>
                          </div>
                        )}
                      </div>
                  </div>

                  {/* ACCOUNT SETTINGS (CONSOLIDATED) */}
                  <div className="space-y-1">
                      <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: isDark ? 'rgba(193,154,107,0.55)' : '#320E3B', marginBottom: 6 }}>Account</p>
                      
                      <div style={{ borderRadius: 20, border: `0.5px solid ${panelBorder}`, background: panelBg, overflow: 'hidden', backdropFilter: 'blur(14px)', boxShadow: `${cardShadow}, inset 0 1px 0 ${cardHi}` }}>
                        
                        {/* Row 1: Display Name */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer' }} 
                          onClick={() => setExpandedSection(expandedSection === 'username' ? null : 'username')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(193,154,107,0.14)' : 'rgba(50,14,59,0.07)', color: panelIcon }}>
                              <Pencil style={{ width: 16, height: 16 }} />
                            </span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: panelTitle }}>Display Name</div>
                              <div style={{ fontSize: 9.5, color: panelSub, fontStyle: 'italic', marginTop: 1 }}>{user?.displayName || 'jellycat'}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: panelChevron }}>›</span>
                        </div>
                        {expandedSection === 'username' && (
                          <div style={{ padding: '0 14px 14px', borderTop: `0.5px solid ${acc(0.05)}` }}>
                             <form onSubmit={handleSubmitUsername(onUsernameSubmit)} className="pt-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="text"
                                        {...registerUsername("username")}
                                        className={cn(usernameErrors.username ? "border-destructive" : "", "flex-grow h-11 text-sm rounded-lg bg-black/20 border-white/10 text-white")}
                                    />
                                    <Button type="submit" disabled={isUsernameSubmitting || authLoading} className="h-11 w-11 rounded-lg" style={{ background: acc(0.20), color: acc(0.85) }}>
                                        {isUsernameSubmitting ? <MoonPhaseRingLoader text="" /> : <Save className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {usernameErrors.username && <p className="text-xs text-destructive">{usernameErrors.username.message}</p>}
                             </form>
                          </div>
                        )}

                        {/* Row 2: Subscription */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer', borderTop: `0.5px solid ${panelDivider}` }} 
                          onClick={() => setExpandedSection(expandedSection === 'subscription' ? null : 'subscription')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(193,154,107,0.14)' : 'rgba(50,14,59,0.07)', color: panelIcon }}>
                              <Crown style={{ width: 16, height: 16 }} />
                            </span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: panelTitle }}>Subscription</div>
                              <div style={{ fontSize: 9.5, color: panelSub, fontStyle: 'italic', marginTop: 1 }}>Manage your plan</div>
                            </div>
                          </div>
                          <TierBadge tier={membershipTier} />
                        </div>
                        {expandedSection === 'subscription' && (
                          <div style={{ padding: '14px', borderTop: `0.5px solid ${acc(0.05)}`, background: isDark ? 'rgba(180,110,65,0.08)' : 'rgba(255,255,255,0.10)' }}>
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm" style={{ color: txt(0.9) }}>{isGold ? 'Gold Member' : 'Trial Period'}</p>
                                    <p className="text-xs" style={{ color: txt(0.5) }}>{isGold ? 'Enjoy your full premium access.' : 'Unlock all features with Gold.'}</p>
                                </div>
                                {!isGold && (
                                  <Button asChild className="h-9 px-5 rounded-full font-bold text-xs" style={{ background: isDark ? 'rgba(193,154,107,0.85)' : '#320E3B', color: isDark ? 'rgba(25,16,8,0.95)' : 'rgba(255,248,235,0.95)' }}>
                                      <Link href="/upgrade">Upgrade</Link>
                                  </Button>
                                )}
                             </div>
                          </div>
                        )}

                        {/* Row 3: Change Password */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer', borderTop: `0.5px solid ${panelDivider}` }} 
                          onClick={() => setExpandedSection(expandedSection === 'security' ? null : 'security')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(193,154,107,0.14)' : 'rgba(50,14,59,0.07)', color: panelIcon }}>
                              <KeyRound style={{ width: 16, height: 16 }} />
                            </span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: panelTitle }}>Change Password</div>
                              <div style={{ fontSize: 9.5, color: panelSub, fontStyle: 'italic', marginTop: 1 }}>Update your credentials</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: panelChevron }}>›</span>
                        </div>
                        {expandedSection === 'security' && (
                          <div style={{ padding: '14px', borderTop: `0.5px solid ${acc(0.05)}`, background: isDark ? 'rgba(25,16,8,0.20)' : 'rgba(255,255,255,0.10)' }}>
                             <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs" style={{ color: txt(0.6) }}>Current Password</Label>
                                    <Input type="password" {...registerPassword("currentPassword")} className="h-10 text-sm rounded-lg bg-black/30 border-white/10 text-white" />
                                    {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs" style={{ color: txt(0.6) }}>New Password</Label>
                                    <Input type="password" {...registerPassword("newPassword")} className="h-10 text-sm rounded-lg bg-black/30 border-white/10 text-white" />
                                    {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs" style={{ color: txt(0.6) }}>Confirm New Password</Label>
                                    <Input type="password" {...registerPassword("confirmNewPassword")} className="h-10 text-sm rounded-lg bg-black/30 border-white/10 text-white" />
                                    {passwordErrors.confirmNewPassword && <p className="text-xs text-destructive">{passwordErrors.confirmNewPassword.message}</p>}
                                </div>
                                <Button type="submit" className="w-full h-10 rounded-lg text-xs" style={{ background: acc(0.12), color: txt(0.92) }} disabled={isPasswordSubmitting || authLoading}>
                                    {isPasswordSubmitting ? <MoonPhaseRingLoader text="" /> : "Update Password"}
                                </Button>
                             </form>
                          </div>
                        )}

                        {/* Row 4: Invite Friends */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer', borderTop: `0.5px solid ${panelDivider}` }} 
                          onClick={() => setExpandedSection(expandedSection === 'invite' ? null : 'invite')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(193,154,107,0.14)' : 'rgba(50,14,59,0.07)', color: panelIcon }}>
                              <Share2 style={{ width: 16, height: 16 }} />
                            </span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: panelTitle }}>Invite friends to SnapYoga</div>
                              <div style={{ fontSize: 9.5, color: panelSub, fontStyle: 'italic', marginTop: 1 }}>Share your practice</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: panelChevron }}>›</span>
                        </div>
                        {expandedSection === 'invite' && (
                          <div style={{ padding: '14px', borderTop: `0.5px solid ${acc(0.05)}`, background: isDark ? 'rgba(25,16,8,0.20)' : 'rgba(255,255,255,0.10)' }}>
                             <div className="space-y-4">
                                  <div className="text-center p-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium">
                                      {t('referralBonusText')}
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-medium mb-1 text-[#320E3B]/70 dark:text-white/60 uppercase tracking-widest">{t('yourInviteLink')}</p>
                                      <div className="flex items-center space-x-2">
                                          <Input type="text" value={inviteLink} readOnly className="h-11 text-sm rounded-lg bg-black/20 border-white/10 text-white" />
                                          <Button variant="outline" size="icon" onClick={handleCopyInviteLink} className="h-11 w-11 rounded-lg bg-transparent border-[#320E3B]/25 text-[#320E3B] hover:bg-[#320E3B]/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"><Copy className="h-4 w-4" /></Button>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                      <Button variant="outline" className="h-11 rounded-lg bg-transparent border-[#320E3B]/25 text-[#320E3B] hover:bg-[#320E3B]/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5" asChild disabled={!inviteLink}><a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer"><MessageSquare className="h-4 w-4" /></a></Button>
                                      <Button variant="outline" className="h-11 rounded-lg bg-transparent border-[#320E3B]/25 text-[#320E3B] hover:bg-[#320E3B]/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5" onClick={handleInstagramShare} disabled={!inviteLink}><Share2 className="h-4 w-4" /></Button>
                                      <Button variant="outline" className="h-11 rounded-lg bg-transparent border-[#320E3B]/25 text-[#320E3B] hover:bg-[#320E3B]/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5" asChild disabled={!inviteLink}><a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer"><PinterestIcon className="h-4 w-4" /></a></Button>
                                  </div>
                              </div>
                          </div>
                        )}

                        {/* Row 5: Appearance — dark / light mode */}
                        <div
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer', borderTop: `0.5px solid ${panelDivider}` }}
                          onClick={toggleTheme}
                          role="switch"
                          aria-checked={isDark}
                          aria-label="Toggle dark mode"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(193,154,107,0.14)' : 'rgba(50,14,59,0.07)', color: panelIcon }}>
                              {isDark ? <Moon style={{ width: 16, height: 16 }} /> : <Sun style={{ width: 16, height: 16 }} />}
                            </span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: panelTitle }}>Appearance</div>
                              <div style={{ fontSize: 9.5, color: panelSub, fontStyle: 'italic', marginTop: 1 }}>{isDark ? 'Dark mode' : 'Light mode'}</div>
                            </div>
                          </div>
                          <div style={{ width: 42, height: 24, borderRadius: 999, padding: 2, background: isDark ? 'rgba(193,154,107,0.85)' : 'rgba(255,248,235,0.20)', display: 'flex', justifyContent: isDark ? 'flex-end' : 'flex-start', alignItems: 'center', transition: 'background 0.2s ease' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: isDark ? '#1a1210' : 'rgba(255,248,235,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {isDark ? <Moon style={{ width: 11, height: 11, color: 'rgba(193,154,107,0.9)' }} /> : <Sun style={{ width: 11, height: 11, color: '#320E3B' }} />}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                        <GlossyButton onClick={handleSignOut} variant="coral" icon={<LogOut className="h-4 w-4" />}>
                          Sign out
                        </GlossyButton>
                      </div>
                  </div>
              </div>
            </main>
        </div>
      </div>
    </AppShell>
  );
}
