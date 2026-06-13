"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Share2, Copy, MessageSquare, Sun, Moon, Pencil, KeyRound, Star, Crown } from 'lucide-react';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { cn } from '@/lib/utils';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfDay, isToday, isYesterday, differenceInDays } from 'date-fns';

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

export default function ProfilePage() {
  const { user, updateUserPassword, updateUserDisplayName, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isUsernameSubmitting, setIsUsernameSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  // Expanded section state
  const [expandedSection, setExpandedSection] = useState<'username' | 'subscription' | 'security' | 'invite' | null>(null);

  // Progress States
  const [practicePercent, setPracticePercent] = useState(0);
  const [moodPercent, setMoodPercent] = useState(0);
  const [habitsPercent, setHabitsPercent] = useState(0);
  const [recentPractices, setRecentPractices] = useState<any[]>([]);

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
      getDoc(doc(firestore, 'users', user.uid)).then((snap) => {
        if (snap.exists()) setSubscriptionStatus(snap.data()?.subscriptionStatus ?? null);
      });

      // Fetch Progress & Practices Data
      const fetchProgress = async () => {
        const now = new Date();
        const sevenDaysAgo = subDays(now, 7);
        const startOfSevenDaysAgo = startOfDay(sevenDaysAgo);

        // 1. Practice (Total all-time for exercise goal)
        const analysesRef = collection(firestore, 'users', user.uid, 'poseAnalyses');
        const analysesSnap = await getDocs(analysesRef);
        const exerciseHrs = (analysesSnap.size * 15) / 60;
        setPracticePercent(Math.min(Math.round((exerciseHrs / 30) * 100), 100));

        // 2. Recent Practices
        const practicesQuery = query(analysesRef, orderBy('createdAt', 'desc'), limit(5));
        const practicesSnap = await getDocs(practicesQuery);
        setRecentPractices(practicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 3. Mood (Last 7 days)
        const moodsRef = collection(firestore, 'users', user.uid, 'moods');
        const moodsQuery = query(moodsRef, where('loggedAt', '>=', startOfSevenDaysAgo));
        const moodsSnap = await getDocs(moodsQuery);
        setMoodPercent(Math.min(Math.round((moodsSnap.size / 7) * 100), 100));

        // 4. Habits (Last 7 days)
        const habitsRef = collection(firestore, 'users', user.uid, 'habits');
        const habitsQuery = query(habitsRef, where('date', '>=', format(sevenDaysAgo, 'yyyy-MM-dd')));
        const habitsSnap = await getDocs(habitsQuery);
        let totalCompleted = 0;
        habitsSnap.forEach(doc => {
          totalCompleted += (doc.data().completed || []).length;
        });
        setHabitsPercent(Math.min(Math.round((totalCompleted / (5 * 7)) * 100), 100));
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
    return <AppShell><div className="flex justify-center items-center min-h-screen"><SmileyRockLoader /></div></AppShell>;
  }

  const whatsappShareUrl = inviteLink ? `whatsapp://send?text=${encodeURIComponent('Check out SnapYoga: ' + inviteLink)}` : '#';
  const pinterestShareUrl = inviteLink ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(inviteLink)}&media=${encodeURIComponent('https://placehold.co/600x400.png')}&description=Check out SnapYoga` : '#';

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div className="relative min-h-[calc(100vh-4rem)]">
        <div className="relative z-10 flex flex-col h-full">
            
            {/* THEME TOGGLE */}
            <div className="absolute top-4 right-4">
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
            </div>

            {/* PROFILE HEADER */}
            <header className="container mx-auto px-4 pt-12 pb-8 relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: '50%',
                      border: '2px solid rgba(193,154,107,0.45)',
                      boxShadow: '0 0 0 6px rgba(193,154,107,0.06), 0 0 0 12px rgba(193,154,107,0.03)',
                      overflow: 'hidden',
                      background: 'rgba(193,154,107,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Profile'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 32, color: 'rgba(193,154,107,0.85)', fontFamily: "'Cormorant Garamond', serif" }}>
                        {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <a
                    href="/onboarding/gender-profile"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'rgba(193,154,107,0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    <Pencil style={{ width: 14, height: 14, color: 'rgba(25,16,8,0.95)' }} />
                  </a>
                </div>

                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: 'rgba(255,240,215,0.94)',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    marginBottom: 8,
                  }}
                >
                  {user?.displayName || user?.email?.split('@')[0] || 'Yogi'}
                </h2>

                <div className="flex gap-2">
                  <div
                    style={{
                      background: 'rgba(193,154,107,0.20)',
                      color: 'rgba(193,154,107,0.92)',
                      border: '0.5px solid rgba(193,154,107,0.35)',
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      padding: '5px 12px',
                      borderRadius: 999,
                    }}
                  >
                    ★ {subscriptionStatus === 'active' ? 'Premium Plan' : 'Free Plan'}
                  </div>
                  <div
                    style={{
                      background: 'rgba(120,155,95,0.20)',
                      color: 'rgba(160,195,130,0.92)',
                      border: '0.5px solid rgba(140,170,115,0.35)',
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      padding: '5px 12px',
                      borderRadius: 999,
                    }}
                  >
                    🔥 7 day streak
                  </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 mt-4">
              <div className="max-w-2xl mx-auto space-y-8 w-full pb-12">
                  
                  {/* MY PROGRESS */}
                  <div className="space-y-1">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <p style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(193,154,107,0.55)' }}>My Progress</p>
                        <span style={{ fontSize: 11, color: 'rgba(193,154,107,0.40)' }}>This Week</span>
                      </div>
                      <div style={{ 
                        borderRadius: '24px 12px 24px 24px', 
                        border: '0.5px solid rgba(193,154,107,0.18)', 
                        background: 'rgba(25,16,8,0.50)', 
                        padding: '14px 16px' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                          <div className="flex flex-col items-center gap-2">
                            <svg width="58" height="58" viewBox="0 0 58 58">
                              <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(255,240,215,0.07)" strokeWidth="5"/>
                              <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(193,154,107,0.85)" strokeWidth="5"
                                strokeDasharray="150.8" strokeDashoffset={getOffset(practicePercent)} strokeLinecap="round"
                                transform="rotate(-90 29 29)"/>
                              <text x="29" y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill="rgba(255,240,215,0.92)" fontFamily="Cormorant Garamond, serif">{practicePercent}%</text>
                            </svg>
                            <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(193,154,107,0.80)' }}>Practice</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <svg width="58" height="58" viewBox="0 0 58 58">
                              <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(255,240,215,0.07)" strokeWidth="5"/>
                              <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(160,195,130,0.85)" strokeWidth="5"
                                strokeDasharray="150.8" strokeDashoffset={getOffset(moodPercent)} strokeLinecap="round"
                                transform="rotate(-90 29 29)"/>
                              <text x="29" y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill="rgba(255,240,215,0.92)" fontFamily="Cormorant Garamond, serif">{moodPercent}%</text>
                            </svg>
                            <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(160,195,130,0.85)' }}>Mood</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <svg width="58" height="58" viewBox="0 0 58 58">
                              <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(255,240,215,0.07)" strokeWidth="5"/>
                              <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(200,140,90,0.85)" strokeWidth="5"
                                strokeDasharray="150.8" strokeDashoffset={getOffset(habitsPercent)} strokeLinecap="round"
                                transform="rotate(-90 29 29)"/>
                              <text x="29" y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill="rgba(255,240,215,0.92)" fontFamily="Cormorant Garamond, serif">{habitsPercent}%</text>
                            </svg>
                            <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(200,140,90,0.85)' }}>Habits</span>
                          </div>
                        </div>
                      </div>
                  </div>

                  {/* MY PRACTICES */}
                  <div className="space-y-1">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <p style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(193,154,107,0.55)' }}>My Practices</p>
                        <Link href="/profile/analysis-logs" style={{ fontSize: 11, color: 'rgba(193,154,107,0.40)' }}>Show all ›</Link>
                      </div>
                      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }} className="no-scrollbar">
                        {recentPractices.length > 0 ? (
                          recentPractices.map((practice) => (
                            <Link key={practice.id} href={`/analysis/${practice.id}`}>
                              <div style={{ flexShrink: 0, width: 130, borderRadius: '16px 16px 16px 6px', border: '0.5px solid rgba(193,154,107,0.16)', background: 'rgba(193,154,107,0.05)', overflow: 'hidden' }}>
                                <div style={{ height: 70, background: 'linear-gradient(135deg, rgba(193,154,107,0.25), rgba(180,110,65,0.20))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                  🧘
                                </div>
                                <div style={{ padding: '8px 10px' }}>
                                  <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,240,215,0.88)' }}>{practice.identifiedPose}</div>
                                  <div style={{ fontSize: 9, color: 'rgba(255,240,215,0.35)', fontStyle: 'italic', marginTop: 2 }}>
                                    {formatPracticeDate(practice.createdAt)}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                                    <span style={{ background: 'rgba(193,154,107,0.20)', color: 'rgba(193,154,107,0.90)', borderRadius: 999, padding: '1px 6px', fontWeight: 600, fontSize: 11 }}>
                                      {Math.round(practice.score)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div style={{ flexShrink: 0, width: '100%', borderRadius: '16px 16px 16px 6px', border: '0.5px dashed rgba(193,154,107,0.16)', background: 'rgba(193,154,107,0.02)', padding: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: 12, color: 'rgba(255,240,215,0.35)', fontStyle: 'italic' }}>
                              No practices recorded yet — try the Analyze tab to get started.
                            </p>
                          </div>
                        )}
                      </div>
                  </div>

                  {/* ACCOUNT SETTINGS (CONSOLIDATED) */}
                  <div className="space-y-1">
                      <p style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(193,154,107,0.55)', marginBottom: 6 }}>Account</p>
                      
                      <div style={{ borderRadius: 18, border: '0.5px solid rgba(193,154,107,0.18)', background: 'rgba(193,154,107,0.04)', overflow: 'hidden' }}>
                        
                        {/* Row 1: Display Name */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer' }} 
                          onClick={() => setExpandedSection(expandedSection === 'username' ? null : 'username')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 15, color: 'rgba(193,154,107,0.75)' }}>◎</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,240,215,0.88)' }}>Display Name</div>
                              <div style={{ fontSize: 9.5, color: 'rgba(255,240,215,0.32)', fontStyle: 'italic', marginTop: 1 }}>{user?.displayName || 'jellycat'}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(193,154,107,0.50)' }}>›</span>
                        </div>
                        {expandedSection === 'username' && (
                          <div style={{ padding: '0 14px 14px', borderTop: '0.5px solid rgba(193,154,107,0.05)' }}>
                             <form onSubmit={handleSubmitUsername(onUsernameSubmit)} className="pt-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="text"
                                        {...registerUsername("username")}
                                        className={cn(usernameErrors.username ? "border-destructive" : "", "flex-grow h-11 text-sm rounded-lg bg-black/20 border-white/10 text-white")}
                                    />
                                    <Button type="submit" disabled={isUsernameSubmitting || authLoading} className="h-11 w-11 rounded-lg" style={{ background: 'rgba(193,154,107,0.20)', color: 'rgba(193,154,107,0.85)' }}>
                                        {isUsernameSubmitting ? <SmileyRockLoader /> : <Save className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {usernameErrors.username && <p className="text-xs text-destructive">{usernameErrors.username.message}</p>}
                             </form>
                          </div>
                        )}

                        {/* Row 2: Subscription */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer', borderTop: '0.5px solid rgba(193,154,107,0.10)' }} 
                          onClick={() => setExpandedSection(expandedSection === 'subscription' ? null : 'subscription')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 15, color: 'rgba(193,154,107,0.75)' }}>♛</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,240,215,0.88)' }}>Subscription</div>
                              <div style={{ fontSize: 9.5, color: 'rgba(255,240,215,0.32)', fontStyle: 'italic', marginTop: 1 }}>Manage your plan</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 9, background: 'rgba(193,154,107,0.18)', color: 'rgba(193,154,107,0.85)', padding: '2px 8px', borderRadius: 999, fontWeight: 600, letterSpacing: '0.05em' }}>
                            {subscriptionStatus === 'active' ? 'Premium' : 'Free'}
                          </span>
                        </div>
                        {expandedSection === 'subscription' && (
                          <div style={{ padding: '14px', borderTop: '0.5px solid rgba(193,154,107,0.05)', background: 'rgba(180,110,65,0.08)' }}>
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white/90 text-sm">{subscriptionStatus === 'active' ? 'Premium Active' : 'Free Plan'}</p>
                                    <p className="text-xs text-white/40">Unlock all features with Premium.</p>
                                </div>
                                <Button asChild className="h-9 px-5 rounded-full font-bold text-xs" style={{ background: 'rgba(193,154,107,0.85)', color: 'rgba(25,16,8,0.95)' }}>
                                    <Link href="/upgrade">Upgrade</Link>
                                </Button>
                             </div>
                          </div>
                        )}

                        {/* Row 3: Change Password */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer', borderTop: '0.5px solid rgba(193,154,107,0.10)' }} 
                          onClick={() => setExpandedSection(expandedSection === 'security' ? null : 'security')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 15, color: 'rgba(193,154,107,0.75)' }}>🔑</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,240,215,0.88)' }}>Change Password</div>
                              <div style={{ fontSize: 9.5, color: 'rgba(255,240,215,0.32)', fontStyle: 'italic', marginTop: 1 }}>Update your credentials</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(193,154,107,0.50)' }}>›</span>
                        </div>
                        {expandedSection === 'security' && (
                          <div style={{ padding: '14px', borderTop: '0.5px solid rgba(193,154,107,0.05)', background: 'rgba(25,16,8,0.20)' }}>
                             <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-white/60">Current Password</Label>
                                    <Input type="password" {...registerPassword("currentPassword")} className="h-10 text-sm rounded-lg bg-black/30 border-white/10 text-white" />
                                    {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-white/60">New Password</Label>
                                    <Input type="password" {...registerPassword("newPassword")} className="h-10 text-sm rounded-lg bg-black/30 border-white/10 text-white" />
                                    {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-white/60">Confirm New Password</Label>
                                    <Input type="password" {...registerPassword("confirmNewPassword")} className="h-10 text-sm rounded-lg bg-black/30 border-white/10 text-white" />
                                    {passwordErrors.confirmNewPassword && <p className="text-xs text-destructive">{passwordErrors.confirmNewPassword.message}</p>}
                                </div>
                                <Button type="submit" className="w-full h-10 rounded-lg bg-white/10 text-xs text-white" disabled={isPasswordSubmitting || authLoading}>
                                    {isPasswordSubmitting ? <SmileyRockLoader /> : "Update Password"}
                                </Button>
                             </form>
                          </div>
                        )}

                        {/* Row 4: Invite Friends */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', gap: 10, cursor: 'pointer', borderTop: '0.5px solid rgba(193,154,107,0.10)' }} 
                          onClick={() => setExpandedSection(expandedSection === 'invite' ? null : 'invite')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 15, color: 'rgba(193,154,107,0.75)' }}>👥</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,240,215,0.88)' }}>Invite friends to SnapYoga</div>
                              <div style={{ fontSize: 9.5, color: 'rgba(255,240,215,0.32)', fontStyle: 'italic', marginTop: 1 }}>Share your practice</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(193,154,107,0.50)' }}>›</span>
                        </div>
                        {expandedSection === 'invite' && (
                          <div style={{ padding: '14px', borderTop: '0.5px solid rgba(193,154,107,0.05)', background: 'rgba(25,16,8,0.20)' }}>
                             <div className="space-y-4">
                                  <div className="text-center p-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium">
                                      {t('referralBonusText')}
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-medium mb-1 text-white/60 uppercase tracking-widest">{t('yourInviteLink')}</p>
                                      <div className="flex items-center space-x-2">
                                          <Input type="text" value={inviteLink} readOnly className="h-11 text-sm rounded-lg bg-black/20 border-white/10 text-white" />
                                          <Button variant="outline" size="icon" onClick={handleCopyInviteLink} className="h-11 w-11 rounded-lg border-white/10 bg-transparent text-white hover:bg-white/5"><Copy className="h-4 w-4" /></Button>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                      <Button variant="outline" className="h-11 rounded-lg border-white/10 bg-transparent text-white hover:bg-white/5" asChild disabled={!inviteLink}><a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer"><MessageSquare className="h-4 w-4" /></a></Button>
                                      <Button variant="outline" className="h-11 rounded-lg border-white/10 bg-transparent text-white hover:bg-white/5" onClick={handleInstagramShare} disabled={!inviteLink}><Share2 className="h-4 w-4" /></Button>
                                      <Button variant="outline" className="h-11 rounded-lg border-white/10 bg-transparent text-white hover:bg-white/5" asChild disabled={!inviteLink}><a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer"><PinterestIcon className="h-4 w-4" /></a></Button>
                                  </div>
                              </div>
                          </div>
                        )}
                      </div>
                  </div>
              </div>
            </main>
        </div>
      </div>
    </AppShell>
  );
}
