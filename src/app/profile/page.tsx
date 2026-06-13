
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Save, Share2, Copy, MessageSquare, UserCircle, FileText, Star, Crown, Sun, Moon, Pencil } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, DocumentData, collection, query, where, getDocs, orderBy, Timestamp, limit } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { cn } from '@/lib/utils';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
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

const measurementsSchema = z.object({
  height: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Height must be a number" }).positive({ message: "Height must be positive" }).optional()
  ),
  heightUnit: z.enum(['cm', 'in']).default('cm'),
  weight: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Weight must be a number" }).positive({ message: "Weight must be positive" }).optional()
  ),
  weightUnit: z.enum(['kg', 'lbs']).default('kg'),
});

type MeasurementsFormValues = z.infer<typeof measurementsSchema>;


export default function ProfilePage() {
  const { user, updateUserPassword, updateUserDisplayName, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isUsernameSubmitting, setIsUsernameSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

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
    setIsUsernameSubmitting(false);
  };


  const onPasswordSubmit: SubmitHandler<PasswordChangeFormValues> = async (data) => {
    setIsPasswordSubmitting(true);
    const success = await updateUserPassword(data.currentPassword, data.newPassword);
    if (success) {
      resetPasswordForm();
    }
    setIsPasswordSubmitting(false);
  };
  
  const handleCopyInviteLink = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied!",
            description: "Invite link copied to your clipboard.",
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy the link. Please try manually.",
            variant: "destructive",
          });
        });
    }
  };

  const shareText = inviteLink ? `Hey! Check out SnapYoga - an awesome app to analyze and improve your yoga poses: ${inviteLink}` : '';
  const whatsappShareUrl = inviteLink ? `whatsapp://send?text=${encodeURIComponent(shareText)}` : '#';
  const pinterestShareUrl = inviteLink ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(inviteLink)}&media=${encodeURIComponent('https://placehold.co/600x400.png')}&description=${encodeURIComponent(shareText)}` : '#';

  const handleInstagramShare = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied for Instagram!",
            description: "Paste this link in your Instagram bio or stories.",
            duration: 5000,
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy the link. Please try manually.",
            variant: "destructive",
          });
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

  if (!user) {
    return <AppShell><div className="text-center p-8"><p>Please sign in to view your profile.</p></div></AppShell>;
  }

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div className="relative min-h-[calc(100vh-4rem)]">
        <div className="relative z-10 flex flex-col h-full">
            <header className="container mx-auto px-4 pt-12 pb-8 relative flex flex-col items-center text-center">
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
                  
                  <Link
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
                  </Link>
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
                  {/* My Progress */}
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
                          {/* Practice */}
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
                          {/* Mood */}
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
                          {/* Habits */}
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

                  {/* My Practices */}
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
                                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,240,215,0.88)', truncate: 'true' } as any} className="truncate">{practice.identifiedPose}</div>
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

                  {/* Username */}
                  <div className="space-y-1">
                      <p style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(193,154,107,0.55)', marginBottom: 6 }}>
                        Username
                      </p>
                      <Card 
                        className="shadow-xl border" 
                        style={{ 
                          border: '0.5px solid rgba(193,154,107,0.18)', 
                          background: 'rgba(193,154,107,0.045)',
                          borderRadius: '24px 12px 24px 24px'
                        }}
                      >
                          <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-lg text-white/90">
                                  <UserCircle className="h-5 w-5" style={{ color: 'rgba(193,154,107,0.85)' }} />
                                  Display Name
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <form onSubmit={handleSubmitUsername(onUsernameSubmit)} className="space-y-4">
                                  <div className="space-y-2">
                                      <Label htmlFor="username" className="sr-only">Your username</Label>
                                      <div className="flex items-center gap-2">
                                          <Input 
                                              id="username" 
                                              type="text"
                                              {...registerUsername("username")}
                                              className={cn(usernameErrors.username ? "border-destructive" : "", "flex-grow h-12 text-base rounded-lg bg-black/10 border-white/10 text-white")}
                                          />
                                          <Button type="submit" disabled={isUsernameSubmitting || authLoading} className="h-12 w-12 rounded-lg" style={{ background: 'rgba(193,154,107,0.20)', color: 'rgba(193,154,107,0.85)' }}>
                                              {isUsernameSubmitting ? <SmileyRockLoader /> : <Save className="h-5 w-5" />}
                                          </Button>
                                      </div>
                                      {usernameErrors.username && <p className="text-sm text-destructive">{usernameErrors.username.message}</p>}
                                  </div>
                              </form>
                          </CardContent>
                      </Card>
                  </div>

                  {/* Subscription */}
                  <div className="space-y-1">
                      <p style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(193,154,107,0.55)', marginBottom: 6 }}>
                        Subscription
                      </p>
                      <Card 
                        className="shadow-xl border" 
                        style={{ 
                          background: 'rgba(180,110,65,0.16)', 
                          border: '0.5px solid rgba(193,154,107,0.18)', 
                          borderRadius: '12px 24px 24px 24px' 
                        }}
                      >
                          <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-lg text-white/90">
                                  <Crown className="h-5 w-5" style={{ color: 'rgba(193,154,107,0.85)' }} />
                                  Membership
                              </CardTitle>
                              <CardDescription className="text-white/40 italic">Manage your SnapYoga plan.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              {subscriptionStatus === 'active' ? (
                                  <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                          <Badge className="bg-green-500/20 hover:bg-green-500/20 text-green-400 gap-1 border-green-500/30">
                                              <Star className="h-3 w-3" /> Premium Active
                                          </Badge>
                                          <span className="text-sm text-white/60">Monthly plan</span>
                                      </div>
                                      <Button variant="outline" asChild className="h-9 rounded-lg text-sm bg-white/5 border-white/10 text-white">
                                          <Link href="/upgrade">Manage</Link>
                                      </Button>
                                  </div>
                              ) : (
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <p className="font-medium text-white/90">Free Plan</p>
                                          <p className="text-sm text-white/50">Upgrade to unlock all features.</p>
                                      </div>
                                      <Button asChild className="h-10 px-6 rounded-full font-bold transition-transform hover:scale-105" style={{ background: 'rgba(193,154,107,0.85)', color: 'rgba(25,16,8,0.95)' }}>
                                          <Link href="/upgrade" className="flex items-center gap-2"><Star className="h-4 w-4" /> Upgrade</Link>
                                      </Button>
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                  </div>

                  {/* Change Password */}
                  <div className="space-y-1">
                      <p style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(193,154,107,0.55)', marginBottom: 6 }}>
                        Security
                      </p>
                      <Card 
                        className="shadow-xl border" 
                        style={{ 
                          border: '0.5px solid rgba(193,154,107,0.18)', 
                          background: 'rgba(25,16,8,0.50)',
                          borderRadius: '24px 12px 24px 24px'
                        }}
                      >
                          <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-lg text-white/90">
                                  <KeyRound className="h-5 w-5" style={{ color: 'rgba(193,154,107,0.80)' }} />
                                  Change Password
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                                  <div className="space-y-2">
                                      <Label htmlFor="currentPassword text-white/60">Current Password</Label>
                                      <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} placeholder="••••••••" className={cn(passwordErrors.currentPassword ? "border-destructive" : "", "h-12 text-base rounded-lg bg-black/20 border-white/10 text-white")}/>
                                      {passwordErrors.currentPassword && <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>}
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="newPassword text-white/60">New Password</Label>
                                      <Input id="newPassword" type="password" {...registerPassword("newPassword")} placeholder="Minimum 6 characters" className={cn(passwordErrors.newPassword ? "border-destructive" : "", "h-12 text-base rounded-lg bg-black/20 border-white/10 text-white")}/>
                                      {passwordErrors.newPassword && <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>}
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="confirmNewPassword text-white/60">Confirm New Password</Label>
                                      <Input id="confirmNewPassword" type="password" {...registerPassword("confirmNewPassword")} placeholder="Re-type new password" className={cn(passwordErrors.confirmNewPassword ? "border-destructive" : "", "h-12 text-base rounded-lg bg-black/20 border-white/10 text-white")}/>
                                      {passwordErrors.confirmNewPassword && <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword.message}</p>}
                                  </div>
                                  <Button type="submit" className="w-full h-12 rounded-lg bg-white/10 hover:bg-white/20 text-white" disabled={isPasswordSubmitting || authLoading}>
                                      {isPasswordSubmitting ? <SmileyRockLoader /> : <Save className="mr-2 h-4 w-4" />}
                                      {isPasswordSubmitting ? "Updating..." : "Update Password"}
                                  </Button>
                              </form>
                          </CardContent>
                      </Card>
                  </div>

                  {/* Analysis Logs */}
                  <Card className="rounded-2xl shadow-xl border bg-black/20 border-white/10">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl text-white/90">
                              <FileText className="h-6 w-6 text-primary" />
                              Your Past Analysis
                          </CardTitle>
                          <CardDescription className="text-white/40 italic">Review your past pose analysis sessions.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Button variant="outline" asChild className="w-full h-12 text-base rounded-lg border-white/10 bg-transparent text-white hover:bg-white/5">
                              <Link href="/profile/analysis-logs">View your analysis</Link>
                          </Button>
                      </CardContent>
                  </Card>

                  {/* Invite Friends */}
                  <Card className="rounded-2xl shadow-xl border bg-black/20 border-white/10">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl text-white/90">
                              <Share2 className="h-6 w-6 text-primary" />
                              {t('inviteFriendsTitle')}
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="text-center p-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium">
                              {t('referralBonusText')}
                          </div>
                          <div>
                              <p className="text-sm font-medium mb-1 text-white/60">{t('yourInviteLink')}</p>
                              <div className="flex items-center space-x-2">
                                  <Input type="text" value={inviteLink} readOnly className="text-sm text-white/80 h-12 text-base rounded-lg bg-black/20 border-white/10" aria-label="Invite Link" />
                                  <Button variant="outline" size="icon" onClick={handleCopyInviteLink} title="Copy Link" className="h-12 w-12 rounded-lg border-white/10 bg-transparent text-white hover:bg-white/5"><Copy className="h-5 w-5" /></Button>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <Button variant="outline" className="w-full rounded-lg h-12 border-white/10 bg-transparent text-white hover:bg-white/5" asChild disabled={!inviteLink}><a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer"><MessageSquare className="mr-2 h-5 w-5" /> WhatsApp</a></Button>
                              <Button variant="outline" className="w-full rounded-lg h-12 border-white/10 bg-transparent text-white hover:bg-white/5" onClick={handleInstagramShare} disabled={!inviteLink}><Share2 className="mr-2 h-5 w-5" /> Instagram</Button>
                              <Button variant="outline" className="w-full rounded-lg h-12 border-white/10 bg-transparent text-white hover:bg-white/5" asChild disabled={!inviteLink}><a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer"><PinterestIcon className="mr-2 h-5 w-5" /> Pinterest</a></Button>
                          </div>
                          <p className="text-xs text-white/40 text-center w-full !mt-6">
                              {t('inviteLinkHelp')}
                          </p>
                      </CardContent>
                  </Card>
              </div>
            </main>
        </div>
      </div>
    </AppShell>
  );
}
