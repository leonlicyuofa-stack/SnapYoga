import type { SVGProps } from 'react';

/**
 * The four "Pick your path" icons for the onboarding Yoga-goals step, drawn as
 * simple line art on a 0 0 120 120 canvas so the set reads as one family.
 * `ink` is the stroke/fill colour (cream on dark, deep purple on light) and is
 * supplied by the caller so the icons follow the active theme. Strength also
 * takes a fainter `shadow` colour for the pebble under the cairn.
 * Each icon stretches to fill its square art panel.
 */
type PathIconProps = { ink: string; shadow?: string };

const base: SVGProps<SVGSVGElement> = {
  width: '100%',
  height: '100%',
  viewBox: '0 0 120 120',
  fill: 'none',
  'aria-hidden': true,
};

/** Flexibility — two facing spiral curls forming an S, with two short tails on top. */
export function FlexibilityIcon({ ink }: PathIconProps) {
  return (
    <svg {...base} stroke={ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 48 C 46 30, 28 34, 26 48 C 24 60, 34 66, 44 64 C 30 70, 30 86, 44 88 C 56 89, 60 76, 60 66" />
      <path d="M60 48 C 74 30, 92 34, 94 48 C 96 60, 86 66, 76 64 C 90 70, 90 86, 76 88 C 64 89, 60 76, 60 66" />
      <path d="M60 48 C 57 40, 52 34, 46 31" strokeWidth={2.4} />
      <path d="M60 48 C 63 40, 68 34, 74 31" strokeWidth={2.4} />
    </svg>
  );
}

/** Mobility — two hooked strokes interlocking in the middle like curling waves. */
export function MobilityIcon({ ink }: PathIconProps) {
  return (
    <svg {...base} stroke={ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 60 C 40 40, 26 52, 32 68 C 37 80, 54 80, 58 64" />
      <path d="M60 60 C 80 80, 94 68, 88 52 C 83 40, 66 40, 62 56" />
    </svg>
  );
}

/** Balance — one wavy arch with two small dots resting beneath it. */
export function BalanceIcon({ ink }: PathIconProps) {
  return (
    <svg {...base} stroke={ink} strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 58 C 33 47, 42 47, 50 58 C 58 69, 62 69, 70 58 C 78 47, 87 47, 96 58" strokeWidth={4.5} />
      <circle cx="41" cy="66" r="3.6" fill={ink} stroke="none" />
      <circle cx="79" cy="66" r="3.6" fill={ink} stroke="none" />
    </svg>
  );
}

/** Strength — a stack of three balanced stones (a cairn) with a soft shadow. Solid fills. */
export function StrengthIcon({ ink, shadow }: PathIconProps) {
  return (
    <svg {...base} stroke="none">
      <ellipse cx="60" cy="30" rx="9" ry="11" fill={ink} />
      <path d="M60 44 C 73 47, 79 60, 74 65 C 66 70, 54 70, 46 65 C 41 60, 47 47, 60 44 Z" fill={ink} />
      <path d="M60 70 C 82 70, 92 78, 90 84 C 87 92, 33 92, 30 84 C 28 78, 38 70, 60 70 Z" fill={ink} />
      <ellipse cx="60" cy="99" rx="26" ry="3.5" fill={shadow} />
    </svg>
  );
}
