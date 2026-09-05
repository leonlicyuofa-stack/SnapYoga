"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppShell } from '@/components/layout/app-shell';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { MoonPhaseRingLoader } from '@/components/layout/moon-phase-ring-loader';

const GOLD      = 'rgba(193,154,107';
const PARCHMENT = 'rgba(255,240,215';
const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
const FONT_SANS  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const FEATURES = [
  'Unlimited Pose Analysis',
  'Advanced AI Feedback',
  'Progress Tracking & History',
  'Exclusive Challenges',
];

// Brand tokens — gold leads dark, amethyst leads light. Never invert one into the other.
function tok(isDark: boolean) {
  return {
    heroTitle:  isDark ? `${PARCHMENT},0.92)` : 'rgba(255,248,235,0.96)',
    subhero:    isDark ? `${PARCHMENT},0.60)` : 'rgba(50,14,59,0.70)',
    text:       isDark ? `${PARCHMENT},0.82)` : 'rgba(50,14,59,0.82)',
    foot:       isDark ? `${PARCHMENT},0.44)` : 'rgba(50,14,59,0.55)',
    eyebrow:    isDark ? `${GOLD},0.85)`      : '#320E3B',
    price:      isDark ? `${PARCHMENT},0.92)` : '#320E3B',
    per:        isDark ? `${PARCHMENT},0.55)` : 'rgba(50,14,59,0.60)',
    save:       isDark ? `${GOLD},0.95)`      : '#320E3B',
    wordmark:   isDark ? `${PARCHMENT},0.92)` : 'rgba(255,248,235,0.96)',
    cardBg:     isDark ? `linear-gradient(160deg,${PARCHMENT},0.10),${PARCHMENT},0.03))` : 'linear-gradient(160deg,rgba(255,255,255,0.32),rgba(255,255,255,0.14))',
    cardBorder: isDark ? `${GOLD},0.18)`      : 'rgba(255,255,255,0.40)',
    cardHi:     isDark ? `${PARCHMENT},0.10)` : 'rgba(255,255,255,0.60)',
    cardShadow: isDark ? '0 8px 22px rgba(0,0,0,0.45)' : '0 8px 22px rgba(90,80,120,0.16)',
    recBorder:  isDark ? `${GOLD},0.55)`      : 'rgba(50,14,59,0.30)',
    recRing:    isDark ? `${GOLD},0.20)`      : 'rgba(50,14,59,0.12)',
    badgeBg:    isDark ? `${GOLD},0.92)`      : '#320E3B',
    badgeText:  isDark ? '#1a1210'            : 'rgba(255,248,235,0.96)',
    check:      isDark ? 'rgba(160,195,130,0.95)' : '#3B6D11',
    ctaStdBg:   isDark ? `${GOLD},0.16)`      : 'transparent',
    ctaStdBorder: isDark ? `${GOLD},0.45)`    : 'rgba(50,14,59,0.35)',
    ctaStdText: isDark ? `${PARCHMENT},0.92)` : '#320E3B',
    ctaRecBg:   isDark ? 'linear-gradient(180deg,#D6B282,#C19A6B)' : '#320E3B',
    ctaRecText: isDark ? '#1a1210'            : 'rgba(255,248,235,0.96)',
    orbitRing:  isDark ? `${GOLD},0.22)`      : 'rgba(255,255,255,0.30)',
    orbitDot:   isDark ? `${GOLD},0.80)`      : 'rgba(255,255,255,0.80)',
    badgeRingBg:     isDark ? `${GOLD},0.14)` : 'rgba(50,14,59,0.08)',
    badgeRingBorder: isDark ? `${GOLD},0.40)` : 'rgba(50,14,59,0.28)',
    crownStroke:     isDark ? `${GOLD},0.95)` : '#320E3B',
    premFeatBg:     isDark ? `${PARCHMENT},0.04)` : 'rgba(255,255,255,0.28)',
    premFeatBorder: isDark ? `${GOLD},0.14)`      : 'rgba(255,255,255,0.50)',
  };
}

function Wordmark({ color }: { color: string }) {
  return (
    <span style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 500, letterSpacing: '0.10em', color }}>
      SnapYoga
    </span>
  );
}

function Check({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function FeatureList({ t }: { t: ReturnType<typeof tok> }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0', display: 'flex', flexDirection: 'column', gap: 7, flexGrow: 1 }}>
      {FEATURES.map(f => (
        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: t.text }}>
          <Check color={t.check} /> {f}
        </li>
      ))}
    </ul>
  );
}

export default function UpgradePage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const t = tok(isDark);
  const router = useRouter();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<'monthly' | 'yearly' | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(firestore, 'users', user.uid))
      .then((snap) => {
        setSubscriptionStatus(snap.exists() ? (snap.data()?.subscriptionStatus ?? null) : null);
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
  }, [user]);

  const handleSubscribe = async (planId: 'monthly' | 'yearly') => {
    if (!user) return;
    setSubmittingPlan(planId);
    try {
      console.log('[Upgrade] Creating checkout session for plan:', planId);
      const functions = getFunctions(app);
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      const result = await createStripeCheckoutSession({ uid: user.uid, email: user.email, planId });
      const { sessionUrl } = result.data as { sessionUrl: string };
      console.log('[Upgrade] Redirecting to Stripe checkout');
      if (typeof window !== 'undefined') window.location.href = sessionUrl;
    } catch (error) {
      console.error('[Upgrade] Checkout error:', error);
      toast({ title: 'Error', description: 'Could not start checkout. Please try again.', variant: 'destructive' });
      setSubmittingPlan(null);
    }
  };

  const cardBase: React.CSSProperties = {
    borderRadius: 20,
    padding: '16px 15px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    background: t.cardBg,
    border: `0.5px solid ${t.cardBorder}`,
    boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}`,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  };

  const ctaBase: React.CSSProperties = {
    border: 0, borderRadius: 999, height: 44, width: '100%',
    fontFamily: FONT_SERIF, fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  };

  if (authLoading || loadingStatus) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-[60vh]">
          <MoonPhaseRingLoader />
        </div>
      </AppShell>
    );
  }

  // Brand lockup: wordmark with a quiet orbit echo behind it.
  const Lockup = (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: -14, width: 104, height: 104, borderRadius: '50%', border: `0.5px dashed ${t.orbitRing}` }}>
        <span style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: t.orbitDot }} />
      </div>
      <Wordmark color={t.wordmark} />
    </div>
  );

  if (subscriptionStatus === 'active') {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <div style={{ ...cardBase, maxWidth: 400, width: '100%', padding: '24px 20px', textAlign: 'center', alignItems: 'center', gap: 12 }}>
            {Lockup}
            <div style={{ width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.badgeRingBg, border: `0.5px solid ${t.badgeRingBorder}` }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={t.crownStroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
                <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-1.8 10H4.8L3 8z" />
              </svg>
            </div>
            <h1 style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 600, margin: 0, color: t.heroTitle }}>You&apos;re Premium</h1>
            <p style={{ fontSize: 12, color: t.subhero, margin: 0 }}>You have full access to every SnapYoga feature.</p>
            <div style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 14, background: t.premFeatBg, border: `0.5px solid ${t.premFeatBorder}` }}>
              <FeatureList t={t} />
            </div>
            <p style={{ fontSize: 10, color: t.foot, margin: '4px 0 0' }}>Manage or cancel anytime via your Stripe billing portal.</p>
            <button
              onClick={() => router.back()}
              style={{ ...ctaBase, background: t.ctaStdBg, border: `1px solid ${t.ctaStdBorder}`, color: t.ctaStdText, marginTop: 10 }}
            >
              Go back
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div style={{ width: '100%', maxWidth: 560 }}>

          {Lockup}
          <p style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 600, textAlign: 'center', margin: '2px 0 0', color: t.heroTitle }}>Unlock Premium</p>
          <p style={{ fontSize: 12, textAlign: 'center', margin: '3px 0 0', color: t.subhero }}>Choose the plan that works for you</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }} className="max-[430px]:!grid-cols-1">

            {/* Monthly */}
            <div style={cardBase}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 600, color: t.eyebrow, margin: 0, fontFamily: FONT_SANS }}>Monthly</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 5 }}>
                  <span style={{ fontFamily: FONT_SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1, color: t.price }}>$6.99</span>
                  <span style={{ fontSize: 11, color: t.per }}>/ mo</span>
                </div>
              </div>
              <FeatureList t={t} />
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={!!submittingPlan}
                style={{ ...ctaBase, background: t.ctaStdBg, border: `1px solid ${t.ctaStdBorder}`, color: t.ctaStdText, opacity: submittingPlan ? 0.6 : 1 }}
              >
                {submittingPlan === 'monthly' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Subscribe'}
              </button>
            </div>

            {/* Yearly (recommended) */}
            <div style={{ ...cardBase, border: `0.5px solid ${t.recBorder}`, boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}, 0 0 0 1px ${t.recRing}` }}>
              <span style={{ position: 'absolute', top: 12, right: 12, fontFamily: FONT_SERIF, fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: t.badgeBg, color: t.badgeText }}>
                Save 40%
              </span>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 600, color: t.eyebrow, margin: 0, fontFamily: FONT_SANS }}>Yearly</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 5 }}>
                  <span style={{ fontFamily: FONT_SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1, color: t.price }}>$49.99</span>
                  <span style={{ fontSize: 11, color: t.per }}>/ yr</span>
                </div>
                <p style={{ fontFamily: FONT_SERIF, fontSize: 12, fontStyle: 'italic', margin: '3px 0 0', color: t.save }}>~$4.17/mo · save $33.89</p>
              </div>
              <FeatureList t={t} />
              <button
                onClick={() => handleSubscribe('yearly')}
                disabled={!!submittingPlan}
                style={{ ...ctaBase, background: t.ctaRecBg, color: t.ctaRecText, opacity: submittingPlan ? 0.6 : 1 }}
              >
                {submittingPlan === 'yearly' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Subscribe'}
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 10, margin: '16px 0 0', color: t.foot }}>
            Cancel anytime · Secure payment via Stripe · 7-day free trial on monthly
          </p>
        </div>
      </div>
    </AppShell>
  );
}
