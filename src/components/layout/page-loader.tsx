"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

const WORD = 'SnapYoga';
const LETTER_STAGGER_MS = 75;
const LETTER_DURATION_MS = 550;
const HOLD_MS = 2800;   // total time the overlay stays up before it starts fading
const FADE_OUT_MS = 850;
const BREATHE_DELAY_MS = (WORD.length - 1) * LETTER_STAGGER_MS + LETTER_DURATION_MS;

/**
 * Full-screen wordmark splash for the homepage ("/"). Plays once when the homepage
 * document loads (before sign-in), then fades away to reveal the splash underneath.
 * The root layout persists across in-app navigation, so this only runs on an actual
 * homepage page load — it never replays while moving around inside the app.
 */
export function PageLoader() {
  const { isDark } = useTheme();
  const pathname = usePathname();
  const [phase, setPhase] = useState<'hidden' | 'playing' | 'fading'>('hidden');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Only act as the homepage splash — don't consume the animation on a deep-linked
    // internal route (e.g. a signed-in user redirected straight to /dashboard).
    if (pathname !== '/') return;

    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setPhase('playing');

    const fadeTimer = setTimeout(() => setPhase('fading'), HOLD_MS);
    const unmountTimer = setTimeout(() => setPhase('hidden'), HOLD_MS + FADE_OUT_MS);
    return () => { clearTimeout(fadeTimer); clearTimeout(unmountTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'hidden') return null;

  // Overlay + wordmark colors reuse the app's existing light/dark tokens (splash gradient
  // stops + the standing "cream hero title" / "parchment dark text" colors) rather than
  // introducing new literals.
  const bg        = isDark ? '#0D1821' : '#9DA4B0';
  const wordColor = isDark ? 'rgba(255,240,215,0.92)' : 'rgba(255,248,235,0.96)';
  const ringColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.30)';
  const lineTrack = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)';
  const lineFill  = isDark ? 'rgba(255,240,215,0.55)' : 'rgba(255,248,235,0.85)';

  const fading = phase === 'fading';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg,
        opacity: fading ? 0 : 1,
        transform: fading ? 'scale(1.04)' : 'scale(1)',
        transition: `opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease`,
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {!reducedMotion && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 130, height: 130, borderRadius: '50%',
          border: `1px solid ${ringColor}`,
          transform: 'translate(-50%,-50%) scale(0.6)',
          animation: 'syLoaderRing 3.4s ease-in-out infinite',
        }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            // Match the homepage wordmark exactly so the mark reads identically as the
            // splash fades to reveal it (same family reference, weight and tracking).
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400,
            fontSize: 28,
            letterSpacing: '0.08em',
            color: wordColor,
            animation: reducedMotion ? 'none' : 'syLoaderBreathe 3.4s ease-in-out infinite',
            animationDelay: reducedMotion ? undefined : `${BREATHE_DELAY_MS}ms`,
          }}
        >
          {WORD.split('').map((ch, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: 0,
                animation: reducedMotion ? 'syLoaderFadeIn 0.6s ease forwards' : 'syLoaderLetterIn 0.55s ease forwards',
                animationDelay: reducedMotion ? '0ms' : `${i * LETTER_STAGGER_MS}ms`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        {!reducedMotion && (
          <div style={{ width: 130, height: 2, borderRadius: 2, background: lineTrack, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: 0, background: lineFill, borderRadius: 2,
              animation: 'syLoaderFill 2.6s ease-out forwards',
            }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes syLoaderLetterIn {
          from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes syLoaderFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes syLoaderBreathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.055); }
        }
        @keyframes syLoaderRing {
          0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(1.9); opacity: 0; }
        }
        @keyframes syLoaderFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
