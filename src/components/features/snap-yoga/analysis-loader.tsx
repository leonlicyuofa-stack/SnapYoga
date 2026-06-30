"use client";
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getScoreLevel } from './pose-analysis-card';

const RADIUS = 60;
const STROKE = 6;
const CIRC = 2 * Math.PI * RADIUS;

// Reveal timeline (seconds from when the real score arrives)
const A_END = 0.5;          // ease ring up to 100%
const COPY_FADE_START = 0.5;
const COPY_FADE_END = 0.9;  // loading copy must finish fading before the label appears
const REVEAL_START = 0.9;
const REVEAL_END = 1.6;      // ring eases back to score, label + colour fade in
const DONE_AT = 2.1;         // brief hold on the settled score, then advance

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const parseRGB = (c: string): [number, number, number] => {
  const m = c.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
};

interface AnalysisLoaderProps {
  /** Real score (0–100) once the analysis resolves; null/undefined while loading. */
  score?: number | null;
  /** Fired once the score-reveal animation has settled. */
  onComplete?: () => void;
}

export function AnalysisLoader({ score = null, onComplete }: AnalysisLoaderProps) {
  const { isDark } = useTheme();
  const accentRGB: [number, number, number] = isDark ? [193, 154, 107] : [50, 14, 59];
  const accent = (a: number) => `rgba(${accentRGB[0]},${accentRGB[1]},${accentRGB[2]},${a})`;
  const numColor = isDark ? 'rgba(255,240,215,0.94)' : 'rgba(50,14,59,0.95)';
  const copyColor = isDark ? 'rgba(255,240,215,0.70)' : 'rgba(50,14,59,0.72)';
  const trackColor = isDark ? 'rgba(255,240,215,0.08)' : 'rgba(50,14,59,0.10)';

  const level = score != null ? getScoreLevel(score) : null;
  const levelRGB = level ? parseRGB(level.color) : accentRGB;

  const [vals, setVals] = useState({ pct: 0, copy: 1, reveal: 0, color: 0 });

  const animRef = useRef({ pct: 0, pctAtRevealStart: 0 });
  const scoreRef = useRef(score);
  const onCompleteRef = useRef(onComplete);
  const revealStartRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const a = animRef.current;
      const real = scoreRef.current;
      let copy = 1, reveal = 0, color = 0;

      if (real == null) {
        // Loading: ease asymptotically toward ~90% and hold there.
        a.pct += (90 - a.pct) * (1 - Math.exp(-dt * 1.1));
      } else {
        if (revealStartRef.current == null) {
          revealStartRef.current = now;
          a.pctAtRevealStart = a.pct;
        }
        const e = (now - revealStartRef.current) / 1000;
        if (e <= A_END) {
          a.pct = lerp(a.pctAtRevealStart, 100, easeOutCubic(clamp(e / A_END, 0, 1)));
        } else if (e < REVEAL_END) {
          const r = clamp((e - REVEAL_START) / (REVEAL_END - REVEAL_START), 0, 1);
          a.pct = lerp(100, real, easeInOut(r));
          copy = 1 - clamp((e - COPY_FADE_START) / (COPY_FADE_END - COPY_FADE_START), 0, 1);
          reveal = r;
          color = r;
        } else {
          a.pct = real; copy = 0; reveal = 1; color = 1;
          if (e >= DONE_AT && !doneRef.current) {
            doneRef.current = true;
            onCompleteRef.current?.();
          }
        }
      }

      setVals({ pct: a.pct, copy, reveal, color });
      if (!doneRef.current) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const strokeColor = `rgba(${Math.round(lerp(accentRGB[0], levelRGB[0], vals.color))},${Math.round(lerp(accentRGB[1], levelRGB[1], vals.color))},${Math.round(lerp(accentRGB[2], levelRGB[2], vals.color))},0.92)`;
  const offset = CIRC * (1 - clamp(vals.pct, 0, 100) / 100);

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', gap: 8, position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');
        @keyframes syBreath { 0%,100% { transform: scale(0.9); opacity: 0.65; } 50% { transform: scale(1.12); opacity: 1; } }
        .sy-loader-blob { animation: syBreath 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .sy-loader-blob { animation: none; } }
      `}</style>

      <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Soft breathing glow behind the ring */}
        <div
          className="sy-loader-blob"
          aria-hidden="true"
          style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${accent(0.20)} 0%, ${accent(0.06)} 45%, transparent 70%)`, filter: 'blur(22px)', zIndex: 0 }}
        />

        <svg width="200" height="200" viewBox="0 0 140 140" style={{ position: 'relative', zIndex: 1 }}>
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke={trackColor} strokeWidth={STROKE} />
          <circle
            cx="70" cy="70" r={RADIUS} fill="none"
            stroke={strokeColor} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
          />
        </svg>

        {/* Centre number + /100 */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 46, fontWeight: 600, color: numColor, lineHeight: 1 }}>
            {Math.round(clamp(vals.pct, 0, 100))}
          </span>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 500, color: numColor, opacity: vals.reveal * 0.55, marginLeft: 2, alignSelf: 'flex-start', marginTop: 6 }}>
            /100
          </span>
        </div>
      </div>

      {/* Loading copy ⇄ score-level label (cross-fade, never both at once) */}
      <div style={{ position: 'relative', height: 26, width: '100%', marginTop: 14 }}>
        <p style={{ position: 'absolute', inset: 0, textAlign: 'center', margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontStyle: 'italic', letterSpacing: '0.04em', color: copyColor, opacity: vals.copy }}>
          Finding the breath in your pose…
        </p>
        {level && (
          <p style={{ position: 'absolute', inset: 0, textAlign: 'center', margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 600, fontStyle: 'italic', color: level.color, opacity: vals.reveal }}>
            {level.label}
          </p>
        )}
      </div>
    </div>
  );
}
