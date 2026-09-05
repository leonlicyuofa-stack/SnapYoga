"use client";

import { useTheme } from '@/contexts/ThemeContext';

/**
 * Moon-phase ring loader — eight moons evenly spaced around a circle, showing one
 * full lunar cycle (full at the left, waning clockwise through the top to a new
 * moon at the right, waxing back along the bottom). The moons light up one at a
 * time clockwise, like a calm circular progress indicator, then reset and loop.
 * Flat single-colour moons, theme-aware, reduced-motion aware. Editorial, not a
 * spinner.
 */

const C = 50;   // viewBox centre
const R = 36;   // ring radius
const r = 9;    // moon radius (R ≈ 4r)

// Illuminated fraction (0 new … 1 full) + lit limb for each of the 8 ring slots,
// starting at the left and waning clockwise. Waning half is lit on its left limb,
// waxing half on its right, so illumination mirrors across the ring.
const MOONS: { f: number; waxing?: boolean; kind?: 'full' | 'new' }[] = [
  { f: 1,    kind: 'full' },  // left — full
  { f: 0.75, waxing: false }, // top-left — waning gibbous
  { f: 0.5,  waxing: false }, // top — last quarter (half)
  { f: 0.25, waxing: false }, // top-right — waning crescent
  { f: 0,    kind: 'new' },   // right — new
  { f: 0.25, waxing: true },  // bottom-right — waxing crescent
  { f: 0.5,  waxing: true },  // bottom — first quarter (half)
  { f: 0.75, waxing: true },  // bottom-left — waxing gibbous
];

// Lit shape: a semicircle on the lit limb joined to a terminator ellipse whose
// horizontal radius grows with distance from half — bows out for gibbous, in for
// crescents, flat at exactly half.
function litPath(f: number, waxing: boolean) {
  const outerSweep = waxing ? 1 : 0;
  const gibbous = f > 0.5;
  const rx = +(r * Math.abs(2 * f - 1)).toFixed(2);
  const termSweep = waxing ? (gibbous ? 1 : 0) : (gibbous ? 0 : 1);
  return `M0 ${-r} A ${r} ${r} 0 0 ${outerSweep} 0 ${r} A ${rx} ${r} 0 0 ${termSweep} 0 ${-r} Z`;
}

// One keyframe per slot: dim (.16) until its turn arrives clockwise, then snap to
// full and hold. All share one duration so the ring fills, completes, and resets
// together each loop.
const keyframes = MOONS.map((_, i) => {
  const t = ((i / MOONS.length) * 100).toFixed(2);
  const on = Math.min((i / MOONS.length) * 100 + 0.5, 100).toFixed(2);
  return `@keyframes mpr-${i}{0%{opacity:.16}${t}%{opacity:.16}${on}%{opacity:1}100%{opacity:1}}`;
}).join('');

const STYLE = `${keyframes}.mpr-moon{opacity:.16}@media(prefers-reduced-motion:reduce){.mpr-moon{animation:none!important;opacity:1!important}}`;

interface MoonPhaseRingLoaderProps {
  className?: string;
  /** Italic serif caption below the ring; an empty string hides it. */
  text?: string;
  /** Scales the ~4.6s cycle (2 = twice as fast). */
  speed?: number;
}

export function MoonPhaseRingLoader({ className, text = 'Rolling out your mat', speed = 1 }: MoonPhaseRingLoaderProps) {
  const { isDark } = useTheme();
  const moon    = isDark ? '#EBD9BE' : '#26292F';
  const rim     = isDark ? 'rgba(235,217,190,0.22)' : 'rgba(38,41,47,0.22)';
  const caption = isDark ? 'rgba(235,217,190,0.6)'  : 'rgba(38,41,47,0.6)';
  const dur = (4.6 / (speed || 1)).toFixed(2);
  const label = text ? text.replace(/(\.\.\.|…)\s*$/, '') + '…' : '';

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <style>{STYLE}</style>
      <svg viewBox="0 0 100 100" role="status" aria-label={label || 'Loading'} style={{ width: '100%', maxWidth: 72, height: 'auto', display: 'block' }}>
        {MOONS.map((m, i) => {
          const a = Math.PI + (i * Math.PI) / 4; // start at the left, step clockwise
          const cx = +(C + R * Math.cos(a)).toFixed(2);
          const cy = +(C + R * Math.sin(a)).toFixed(2);
          const anim = { animation: `mpr-${i} ${dur}s linear infinite` };
          return (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              {/* faint rim holds each slot's place — the new moon keeps its spot */}
              <circle r={r} fill="none" stroke={rim} strokeWidth={1} />
              {m.kind === 'full' && <circle className="mpr-moon" r={r} fill={moon} style={anim} />}
              {!m.kind && <path className="mpr-moon" d={litPath(m.f, !!m.waxing)} fill={moon} style={anim} />}
            </g>
          );
        })}
      </svg>
      {label && (
        <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 18, color: caption, textAlign: 'center' }}>
          {label}
        </p>
      )}
    </div>
  );
}
