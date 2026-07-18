"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingThemeToggle } from '@/components/onboarding/onboarding-theme-toggle';
import { Character, ThoughtBubble, ItemIcon } from '@/components/onboarding/character/Character';
import { svgElementToPng } from '@/components/onboarding/character/raster';
import {
  SHAPE_LIST, COLOURS, MOODS, ITEMS, DEFAULT_CHARACTER, inkFor, labelFor,
  type CharacterConfig, type ShapeId, type MoodId, type ItemId,
} from '@/components/onboarding/character/character-data';

type Screen = 0 | 1 | 2 | 3 | 'review' | 'success';
const SUBSTEPS = ['Shape', 'Colour', 'Mood', 'Items'] as const;
const STEP_COPY: Record<number, { title: string; sub: string }> = {
  0: { title: 'Pick a shape',   sub: "This is your character's body." },
  1: { title: 'Pick a colour',  sub: 'Choose a hue that feels like you.' },
  2: { title: 'Pick a mood',    sub: 'How are you feeling today?' },
  3: { title: 'Pick a thought', sub: 'Optional — tap to add, tap again to clear.' },
};

export default function BuildCharacterPage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const { toast } = useToast();

  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER);
  const [screen, setScreen] = useState<Screen>(0);
  const [isSaving, setIsSaving] = useState(false);
  // Editing the avatar from the profile (or an already-onboarded user) should NOT
  // continue into the onboarding chain — finish returns to the profile instead.
  const [editContext, setEditContext] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edit') === '1') {
      setEditContext(true);
    }
  }, []);

  // Light = amethyst on lavender (per spec); dark = parchment/gold (tuned later).
  const txt = (a: number) => isDark ? `rgba(255,240,215,${a})` : `rgba(50,14,59,${a})`;
  const acc = (a: number) => isDark ? `rgba(193,154,107,${a})` : `rgba(50,14,59,${a})`;
  const titleColor = isDark ? 'rgba(255,240,215,0.92)' : '#320E3B';
  const subColor   = isDark ? 'rgba(193,154,107,0.66)' : 'rgba(44,14,54,0.62)';
  const cardBg = isDark
    ? 'linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))'
    : 'linear-gradient(160deg,rgba(255,255,255,0.34),rgba(255,255,255,0.16))';
  const cardBorder = isDark ? 'rgba(193,154,107,0.22)' : 'rgba(255,255,255,0.5)';
  // Soft drop shadow + inner top highlight.
  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)'
    : '0 10px 30px rgba(90,80,120,0.18), inset 0 1px 0 rgba(255,255,255,0.5)';
  const selBorder  = isDark ? 'rgba(214,178,130,0.95)' : '#320E3B';
  const selGlow    = isDark ? 'rgba(193,154,107,0.15)' : 'rgba(50,14,59,0.12)';
  const optBg      = isDark ? 'rgba(255,240,215,0.05)' : 'rgba(255,255,255,0.2)';
  const optBorder  = isDark ? 'rgba(193,154,107,0.2)'  : 'rgba(50,14,59,0.18)';
  const solid      = isDark ? 'rgba(214,178,130,0.95)' : '#320E3B';
  const onSolid    = isDark ? '#1a1210' : 'rgba(255,248,235,0.96)';

  useEffect(() => {
    if (user && !authLoading) {
      getDoc(doc(firestore, 'users', user.uid)).then(snap => {
        const data = snap.exists() ? snap.data() : null;
        const c = data?.character;
        if (c && c.shape && c.colour && c.mood) {
          setConfig({ shape: c.shape, colour: c.colour, mood: c.mood, item: c.item || 'none' });
        }
        // Already-onboarded users are editing, not onboarding.
        if (data?.onboardingCompleted) setEditContext(true);
      });
    }
  }, [user, authLoading]);

  const set = <K extends keyof CharacterConfig>(k: K, v: CharacterConfig[K]) =>
    setConfig(prev => ({ ...prev, [k]: v }));

  const saveAndFinish = async () => {
    if (!user) { toast({ title: 'Not logged in', description: 'Please sign in to continue.', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      const svg = exportRef.current?.querySelector('svg') as SVGSVGElement | null;
      const png = svg ? await svgElementToPng(svg, 256) : null;
      await createUserProfileDocument(user, { ...(png ? { avatar: png } : {}), character: config });
      setScreen('success');
    } catch (e) {
      console.error('Character save failed:', e);
      toast({ title: 'Save failed', description: 'Could not save your character. Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    if (screen === 0) { router.back(); return; }
    if (screen === 'review') { setScreen(3); return; }
    if (screen === 'success') { setScreen('review'); return; }
    setScreen((screen - 1) as Screen);
  };
  const goNext = () => {
    if (typeof screen === 'number' && screen < 3) { setScreen((screen + 1) as Screen); return; }
    if (screen === 3) { setScreen('review'); return; }
    if (screen === 'review') { saveAndFinish(); return; }
    if (screen === 'success') { router.push(editContext ? '/profile' : '/onboarding/yoga-goal'); }
  };

  const AvatarStage = ({ h = 236 }: { h?: number }) => (
    <div style={{ position: 'relative', width: 214, height: h, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
      <Character shape={config.shape} colour={config.colour} mood={config.mood} size={208} animate className="" />
      <ThoughtBubble item={config.item} isDark={isDark} style={{ position: 'absolute', top: -4, right: 2, zIndex: 3, pointerEvents: 'none' }} />
    </div>
  );

  const Nav = ({ loading = false }: { loading?: boolean }) => (
    <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
      <button type="button" onClick={goBack} aria-label="Back"
        className="rounded-full h-11 w-11 flex items-center justify-center transition-transform hover:scale-105"
        style={{ background: isDark ? 'rgba(0,0,0,0.30)' : 'rgba(255,255,255,0.18)', border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.20)' : 'rgba(50,14,59,0.30)'}`, color: txt(0.9) }}>
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button type="button" onClick={goNext} disabled={loading} aria-label="Continue"
        className="rounded-full h-11 w-11 flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-60"
        style={{ background: solid, color: onSolid, border: 'none', boxShadow: isDark ? '0 6px 16px rgba(0,0,0,0.32)' : '0 6px 16px rgba(50,30,60,0.28)' }}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
      </button>
    </div>
  );

  const optStyle = (on: boolean): React.CSSProperties => ({
    position: 'relative', borderRadius: 14, background: optBg,
    border: `2px solid ${on ? selBorder : optBorder}`,
    boxShadow: on ? `0 0 0 4px ${selGlow}` : 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 3, cursor: 'pointer', padding: '10px 6px', minHeight: 72,
  });
  const Badge = () => (
    <span style={{ position: 'absolute', bottom: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: solid, color: onSolid, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${isDark ? '#12100e' : 'rgba(255,255,255,0.85)'}` }}>
      <Check className="h-3 w-3" />
    </span>
  );
  const cap: React.CSSProperties = { fontSize: 9, color: txt(0.6) };

  return (
    <div className="relative min-h-screen">
      <OnboardingThemeToggle />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm">
          <OnboardingHeader steps={5} currentStep={0} className="mb-5" />

          {/* Hidden export frame — rasterized into the avatar PNG */}
          <div ref={exportRef} aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
            <Character shape={config.shape} colour={config.colour} mood={config.mood} size={256} />
          </div>

          <div style={{ borderRadius: 20, background: cardBg, border: `0.5px solid ${cardBorder}`, boxShadow: cardShadow, backdropFilter: 'blur(14px)', padding: '16px 16px 18px' }}>

            {typeof screen === 'number' && (
              <>
                <AvatarStage />
                <h2 style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 23, fontWeight: 600, color: titleColor, margin: '0 0 2px' }}>{STEP_COPY[screen].title}</h2>
                <p style={{ textAlign: 'center', fontSize: 13, color: subColor, margin: '0 0 16px' }}>{STEP_COPY[screen].sub}</p>

                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                  {SUBSTEPS.map((label, i) => {
                    const on = screen === i;
                    return (
                      <button key={label} type="button" onClick={() => setScreen(i as Screen)}
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13.5, letterSpacing: '0.02em', padding: '5px 14px', borderRadius: 999, cursor: 'pointer',
                          background: on ? solid : 'transparent', color: on ? onSolid : txt(0.6),
                          border: on ? 'none' : `0.5px solid ${acc(0.25)}`, fontWeight: on ? 600 : 500 }}>
                        {label}
                      </button>
                    );
                  })}
                </div>

                {screen === 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(80px,1fr))', gap: 10 }}>
                    {SHAPE_LIST.map(s => {
                      const on = config.shape === s.id;
                      return (
                        <button key={s.id} type="button" onClick={() => set('shape', s.id as ShapeId)} aria-pressed={on} aria-label={s.label} style={optStyle(on)}>
                          <Character shape={s.id} colour={config.colour} faceless size={64} />
                          <span style={cap}>{s.label}</span>{on && <Badge />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {screen === 1 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {COLOURS.map(c => {
                      const on = config.colour === c.hex;
                      return (
                        <button key={c.id} type="button" onClick={() => set('colour', c.hex)} aria-pressed={on} aria-label={c.label} title={c.label}
                          style={{ position: 'relative', width: 46, height: 46, borderRadius: '50%', background: c.hex, cursor: 'pointer',
                            border: `2px solid ${on ? selBorder : 'rgba(0,0,0,0.12)'}`, boxShadow: on ? `0 0 0 4px ${selGlow}` : 'none' }}>
                          {on && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: inkFor(c.hex) }}><Check className="h-4 w-4" /></span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {screen === 2 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(66px,1fr))', gap: 10 }}>
                    {MOODS.map(m => {
                      const on = config.mood === m.id;
                      return (
                        <button key={m.id} type="button" onClick={() => set('mood', m.id as MoodId)} aria-pressed={on} aria-label={m.label} title={m.label} style={optStyle(on)}>
                          <Character shape={config.shape} colour={config.colour} mood={m.id} size={50} />
                          <span style={cap}>{m.label}</span>{on && <Badge />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {screen === 3 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(60px,1fr))', gap: 10 }}>
                    {ITEMS.map(it => {
                      const on = config.item === it.id;
                      return (
                        <button key={it.id} type="button" onClick={() => set('item', (on ? 'none' : it.id) as ItemId)} aria-pressed={on} aria-label={it.label} title={it.label} style={optStyle(on)}>
                          <ItemIcon item={it.id} size={36} />
                          <span style={cap}>{it.label}</span>{on && <Badge />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <Nav />
              </>
            )}

            {screen === 'review' && (
              <>
                <AvatarStage />
                <h2 style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 23, fontWeight: 600, color: titleColor, margin: '0 0 2px' }}>Meet your character</h2>
                <p style={{ textAlign: 'center', fontSize: 13, color: subColor, margin: '0 0 16px' }}>Tweak anything before we continue.</p>
                <div style={{ borderRadius: 14, border: `0.5px solid ${optBorder}`, background: optBg, overflow: 'hidden' }}>
                  {([
                    { k: 'Shape', v: labelFor.shape(config.shape) },
                    { k: 'Colour', v: labelFor.colour(config.colour), swatch: config.colour },
                    { k: 'Mood', v: labelFor.mood(config.mood) },
                    { k: 'Items', v: labelFor.item(config.item) },
                  ] as const).map((row, i) => (
                    <div key={row.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderTop: i === 0 ? 'none' : `0.5px solid ${acc(0.12)}` }}>
                      <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: acc(0.6) }}>{row.k}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: txt(0.9) }}>
                        {'swatch' in row && row.swatch && <span style={{ width: 16, height: 16, borderRadius: '50%', background: row.swatch, border: '1px solid rgba(0,0,0,0.15)' }} />}
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
                <Nav loading={isSaving} />
              </>
            )}

            {screen === 'success' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <span style={{ width: 56, height: 56, borderRadius: '50%', background: solid, color: onSolid, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check className="h-8 w-8" /></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <Character shape={config.shape} colour={config.colour} mood={config.mood} size={110} animate />
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 23, fontWeight: 600, color: titleColor, margin: 0 }}>You&apos;re all set</h2>
                <p style={{ fontSize: 13, color: subColor, margin: '4px 0 0' }}>Let&apos;s continue verifying your account.</p>
                <Nav />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
