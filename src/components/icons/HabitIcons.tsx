"use client";

import * as React from 'react';

/**
 * The five Daily Check-in habit icons — Practice, Hydrate, Rest, Sunlight,
 * Active — drawn as one cohesive, premium set on a 0 0 120 120 viewBox.
 *
 * Shared brand system:
 *  - Soft, rounded "puffy" forms; filled shapes carry a matching same-color
 *    round-join/round-cap stroke to inflate their edges.
 *  - Implied light from the upper-left (lighter gradient stop + a small cream
 *    highlight top-left of each form).
 *  - Palette: plum #320E3B/#4A2E6B, golds #C19A6B/#E9C46A/#F2C14E (outline
 *    #B98C34), cream #FFF0D7, lavender #C9B7E0/#E0D5F0. The lavender-blue cool
 *    tint (#9DB4D6/#7A93BC/#C6D6EE) is reserved for water only; coral #E8836A
 *    is used sparingly (flame tongue).
 *  - ~10px safe margin so nothing clips at 22px.
 *
 * Size is set by the consumer via the `size` prop. Every gradient/mask/filter
 * id is suffixed with a per-instance React.useId() so multiple copies on one
 * page never collide.
 */
type GlyphProps = { size?: number };

const svgProps = {
  fill: 'none' as const,
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
};

/** Practice — two overlapping moon-phase circles forming a gilded crescent. The hero mark. */
export function PracticeIcon({ size = 24 }: GlyphProps) {
  const uid = React.useId().replace(/:/g, '');
  const fill = `practiceFill-${uid}`;
  const mask = `practiceMask-${uid}`;
  const glow = `practiceGlow-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" {...svgProps}>
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF0D7" />
          <stop offset="0.5" stopColor="#E9C46A" />
          <stop offset="1" stopColor="#320E3B" />
        </linearGradient>
        {/* white shows the left disc, black subtracts the right circle → crescent */}
        <mask id={mask}>
          <circle cx="52" cy="60" r="33" fill="#fff" />
          <circle cx="73" cy="55" r="33" fill="#000" />
        </mask>
        <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* soft gold glow behind */}
      <circle cx="52" cy="60" r="33" fill="#E9C46A" opacity="0.3" filter={`url(#${glow})`} />
      {/* gilded crescent */}
      <circle cx="52" cy="60" r="33" fill={`url(#${fill})`} mask={`url(#${mask})`} />
      {/* thin gold rings on both moon-phase circles */}
      <circle cx="52" cy="60" r="33" fill="none" stroke="#C19A6B" strokeWidth="2.5" />
      <circle cx="73" cy="55" r="33" fill="none" stroke="#C19A6B" strokeWidth="2.5" opacity="0.85" />
      {/* upper-left cream highlight */}
      <ellipse cx="40" cy="45" rx="5" ry="7" fill="#FFF0D7" opacity="0.5" transform="rotate(-20 40 45)" />
    </svg>
  );
}

/** Hydrate — a single water droplet. The only cool-colored icon. */
export function HydrateIcon({ size = 24 }: GlyphProps) {
  const uid = React.useId().replace(/:/g, '');
  const fill = `hydrateFill-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" {...svgProps}>
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C6D6EE" />
          <stop offset="0.55" stopColor="#9DB4D6" />
          <stop offset="1" stopColor="#7A93BC" />
        </linearGradient>
      </defs>
      {/* teardrop: pointed top, rounded bottom */}
      <path
        d="M60 16 C74 40 90 58 90 74 a30 30 0 1 1 -60 0 C30 58 46 40 60 16 Z"
        fill={`url(#${fill})`} stroke="#7A93BC" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* lighter inner ripple curl */}
      <path d="M45 76 c6 9 24 9 30 0" fill="none" stroke="#C6D6EE" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      {/* single white glint, upper-left */}
      <ellipse cx="50" cy="52" rx="3.5" ry="6" fill="#fff" opacity="0.8" transform="rotate(20 50 52)" />
    </svg>
  );
}

/** Rest — a clean ring: solid gold-lavender top, dotted lower half. No "Zzz". */
export function RestIcon({ size = 24 }: GlyphProps) {
  const uid = React.useId().replace(/:/g, '');
  const grad = `restGrad-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" {...svgProps}>
      <defs>
        {/* lighter (cream-gold) at upper-left → lavender at right */}
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F4E7C0" />
          <stop offset="0.5" stopColor="#E9C46A" />
          <stop offset="1" stopColor="#C9B7E0" />
        </linearGradient>
      </defs>
      {/* solid top semicircle — split exactly at the horizontal diameter */}
      <path d="M26 60 A34 34 0 0 1 94 60" fill="none" stroke={`url(#${grad})`} strokeWidth="6" strokeLinecap="round" />
      {/* dotted lower semicircle, same radius */}
      <path d="M94 60 A34 34 0 0 1 26 60" fill="none" stroke="#C9B7E0" strokeWidth="5" strokeLinecap="round" strokeDasharray="0.1 13" />
    </svg>
  );
}

/** Sunlight — a gold sun disc ringed by 8 round-capped rays. */
export function SunlightIcon({ size = 24 }: GlyphProps) {
  const uid = React.useId().replace(/:/g, '');
  const grad = `sunGrad-${uid}`;
  const glow = `sunGlow-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" {...svgProps}>
      <defs>
        {/* light biased to the upper-left */}
        <radialGradient id={grad} cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#FFF0D7" />
          <stop offset="0.5" stopColor="#F2C14E" />
          <stop offset="1" stopColor="#E9C46A" />
        </radialGradient>
        <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* 8 rays: 4 cardinal + 4 diagonal, evenly spaced */}
      <g stroke="#F2C14E" strokeWidth="5.5" strokeLinecap="round">
        <line x1="60" y1="30" x2="60" y2="17" />
        <line x1="60" y1="90" x2="60" y2="103" />
        <line x1="30" y1="60" x2="17" y2="60" />
        <line x1="90" y1="60" x2="103" y2="60" />
        <line x1="81.2" y1="38.8" x2="90.5" y2="29.5" />
        <line x1="38.8" y1="38.8" x2="29.5" y2="29.5" />
        <line x1="81.2" y1="81.2" x2="90.5" y2="90.5" />
        <line x1="38.8" y1="81.2" x2="29.5" y2="90.5" />
      </g>
      {/* disc */}
      <circle cx="60" cy="60" r="22" fill={`url(#${grad})`} stroke="#B98C34" strokeWidth="2.5" filter={`url(#${glow})`} />
      {/* cream highlight, upper-left */}
      <ellipse cx="52" cy="52" rx="6" ry="5" fill="#FFF0D7" opacity="0.7" />
    </svg>
  );
}

/** Active — an upward flame: gold body, coral inner tongue, soft point. */
export function ActiveIcon({ size = 24 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" {...svgProps}>
      {/* outer flame body — soft point at top, rounded 24-radius base arc,
          with a kink at the right shoulder for movement */}
      <path
        d="M62 16 C56 38 40 44 40 66 A24 24 0 0 0 88 66 C88 50 78 46 74 34 C70 44 62 44 62 34 C62 28 62 22 62 16 Z"
        fill="#E9C46A" stroke="#B98C34" strokeWidth="4.5" strokeLinejoin="round"
      />
      {/* coral inner tongue — smaller nested flame echoing the outer silhouette */}
      <path
        d="M62 52 C58 62 52 66 52 76 A12 12 0 0 0 76 76 C76 66 70 64 68 56 C65 62 62 60 62 52 Z"
        fill="#E8836A"
      />
      {/* cream highlight, upper-left */}
      <ellipse cx="52" cy="48" rx="4" ry="6" fill="#FFF0D7" opacity="0.45" transform="rotate(-20 52 48)" />
    </svg>
  );
}
