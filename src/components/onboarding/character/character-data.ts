// Data + geometry for the "build-your-character" avatar creator.
// Blob outlines: round/flat/fuzzy are generated as smooth closed Catmull-Rom
// splines; cloud + flame are authored Béziers; pebble is a 3-stone cairn.

export type ShapeId = 'round' | 'flat' | 'cloud' | 'flame' | 'pebble' | 'fuzzy';
export type MoodId =
  | 'happy' | 'excited' | 'inlove' | 'neutral'
  | 'annoyed' | 'down' | 'frustrated' | 'surprised';
export type ItemId =
  | 'none' | 'apple' | 'cupcake' | 'pizza' | 'burger'
  | 'egg' | 'onigiri' | 'pineapple' | 'gelato' | 'boba';

export interface CharacterConfig {
  shape: ShapeId;
  colour: string; // hex from COLOURS
  mood: MoodId;
  item: ItemId;   // 'none' = no thought bubble
}

// ── Smooth closed spline from radii sampled at even angles ─────────────────────
function smoothClosedPath(pts: Array<[number, number]>): string {
  const n = pts.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += ` C ${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}, ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)}, ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
}
function blob(radii: number[], sx: number, sy: number, cx: number, cy: number): string {
  const n = radii.length;
  const pts = radii.map((r, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + r * sx * Math.cos(a), cy + r * sy * Math.sin(a)] as [number, number];
  });
  return smoothClosedPath(pts);
}

// Single-path shapes (pebble handled separately as a 3-stone stack).
export const SHAPES: Record<Exclude<ShapeId, 'pebble'>, string> = {
  round: blob([63, 62, 64, 63, 63, 64, 62, 63], 1, 1.10, 100, 99),
  flat:  blob([59, 60, 59, 60, 59, 60, 59, 60], 1, 0.53, 101, 105),
  cloud: 'M50,138 C28,136 26,108 48,100 C42,80 70,64 90,78 C102,60 134,62 138,86 C164,82 176,112 152,124 C156,142 122,148 100,144 C80,148 60,146 50,138 Z',
  flame: 'M100,26 C110,52 130,58 136,86 C144,120 122,158 100,162 C76,158 56,122 66,88 C72,62 90,56 100,26 Z',
  fuzzy: blob([68, 60, 68, 60, 68, 60, 68, 60, 68, 60, 68, 60, 68, 60, 68, 60, 68, 60], 1, 1.01, 101, 95),
};

export const PEBBLE_STONES = {
  base: 'M100,152 C58,152 40,132 42,108 C44,86 66,70 100,70 C134,70 156,86 158,108 C160,132 142,152 100,152 Z',
  mid:  'M100,72 C67,72 45,66 46,56 C47,47 70,43 100,44 C133,45 154,48 154,57 C154,67 133,72 100,72 Z',
  top:  'M100,44 C83,44 76,35 77,26 C78,17 88,13 100,13 C113,13 122,18 122,27 C123,36 117,44 100,44 Z',
};

export const SHAPE_LIST: Array<{ id: ShapeId; label: string }> = [
  { id: 'round', label: 'Round' },
  { id: 'flat', label: 'Flat' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'flame', label: 'Flame' },
  { id: 'pebble', label: 'Pebble' },
  { id: 'fuzzy', label: 'Fuzzy' },
];

// ── Colour palette (the character's own colours, not app chrome) ───────────────
export interface ColourDef { id: string; label: string; hex: string; }
export const COLOURS: ColourDef[] = [
  { id: 'navy',       label: 'Navy',       hex: '#374375' },
  { id: 'sky',        label: 'Sky',        hex: '#558E9B' },
  { id: 'maroon',     label: 'Maroon',     hex: '#895159' },
  { id: 'peach',      label: 'Peach',      hex: '#DFAEA1' },
  { id: 'cloud',      label: 'Cloud',      hex: '#FFFCF5' },
  { id: 'bubbles',    label: 'Bubbles',    hex: '#E8D6CA' },
  { id: 'blush',      label: 'Blush',      hex: '#EBCDC3' },
  { id: 'blackberry', label: 'Blackberry', hex: '#746770' },
  { id: 'sage',       label: 'Sage',       hex: '#CBCCBE' },
  { id: 'sandcastle', label: 'Sandcastle', hex: '#E0C3B5' },
  { id: 'storm',      label: 'Storm',      hex: '#A1A5AE' },
];
export const COLOUR_MAP: Record<string, ColourDef> = Object.fromEntries(COLOURS.map(c => [c.hex, c]));

export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
export const INK_DARK = '#320E3B';
export const INK_LIGHT = '#FFF6E9';
export function inkFor(hex: string): string {
  return luminance(hex) < 0.5 ? INK_LIGHT : INK_DARK;
}
// Lighten a hex toward white by t (0–1).
export function tintToward(hex: string, t: number): string {
  const h = hex.replace('#', '');
  const mix = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16);
    return Math.round(c + (255 - c) * t).toString(16).padStart(2, '0');
  };
  return '#' + mix(0) + mix(2) + mix(4);
}

export const MOODS: Array<{ id: MoodId; label: string }> = [
  { id: 'happy', label: 'Happy' }, { id: 'excited', label: 'Excited' },
  { id: 'inlove', label: 'In love' }, { id: 'neutral', label: 'Neutral' },
  { id: 'annoyed', label: 'Annoyed' }, { id: 'down', label: 'Down' },
  { id: 'frustrated', label: 'Frustrated' }, { id: 'surprised', label: 'Surprised' },
];

// Selectable food items (no 'none' — clear a thought by untapping the item).
export const ITEMS: Array<{ id: Exclude<ItemId, 'none'>; label: string }> = [
  { id: 'apple', label: 'Apple' }, { id: 'cupcake', label: 'Cupcake' },
  { id: 'pizza', label: 'Pizza' }, { id: 'burger', label: 'Burger' },
  { id: 'egg', label: 'Egg' }, { id: 'onigiri', label: 'Onigiri' },
  { id: 'pineapple', label: 'Pineapple' }, { id: 'gelato', label: 'Gelato' },
  { id: 'boba', label: 'Boba' },
];

export const DEFAULT_CHARACTER: CharacterConfig = {
  shape: 'round', colour: '#DFAEA1', mood: 'happy', item: 'none',
};

export const labelFor = {
  shape: (id: ShapeId) => SHAPE_LIST.find(s => s.id === id)?.label ?? id,
  colour: (hex: string) => COLOUR_MAP[hex]?.label ?? hex,
  mood: (id: MoodId) => MOODS.find(m => m.id === id)?.label ?? id,
  item: (id: ItemId) => id === 'none' ? 'None' : (ITEMS.find(i => i.id === id)?.label ?? id),
};
