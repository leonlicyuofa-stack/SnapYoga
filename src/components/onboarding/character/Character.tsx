"use client";

import { useId } from 'react';
import {
  SHAPES, PEBBLE_STONES, inkFor, tintToward, luminance,
  type ShapeId, type MoodId, type ItemId,
} from './character-data';

const OUTLINE = 'stroke="#3A2B26" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
const PLUM = '#5A3D54';

// ── Faces (drawn in the blob's 0–200 space; eyes fixed at x84 / x116) ──────────
function eyesM(k: string, y: number) {
  return `<circle cx="84" cy="${y}" r="2.7" fill="${k}"/><circle cx="116" cy="${y}" r="2.7" fill="${k}"/>`;
}
function heartM(cx: number, cy: number, k: string) {
  return `<path d="M${cx},${cy + 3.5} C${cx - 4.6},${cy - 0.6} ${cx - 3.6},${cy - 4.8} ${cx},${cy - 2} C${cx + 3.6},${cy - 4.8} ${cx + 4.6},${cy - 0.6} ${cx},${cy + 3.5} Z" fill="${k}"/>`;
}
export function faceMarkup(mood: MoodId, k: string): string {
  const s = `stroke="${k}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (mood) {
    case 'happy':      return eyesM(k, 97) + `<path d="M91,104 Q100,112 109,104" ${s}/>`;
    case 'excited':    return `<path d="M79,94 L89,97 L79,100" ${s}/><path d="M121,94 L111,97 L121,100" ${s}/><path d="M91,104 Q100,113 109,104" ${s}/>`;
    case 'inlove':     return heartM(84, 95, k) + heartM(116, 95, k) + `<path d="M91,105 Q100,113 109,105" ${s}/>`;
    case 'neutral':    return eyesM(k, 97) + `<path d="M92,107 L108,107" ${s}/>`;
    case 'annoyed':    return `<path d="M78,94 L90,100" ${s}/><path d="M122,94 L110,100" ${s}/>` + eyesM(k, 100) + `<path d="M91,113 Q100,105 109,113" ${s}/>`;
    case 'down':       return eyesM(k, 98) + `<path d="M91,113 Q100,106 109,113" ${s}/>`;
    case 'frustrated': return `<path d="M78,90 L90,94" ${s}/><path d="M122,90 L110,94" ${s}/>` + eyesM(k, 100) + `<path d="M91,113 Q100,106 109,113" ${s}/>`;
    case 'surprised':  return eyesM(k, 96) + `<ellipse cx="100" cy="110" rx="5" ry="7" ${s}/>`;
    default: return '';
  }
}

// ── Items (drawn centred on x100 within y5–44 of the 200-space) ────────────────
export function itemArt(id: ItemId): string {
  switch (id) {
    case 'apple': return `<g><circle cx="100" cy="26" r="13" fill="#DA3B34" ${OUTLINE}/><path d="M100,15 Q102,9 106,9" fill="none" stroke="#6B4A2A" stroke-width="1.8" stroke-linecap="round"/><path d="M101,13 Q108,8 110,15 Q103,17 101,13 Z" fill="#7FAE87" ${OUTLINE}/></g>`;
    case 'cupcake': return `<g><path d="M89,27 L111,27 L108,41 Q100,43 92,41 Z" fill="#E9BE93" ${OUTLINE}/><line x1="95" y1="28" x2="95" y2="40" stroke="#C99B6E" stroke-width="1"/><line x1="100" y1="28" x2="100" y2="41" stroke="#C99B6E" stroke-width="1"/><line x1="105" y1="28" x2="105" y2="40" stroke="#C99B6E" stroke-width="1"/><path d="M87,27 Q87,20 93,20 Q94,13 100,14 Q106,13 107,20 Q113,20 113,27 Z" fill="#F5B8C4" ${OUTLINE}/><circle cx="100" cy="12" r="2" fill="#F5B8C4"/></g>`;
    case 'pizza': return `<g><path d="M100,10 L114,38 Q100,42 86,38 Z" fill="#F7D96A" ${OUTLINE}/><path d="M86,38 Q100,42 114,38" fill="none" stroke="#E0A85E" stroke-width="3" stroke-linecap="round"/><circle cx="97" cy="26" r="2.6" fill="#E0685C"/><circle cx="104" cy="32" r="2.4" fill="#E0685C"/></g>`;
    case 'burger': return `<g><path d="M85,20 Q100,8 115,20 Z" fill="#E7B36A" ${OUTLINE}/><path d="M84,22 Q100,28 116,22 L116,25 Q100,29 84,25 Z" fill="#8FC08A" ${OUTLINE}/><rect x="84" y="26" width="32" height="6" rx="2" fill="#8A5A3B" stroke="#3A2B26" stroke-width="1.4"/><path d="M85,32 L115,32 Q112,40 100,40 Q88,40 85,32 Z" fill="#E7B36A" ${OUTLINE}/></g>`;
    case 'egg': return `<g><path d="M100,10 Q120,10 118,26 Q124,40 106,38 Q96,46 88,36 Q76,36 82,24 Q80,10 100,10 Z" fill="#FFFDF5" ${OUTLINE}/><circle cx="100" cy="26" r="6.5" fill="#F7C948"/></g>`;
    case 'onigiri': return `<g><path d="M100,10 Q112,12 116,38 Q100,42 84,38 Q88,12 100,10 Z" fill="#FBF7EF" ${OUTLINE}/><rect x="92" y="32" width="16" height="8" rx="1.5" fill="#3C4A55" stroke="#3A2B26" stroke-width="1.2"/></g>`;
    case 'pineapple': return `<g><path d="M100,21 L90,11 Q97,13 100,20 Z" fill="#6FA84B" ${OUTLINE}/><path d="M100,21 L110,11 Q103,13 100,20 Z" fill="#6FA84B" ${OUTLINE}/><path d="M100,20 L100,5 Q105,11 103,20 Z" fill="#7CB255" ${OUTLINE}/><path d="M100,19 C110,19 114,26 114,32 C114,40 108,43 100,43 C92,43 86,40 86,32 C86,26 90,19 100,19 Z" fill="#F4C542" ${OUTLINE}/><g stroke="#B9862B" stroke-width="0.8"><line x1="90" y1="28" x2="104" y2="40"/><line x1="96" y1="24" x2="110" y2="36"/><line x1="110" y1="28" x2="96" y2="40"/><line x1="104" y1="24" x2="90" y2="36"/></g></g>`;
    case 'gelato': return `<g><path d="M92,27 L108,27 L100,44 Z" fill="#E7B36A" ${OUTLINE}/><g stroke="#C99B6E" stroke-width="0.9"><line x1="95" y1="31" x2="101" y2="42"/><line x1="105" y1="31" x2="99" y2="42"/></g><circle cx="100" cy="19" r="10" fill="#F3B9C4" ${OUTLINE}/></g>`;
    case 'boba': return `<g><path d="M90,20 L110,20 L107,42 Q100,44 93,42 Z" fill="#F1E0C4" ${OUTLINE}/><g fill="#6B4A34"><circle cx="96" cy="38" r="2"/><circle cx="101" cy="39" r="2"/><circle cx="105" cy="37" r="2"/><circle cx="99" cy="35" r="2"/></g><rect x="88" y="16" width="24" height="5" rx="2" fill="#F3EAD8" stroke="#3A2B26" stroke-width="1.4"/><path d="M104,17 L108,7" fill="none" stroke="#D98A9A" stroke-width="2.4" stroke-linecap="round"/></g>`;
    default: return '';
  }
}

/** Framed food icon for the Items grid cards. */
export function ItemIcon({ item, size = 36 }: { item: Exclude<ItemId, 'none'>; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-flex', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: `<svg width="${size}" height="${size}" viewBox="70 4 60 46">${itemArt(item)}</svg>` }}
    />
  );
}

// ── The character body (blob/stones + grain + face) ────────────────────────────
function bodyMarkup(shape: ShapeId, colour: string, mood: MoodId, faceless: boolean, uid: string): string {
  const clipId = `cclip-${uid}`, grainId = `cgrain-${uid}`;
  const ink = inkFor(colour);
  let clipPaths: string, fills: string, faceDy = 0;

  if (shape === 'pebble') {
    const dark = luminance(colour) < 0.5;
    const mid = tintToward(colour, dark ? 0.34 : 0.20);
    const top = tintToward(colour, dark ? 0.60 : 0.40);
    clipPaths = `<path d="${PEBBLE_STONES.base}"/><path d="${PEBBLE_STONES.mid}"/><path d="${PEBBLE_STONES.top}"/>`;
    fills = `<path d="${PEBBLE_STONES.base}" fill="${colour}"/><path d="${PEBBLE_STONES.mid}" fill="${mid}"/><path d="${PEBBLE_STONES.top}" fill="${top}"/>`;
    faceDy = 14;
  } else {
    const path = SHAPES[shape];
    clipPaths = `<path d="${path}"/>`;
    fills = `<path d="${path}" fill="${colour}"/>`;
  }

  return (
    `<svg width="100%" height="100%" viewBox="0 0 200 200">` +
    `<defs><clipPath id="${clipId}">${clipPaths}</clipPath>` +
    `<filter id="${grainId}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0"/></filter></defs>` +
    fills +
    `<rect x="-20" y="-40" width="260" height="260" filter="url(#${grainId})" clip-path="url(#${clipId})" opacity="0.11"/>` +
    (faceless ? '' : `<g transform="translate(0,${faceDy})">${faceMarkup(mood, ink)}</g>`) +
    `</svg>`
  );
}

interface CharacterProps {
  shape: ShapeId;
  colour: string;
  mood?: MoodId;
  size?: number;
  faceless?: boolean;
  animate?: boolean;
  className?: string;
}
export function Character({ shape, colour, mood = 'happy', size = 200, faceless = false, animate = false, className }: CharacterProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <span
      className={[animate ? 'sy-char-bob' : '', className || ''].join(' ').trim()}
      style={{ display: 'inline-block', width: size, height: size, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: bodyMarkup(shape, colour, mood, faceless, uid) }}
    />
  );
}

// ── Thought bubble — hand-drawn doubled outline + scribble tail loops ──────────
function scribble(cx: number, cy: number, r: number): string {
  const a = r * 1.45, b = r;
  return `M${cx},${cy - b} C${cx + a},${cy - b} ${cx + a},${cy + b} ${cx},${cy + b} C${cx - a},${cy + b} ${cx - a},${cy - b} ${cx + 2},${cy - b + 1} C${cx + a * 0.7},${cy - b * 0.4} ${cx + a * 0.4},${cy + b * 0.6} ${cx - 1},${cy + 1}`;
}
function bubbleMarkup(item: ItemId, uid: string): string {
  const rf1 = `brf1-${uid}`, rf2 = `brf2-${uid}`, cr = `bcr-${uid}`;
  const cloud = 'M42,62 C30,64 27,49 38,45 C32,27 53,19 60,32 C67,19 86,25 82,45 C94,48 90,63 79,62 C76,69 46,69 42,62 Z';
  const dbl = (d: string) =>
    `<path d="${d}" fill="none" stroke="${PLUM}" stroke-width="2.2" opacity="0.9" stroke-linecap="round" filter="url(#${rf1})"/>` +
    `<path d="${d}" fill="none" stroke="${PLUM}" stroke-width="1.3" opacity="0.6" stroke-linecap="round" filter="url(#${rf2})"/>`;
  const inner = item !== 'none'
    ? `<g filter="url(#${cr})" transform="translate(-22,21) scale(0.8)">${itemArt(item)}</g>`
    : `<text x="58" y="47" text-anchor="middle" font-size="26" fill="rgba(90,61,84,0.45)" font-family="Georgia,serif">?</text>`;
  return (
    `<svg width="110" height="98" viewBox="0 0 110 98" style="overflow:visible;display:block">` +
    `<defs>` +
    `<filter id="${rf1}" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="1" seed="7" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="3.4" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `<filter id="${rf2}" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="1" seed="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.5" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `<filter id="${cr}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency="0.09" numOctaves="1" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `</defs>` +
    `<path d="${cloud}" fill="#FFFFFF" filter="url(#${rf1})"/>` +
    `<path d="${cloud}" fill="none" stroke="${PLUM}" stroke-width="2.2" opacity="0.9" filter="url(#${rf1})"/>` +
    `<path d="${cloud}" fill="none" stroke="${PLUM}" stroke-width="1.3" opacity="0.6" filter="url(#${rf2})"/>` +
    dbl(scribble(40, 74, 3.8)) + dbl(scribble(31, 84, 2.5)) +
    inner + `</svg>`
  );
}
export function ThoughtBubble({ item, className, style }: { item: ItemId; className?: string; style?: React.CSSProperties }) {
  const uid = useId().replace(/:/g, '');
  if (item === 'none') return null;
  return (
    <span className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: bubbleMarkup(item, uid) }} />
  );
}
