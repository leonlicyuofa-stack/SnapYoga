"use client";

import * as React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Three "system signal" glyphs for the dashboard stats chips, drawn as filled
 * kawaii-style SVGs on a 0 0 120 120 viewBox. Shared traits: soft rounded
 * silhouettes (fill + matching round-join/round-cap stroke to puff the edges),
 * a two-tone body, tiny white sparkle accents, and the brand palette.
 * Render at any size via the `size` prop.
 */
type GlyphProps = { size?: number };

/** Streak — plump faceless waxing crescent ("nights of practice kept alight"). */
export function MoonStreakIcon({ size = 28 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Body — thick matching round stroke rounds off the horn tips */}
      <path
        d="M74 20 C44 22 24 40 24 62 C24 84 44 102 74 102 C56 92 48 78 48 61 C48 44 56 30 74 20 Z"
        fill="#E7D19A" stroke="#E7D19A" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Inner highlight */}
      <path
        d="M70 27 C48 31 31 46 31 62 C31 79 48 94 70 96 C56 86 47 76 47 61 C47 46 57 34 70 27 Z"
        fill="#F4E7C0" opacity=".85"
      />
      {/* Sparkles */}
      <circle cx="41" cy="46" r="1.5" fill="#fff" opacity=".7" />
      <circle cx="37" cy="66" r="1.3" fill="#fff" opacity=".6" />
      <circle cx="50" cy="58" r="1.1" fill="#fff" opacity=".5" />
      <path d="M38 40 q-7 9 -8 20" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

/**
 * Poses — two equal, overlapping circles (Venn-style): the left one is outline
 * only, the right one is filled with a top-left→bottom-right purple gradient and
 * sits in front. Outline follows the theme — gold on dark, deep purple on light;
 * the purple fill is identical in both. React.useId() gives every rendered copy a
 * unique gradient id so multiple copies on one page never clash.
 */
export function MoonSalutationIcon({ size = 28 }: GlyphProps) {
  const { isDark } = useTheme();
  const grad = `posesBody-${React.useId().replace(/:/g, '')}`;
  const outline = isDark ? '#E9C46A' : '#4A2E6B';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="30" y1="26" x2="96" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8A66B8" />
          <stop offset="1" stopColor="#4A2E6B" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="60" r="33" fill="none" stroke={outline} strokeWidth="3.5" />
      <circle cx="74" cy="60" r="33" fill={`url(#${grad})`} stroke={outline} strokeWidth="3.5" />
    </svg>
  );
}

/** Scores — pillow-soft faceless five-point star for session results. */
export function PuffyStarIcon({ size = 28 }: GlyphProps) {
  // Unique gradient id per instance so multiple stars on one page don't collide.
  const gid = `starRefl-${React.useId()}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCEFC8" stopOpacity=".92" />
          <stop offset="100%" stopColor="#FCEFC8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Body — wide round-joined stroke inflates points and valleys into pillow curves */}
      <path
        d="M60 26 L69.99 46.25 L92.34 49.5 L76.17 65.25 L79.98 87.5 L60 77 L40.02 87.5 L43.83 65.25 L27.66 49.5 L50.01 46.25 Z"
        fill="#E9B23F" stroke="#E9B23F" strokeWidth="26" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Reflection — light catching one face */}
      <ellipse cx="48" cy="53" rx="21" ry="18" fill={`url(#${gid})`} />
      {/* Single four-point glint */}
      <path
        d="M45 44 C46.3 50 47.8 51.5 54 52.8 C47.8 54.1 46.3 55.6 45 61.6 C43.7 55.6 42.2 54.1 36 52.8 C42.2 51.5 43.7 50 45 44 Z"
        fill="#FFF8E4"
      />
    </svg>
  );
}
