"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowLeft, Video, Users, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const FONT_PANCAKE = "'Cormorant Garamond', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export interface TutorialWeek {
  week: number;
  title: string;
  videos: { day: number; title: string; description: string; embedUrl: string }[];
}
export interface ChallengeFriend { id: string; name: string; daysIn: number }

export interface ChallengeDetailProps {
  id: string;
  name: string;
  emoji: string;
  heroGrad: string;
  status: 'active' | 'upcoming';
  difficulty: number;
  description: string;
  totalParticipants: number;
  friendsCount: number;
  inviteLink: string;
  analyzeLabel: string;
  dayInChallenge?: number;
  totalDays?: number;
  weeklyTutorials: TutorialWeek[];
  friends: ChallengeFriend[];
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(193,154,107,0.6)', fontWeight: 600, fontFamily: FONT_CASUAL, margin: '26px 0 12px' }}>{children}</p>
  );
}

export function ChallengeDetail(props: ChallengeDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkStatus = async () => {
      const docId = `${format(new Date(), 'yyyy-MM-dd')}_${props.id}`;
      const snap = await getDoc(doc(firestore, `users/${user.uid}/challengeTasks/${docId}`));
      if (snap.exists()) setIsCompletedToday(true);
    };
    checkStatus();
  }, [user, props.id]);

  const handleMarkComplete = async () => {
    if (!user) return;
    setIsLoading(true);
    const docId = `${format(new Date(), 'yyyy-MM-dd')}_${props.id}`;
    try {
      await setDoc(doc(firestore, `users/${user.uid}/challengeTasks/${docId}`), {
        challengeId: props.id,
        completedAt: serverTimestamp(),
      });
      setIsCompletedToday(true);
      toast({ title: "Task Complete!", description: "Today's challenge task has been recorded." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to mark task as complete.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = props.status === 'active';
  const stars = '★'.repeat(props.difficulty) + '☆'.repeat(5 - props.difficulty);
  const pct = props.dayInChallenge && props.totalDays ? Math.round((props.dayInChallenge / props.totalDays) * 100) : 0;

  return (
    <AppShell>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');`}</style>
      <div style={{ padding: '16px 14px 28px', maxWidth: 640, margin: '0 auto' }}>

        {/* Back */}
        <Link href="/challenges" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(214,178,130,0.9)', border: '0.5px solid rgba(193,154,107,0.28)', background: 'rgba(193,154,107,0.06)', borderRadius: 999, padding: '7px 14px', textDecoration: 'none' }}>
          <ArrowLeft className="h-4 w-4" /> Back to Challenges
        </Link>

        {/* Hero */}
        <div style={{ position: 'relative', height: 180, borderRadius: 18, overflow: 'hidden', marginTop: 14, background: props.heroGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 64, opacity: 0.85 }}>{props.emoji}</span>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,14,20,0.92), rgba(11,14,20,0.1) 60%, transparent)' }} />
          <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
            <h1 style={{ fontFamily: FONT_PANCAKE, fontSize: 25, fontWeight: 600, color: 'rgba(255,240,215,0.96)', lineHeight: 1.05, margin: 0 }}>{props.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, color: '#2a1e12', background: isActive ? 'linear-gradient(180deg, rgba(214,178,130,0.95), rgba(193,154,107,0.85))' : 'rgba(193,154,107,0.55)', borderRadius: 999, padding: '3px 9px' }}>
                {isActive ? 'Active' : 'Upcoming'}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(214,178,130,0.95)', letterSpacing: 1 }}>{stars}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,240,215,0.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users className="h-3.5 w-3.5" /> {props.totalParticipants} · {props.friendsCount} {props.friendsCount === 1 ? 'friend' : 'friends'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress (active only) */}
        {isActive && props.dayInChallenge && (
          <div style={{ marginTop: 14, borderRadius: 16, border: '0.5px solid rgba(193,154,107,0.18)', background: 'rgba(13,20,30,0.5)', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: FONT_PANCAKE, color: 'rgba(255,240,215,0.94)', fontSize: 20 }}>Day {props.dayInChallenge} <span style={{ fontSize: 14, color: 'rgba(193,154,107,0.7)' }}>/ {props.totalDays}</span></span>
              <span style={{ fontSize: 10, color: 'rgba(193,154,107,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>{pct}% complete</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,240,215,0.08)', borderRadius: 5, overflow: 'hidden', marginTop: 8 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, rgba(193,154,107,0.7), rgba(210,180,110,0.95))', borderRadius: 5 }} />
            </div>
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,240,215,0.72)', margin: '16px 2px', fontFamily: FONT_PANCAKE }}>{props.description}</p>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <button
            onClick={handleMarkComplete}
            disabled={isCompletedToday || isLoading}
            style={{
              height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT_PANCAKE, fontSize: 15, letterSpacing: '0.04em', cursor: isCompletedToday ? 'default' : 'pointer',
              border: isCompletedToday ? '0.5px solid rgba(99,196,122,0.4)' : 'none',
              background: isCompletedToday ? 'rgba(99,196,122,0.12)' : 'linear-gradient(180deg, rgba(214,178,130,0.92), rgba(193,154,107,0.82))',
              color: isCompletedToday ? 'rgba(99,196,122,0.95)' : '#2a1e12', fontWeight: 600,
            }}
          >
            {isLoading ? <SmileyRockLoader /> : isCompletedToday ? <><Check className="h-5 w-5" /> Completed Today</> : '✓ Mark Today Complete'}
          </button>
          <Link href="/snap-yoga" style={{ height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT_PANCAKE, fontSize: 15, letterSpacing: '0.04em', border: '0.5px solid rgba(193,154,107,0.3)', background: 'rgba(193,154,107,0.06)', color: 'rgba(255,240,215,0.85)', textDecoration: 'none' }}>
            <Video className="h-5 w-5" /> {props.analyzeLabel}
          </Link>
          <Link href={props.inviteLink} style={{ height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT_PANCAKE, fontSize: 15, letterSpacing: '0.04em', border: '0.5px solid rgba(193,154,107,0.3)', background: 'rgba(193,154,107,0.06)', color: 'rgba(255,240,215,0.85)', textDecoration: 'none' }}>
            <Users className="h-5 w-5" /> Invite Friends
          </Link>
        </div>

        {/* Friends */}
        <SectionHead>Friends in this Challenge</SectionHead>
        {props.friends.length > 0 ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {props.friends.map(f => (
              <div key={f.id} style={{ flex: '1 1 140px', borderRadius: 14, border: '0.5px solid rgba(193,154,107,0.18)', background: 'rgba(13,20,30,0.5)', padding: '14px 8px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px', background: 'rgba(193,154,107,0.2)', border: '2px solid rgba(193,154,107,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(214,178,130,0.95)', fontSize: 16 }}>{f.name.charAt(0)}</div>
                <div style={{ fontFamily: FONT_PANCAKE, fontSize: 14, color: 'rgba(255,240,215,0.92)' }}>{f.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(193,154,107,0.7)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Day {f.daysIn}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'rgba(255,240,215,0.5)', fontStyle: 'italic', textAlign: 'center' }}>Invite friends to join you in this challenge!</p>
        )}

        {/* Tutorials */}
        <SectionHead>Challenge Guide · Weekly Tutorials</SectionHead>
        {props.weeklyTutorials.map(week => (
          <div key={week.week}>
            <p style={{ fontFamily: FONT_PANCAKE, fontSize: 16, color: 'rgba(255,240,215,0.92)', margin: '14px 0 8px' }}>Week {week.week} · {week.title}</p>
            {week.videos.map(video => (
              <div key={video.day} style={{ borderRadius: 14, border: '0.5px solid rgba(193,154,107,0.18)', background: 'rgba(13,20,30,0.5)', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ aspectRatio: '16 / 9' }}>
                  <iframe width="100%" height="100%" src={video.embedUrl} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(214,178,130,0.9)', background: 'rgba(193,154,107,0.14)', border: '0.5px solid rgba(193,154,107,0.25)', borderRadius: 999, padding: '2px 8px' }}>Day {video.day}</span>
                  <div style={{ fontFamily: FONT_PANCAKE, fontSize: 15, color: 'rgba(255,240,215,0.92)', margin: '6px 0 3px' }}>{video.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,240,215,0.6)', lineHeight: 1.5 }}>{video.description}</div>
                </div>
              </div>
            ))}
          </div>
        ))}

      </div>
    </AppShell>
  );
}
