// Moon-phase math, phase→practice mapping, and the daily yoga-collection prize pool.
// Pure helpers (no external deps) so they can run on client or server.

export interface MoonPhase {
  index: number;   // 0..7
  name: string;
  icon: string;    // moon emoji
  note: string;    // short yogic guidance
}

const PHASES: Omit<MoonPhase, 'index'>[] = [
  { name: 'New Moon',        icon: '🌑', note: 'Set intentions — soft, inward, restorative practice.' },
  { name: 'Waxing Crescent', icon: '🌒', note: 'Build gently — easy flow and steady breath.' },
  { name: 'First Quarter',   icon: '🌓', note: 'Take action — stronger standing poses and flow.' },
  { name: 'Waxing Gibbous',  icon: '🌔', note: 'Refine — balance, focus, and hip openers.' },
  { name: 'Full Moon',       icon: '🌕', note: 'Peak energy — stay grounded, ease off deep inversions.' },
  { name: 'Waning Gibbous',  icon: '🌖', note: 'Release — yin, forward folds, and hip openers.' },
  { name: 'Last Quarter',    icon: '🌗', note: 'Let go — slow flow, gentle twists, and breathwork.' },
  { name: 'Waning Crescent', icon: '🌘', note: 'Rest — deeply restorative practice and stillness.' },
];

const SYNODIC_MONTH = 29.530588853; // days
// A reference new moon: 2000-01-06 18:14 UTC.
const REFERENCE_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

/** Astronomical moon phase for a given date (8-phase resolution). */
export function getMoonPhase(date: Date): MoonPhase {
  const days = (date.getTime() - REFERENCE_NEW_MOON) / 86_400_000;
  let age = days % SYNODIC_MONTH;
  if (age < 0) age += SYNODIC_MONTH;
  const fraction = age / SYNODIC_MONTH;          // 0..1 through the cycle
  const index = Math.round(fraction * 8) % 8;    // nearest of 8 phases
  return { index, ...PHASES[index] };
}

export interface Practice {
  icon: string;
  name: string;
}

// Three suggested practices per phase (curated, yoga-aligned).
const PRACTICES_BY_PHASE: Practice[][] = [
  [{ icon: '🛌', name: 'Restorative' }, { icon: '🧘', name: 'Yin' }, { icon: '🪷', name: 'Meditation' }],            // New
  [{ icon: '🧘', name: 'Gentle Hatha' }, { icon: '🌅', name: 'Sun Salutation A' }, { icon: '🌬️', name: 'Breathwork' }], // Waxing Crescent
  [{ icon: '🔥', name: 'Vinyasa Flow' }, { icon: '🧍', name: 'Standing poses' }, { icon: '💪', name: 'Core' }],        // First Quarter
  [{ icon: '🧘', name: 'Hatha' }, { icon: '🤸', name: 'Balance' }, { icon: '🦋', name: 'Hip openers' }],              // Waxing Gibbous
  [{ icon: '🧘', name: 'Gentle Hatha' }, { icon: '🌙', name: 'Chandra Namaskar' }, { icon: '🛌', name: 'Restorative' }], // Full
  [{ icon: '🧘', name: 'Yin' }, { icon: '🙇', name: 'Forward folds' }, { icon: '🦋', name: 'Hip openers' }],          // Waning Gibbous
  [{ icon: '🌀', name: 'Slow Flow' }, { icon: '🔄', name: 'Gentle twists' }, { icon: '🌬️', name: 'Pranayama' }],      // Last Quarter
  [{ icon: '🛌', name: 'Restorative' }, { icon: '😴', name: 'Yoga Nidra' }, { icon: '🪷', name: 'Meditation' }],       // Waning Crescent
];

export function getSuggestedPractices(phaseIndex: number): Practice[] {
  return PRACTICES_BY_PHASE[phaseIndex % 8];
}

export interface Prize {
  id: string;
  name: string;
  img: string; // spaces pre-encoded for <img src>
}

// Yoga-collection prize pool (the EQ_ product art in /public/images).
export const PRIZE_POOL: Prize[] = [
  { id: 'mat',     name: 'Yoga Mat',           img: '/images/EQ_Yoga%20Matt.png' },
  { id: 'block',   name: 'Yoga Block',         img: '/images/EQ_Yoga_Block.png' },
  { id: 'strap',   name: 'Yoga Strap',         img: '/images/EQ_Yoga_Strap.png' },
  { id: 'wheel',   name: 'Yoga Wheel',         img: '/images/EQ_Yoga_Wheel.png' },
  { id: 'socks',   name: 'Grip Socks',         img: '/images/EQ_Yoga_Grip_Socks.png' },
  { id: 'towel',   name: 'Yoga Towel',         img: '/images/EQ_Yoga_Towels.png' },
  { id: 'bottle',  name: 'Water Bottle',       img: '/images/EQ_Yoga%20Bottle.png' },
  { id: 'cushion', name: 'Meditation Cushion', img: '/images/EQ_Meditation%20Cushion.png' },
  { id: 'ball',    name: 'Stability Ball',     img: '/images/EQ_Yoga_Stability%20Ball.png' },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic prize for a given user+date, so the same day always yields the same draw. */
export function pickPrizeForDate(seed: string, dateStr: string): Prize {
  return PRIZE_POOL[hashString(`${seed}|${dateStr}`) % PRIZE_POOL.length];
}

export function getPrizeById(id: string): Prize | undefined {
  return PRIZE_POOL.find(p => p.id === id);
}
