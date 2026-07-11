"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

const HOLD_MS = 2800;     // time the overlay stays up before it starts fading
const FADE_OUT_MS = 450;
const MOON_STAGGER_S = 0.2;
const ARC_WIDTH = 500;    // sum of moon sizes (464) + gaps (6×6) at full scale

// Illuminated fraction per moon, waxing crescent → full (centre) → waning crescent.
// Phases past the centre are mirrored (scaleX(-1)) so the lit side flips to waning.
const MOON_F = [0.16, 0.5, 0.8, 1, 0.8, 0.5, 0.16];

// Lit-region path for an illuminated fraction f on a 100×100 cell (disc r=40 at 50,50).
function moonPath(f: number): string {
  const rx = Math.abs(1 - 2 * f) * 40;
  const sweep = f < 0.5 ? 0 : 1;
  return `M50,10 A40 40 0 0 1 50 90 A${rx} 40 0 0 ${sweep} 50 10 Z`;
}

/**
 * Full-screen moon-phase splash for the homepage ("/"). A horizontal arc of 7 moon
 * phases (crescent → full → crescent) whose glow travels left-to-right as the loading
 * indicator, then the overlay fades away to reveal the homepage. The root layout
 * persists across in-app navigation, so this only runs on an actual homepage page load.
 */
export function PageLoader() {
  const { isDark } = useTheme();
  const pathname = usePathname();
  const [phase, setPhase] = useState<'hidden' | 'playing' | 'fading'>('hidden');
  const [reducedMotion, setReducedMotion] = useState(false);
  // Keep the fixed-geometry arc from clipping on narrow (mobile) viewports.
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Only act as the homepage splash — don't consume the animation on a deep-linked
    // internal route (e.g. a signed-in user redirected straight to /dashboard).
    if (pathname !== '/') return;

    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setScale(Math.min(1, (window.innerWidth - 24) / ARC_WIDTH));
    setPhase('playing');

    const fadeTimer = setTimeout(() => setPhase('fading'), HOLD_MS);
    const unmountTimer = setTimeout(() => setPhase('hidden'), HOLD_MS + FADE_OUT_MS);
    return () => { clearTimeout(fadeTimer); clearTimeout(unmountTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'hidden') return null;

  // Overlay + moon colours reuse the app's existing light/dark tokens (splash surface,
  // cream/parchment fill, amethyst/gold accent) rather than introducing new literals.
  const bg        = isDark ? '#0D1821' : '#9DA4B0';
  const moonColor = isDark ? 'rgba(255,240,215,0.72)' : 'rgba(255,248,235,0.9)';
  const accent    = isDark ? 'rgba(193,154,107,0.95)' : '#320E3B';
  const dim       = isDark ? 0.24 : 0.2;

  const fading = phase === 'fading';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg,
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        transition: `opacity ${FADE_OUT_MS}ms ease, background-color 500ms ease`,
        // Consumed by the glow keyframe so each moon dips to the theme's dim opacity.
        ['--moon-dim' as string]: dim,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, transform: `scale(${scale})`, transformOrigin: 'center' }}>
        {MOON_F.map((f, i) => {
          const d = Math.abs(i - 3);
          const size = 92 - d * 15;          // centre largest, ends smallest
          const dip = d * 20;                // ends dip downward → arc shape
          const waning = i > 3;
          const fill = i === 3 ? accent : moonColor;
          return (
            <svg
              key={i}
              width={size}
              height={size}
              viewBox="0 0 100 100"
              style={{
                marginTop: dip,
                opacity: reducedMotion ? 1 : `var(--moon-dim)` as unknown as number,
                animation: reducedMotion ? 'none' : `syMoonGlow 2.6s ease-in-out ${i * MOON_STAGGER_S}s infinite`,
              }}
            >
              {f === 1 ? (
                <circle cx="50" cy="50" r="40" style={{ fill, transition: 'fill 500ms ease' }} />
              ) : (
                <path
                  d={moonPath(f)}
                  style={{ fill, transition: 'fill 500ms ease' }}
                  transform={waning ? 'translate(100,0) scale(-1,1)' : undefined}
                />
              )}
            </svg>
          );
        })}
      </div>

      <style>{`
        @keyframes syMoonGlow {
          0%, 100% { opacity: var(--moon-dim); }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
