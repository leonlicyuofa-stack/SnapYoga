"use client";

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useTheme } from '@/contexts/ThemeContext';
import { allCollectibles, type Collectible } from '@/components/features/dashboard/rock-data';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import Link from 'next/link';

const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
const FONT_SANS  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const RARITY_RANK: Record<Collectible['rarity'], number> = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4 };

const CARD_HEIGHT = 256;

/** Tokens — amethyst leads light, gold leads dark. */
function tok(isDark: boolean) {
  return {
    heroTitle : isDark ? 'rgba(255,240,215,0.92)' : 'rgba(255,248,235,0.96)',
    eyebrow   : isDark ? 'rgba(193,154,107,0.9)'  : '#320E3B',
    sub       : isDark ? 'rgba(255,240,215,0.6)'  : 'rgba(50,14,59,0.70)',
    name      : isDark ? 'rgba(255,240,215,0.94)' : '#320E3B',
    cardBg    : isDark ? 'linear-gradient(160deg,rgba(255,240,215,0.10),rgba(255,240,215,0.03))' : 'linear-gradient(160deg,rgba(255,255,255,0.34),rgba(255,255,255,0.16))',
    cardBorder: isDark ? 'rgba(193,154,107,0.18)' : 'rgba(255,255,255,0.42)',
    cardHi    : isDark ? 'rgba(255,240,215,0.10)' : 'rgba(255,255,255,0.60)',
    cardShadow: isDark ? '0 8px 22px rgba(0,0,0,0.45)' : '0 8px 22px rgba(90,80,120,0.16)',
    discBg    : isDark ? 'rgba(255,240,215,0.06)' : 'rgba(255,255,255,0.5)',
    discBorder: isDark ? 'rgba(193,154,107,0.18)' : 'rgba(255,255,255,0.7)',
    pipOn     : isDark ? 'rgba(193,154,107,0.95)' : '#320E3B',
    pipOff    : isDark ? 'rgba(193,154,107,0.25)' : 'rgba(50,14,59,0.18)',
    gotColor  : isDark ? 'rgba(160,195,130,0.95)' : '#3B6D11',
    noColor   : isDark ? 'rgba(255,240,215,0.45)' : 'rgba(50,14,59,0.50)',
    noBg      : isDark ? 'rgba(255,240,215,0.05)' : 'rgba(50,14,59,0.06)',
    progTrack : isDark ? 'rgba(255,240,215,0.10)' : 'rgba(50,14,59,0.12)',
    progFill  : isDark ? 'linear-gradient(90deg,rgba(214,178,130,0.98),rgba(193,154,107,0.92))' : '#320E3B',
    backBg    : isDark ? 'rgba(193,154,107,0.14)' : '#320E3B',
    backBorder: isDark ? 'rgba(193,154,107,0.4)'  : 'rgba(50,14,59,0.4)',
    backColor : isDark ? 'rgba(255,240,215,0.9)'  : 'rgba(255,248,235,0.96)',
    // reverse face — the profile cover panel: amber evening in dark, amethyst in light
    faceBack  : isDark ? 'linear-gradient(160deg,#3A2D1E 0%,#2A2320 55%,#1E1A20 100%)' : 'linear-gradient(160deg,#3E2352,#320E3B)',
    faceBackLn: isDark ? 'rgba(193,154,107,0.34)' : 'rgba(255,248,235,0.30)',
    backInk   : isDark ? 'rgba(255,240,215,0.95)' : 'rgba(255,248,235,0.96)',
    backMuted : isDark ? 'rgba(255,240,215,0.68)' : 'rgba(255,248,235,0.72)',
  };
}

type T = ReturnType<typeof tok>;

function StatusPill({ collected, onBack, t }: { collected: boolean; onBack: boolean; t: T }) {
  const style: React.CSSProperties = onBack
    ? (collected
        ? { color: 'rgba(190,220,165,0.98)', background: 'rgba(120,155,95,0.22)' }
        : { color: t.backMuted, background: 'rgba(255,248,235,0.10)' })
    : (collected
        ? { color: t.gotColor, background: 'rgba(120,155,95,0.15)' }
        : { color: t.noColor, background: t.noBg });
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 999, padding: '4px 10px', marginTop: 5, fontFamily: FONT_SANS, ...style }}>
      {collected ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
      {collected ? 'Collected' : 'Locked'}
    </span>
  );
}

function CollectibleCard({ item, collected, t }: { item: Collectible; collected: boolean; t: T }) {
  const [flipped, setFlipped] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [dragDeg, setDragDeg] = React.useState<number | null>(null);
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const drag = React.useRef<{ x: number; y: number; w: number; live: boolean; id: number } | null>(null);
  const swipedAt = React.useRef(0);

  const rank = RARITY_RANK[item.rarity];
  const dragging = dragDeg !== null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, w: cardRef.current?.offsetWidth || 1, live: false, id: e.pointerId };
    // Capture straight away so a fast swipe can't hand the gesture to the next card.
    try { cardRef.current?.setPointerCapture(e.pointerId); } catch { /* not supported */ }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.live) {
      if (Math.abs(dx) < 6) return;
      // a mostly-vertical gesture is a page scroll, not a card turn
      if (Math.abs(dx) < Math.abs(e.clientY - d.y)) {
        drag.current = null;
        try { cardRef.current?.releasePointerCapture(d.id); } catch { /* already released */ }
        return;
      }
      d.live = true;
    }
    setDragDeg((dx / d.w) * 180);
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.live) return;
    const dx = e.clientX - d.x;
    setDragDeg(null);
    if (Math.abs(dx) > d.w * 0.28) setFlipped(f => !f);
    swipedAt.current = Date.now();   // stop the trailing click from undoing the swipe
  };

  const onClick = () => {
    if (Date.now() - swipedAt.current < 400) return;
    setFlipped(f => !f);
  };

  const angle = (flipped ? 180 : 0) + (hovered && !dragging ? 180 : 0) + (dragDeg ?? 0);

  const face: React.CSSProperties = {
    position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    padding: '16px 14px 14px',
    boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}`,
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${item.name}, ${item.rarity}, ${collected ? 'collected' : 'locked'}. Turn card for details.`}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(f => !f); } }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') setHovered(false); }}
      style={{
        perspective: 1100,
        cursor: dragging ? 'grabbing' : 'pointer',
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        className="sy-flip-inner"
        style={{
          position: 'relative', width: '100%', height: CARD_HEIGHT,
          transformStyle: 'preserve-3d',
          transform: `rotateY(${angle}deg)`,
          transition: dragging ? 'none' : 'transform 0.62s cubic-bezier(0.22,0.72,0.26,1)',
          willChange: 'transform',
        }}
      >
        {/* Front */}
        <div style={{ ...face, gap: 8, justifyContent: 'flex-start', background: t.cardBg, border: `0.5px solid ${t.cardBorder}`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', opacity: collected ? 1 : 0.78 }}>
          <div style={{ width: 84, height: 84, borderRadius: 16, overflow: 'hidden', flex: 'none', background: t.discBg, border: `0.5px solid ${t.discBorder}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: collected ? 'none' : 'grayscale(1)', opacity: collected ? 1 : 0.55 }}
            />
          </div>

          <p style={{ fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 600, lineHeight: 1.14, margin: '2px 0 0', color: t.name }}>{item.name}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: t.eyebrow, fontFamily: FONT_SANS }}>{item.rarity}</span>
            <span style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4].map(i => (
                <span key={i} style={{ width: 5, height: 5, transform: 'rotate(45deg)', borderRadius: 1, background: i <= rank ? t.pipOn : t.pipOff }} />
              ))}
            </span>
          </div>

          <StatusPill collected={collected} onBack={false} t={t} />

          <p style={{ marginTop: 'auto', fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: t.sub, opacity: 0.75, fontFamily: FONT_SANS }}>Swipe to turn</p>
        </div>

        {/* Back */}
        <div style={{ ...face, gap: 7, justifyContent: 'center', background: t.faceBack, border: `0.5px solid ${t.faceBackLn}`, transform: 'rotateY(180deg)', color: t.backInk }}>
          <p style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: t.backMuted, margin: 0, fontFamily: FONT_SANS }}>How to earn</p>
          <p style={{ fontSize: 12.5, lineHeight: 1.45, margin: 0, color: t.backInk, fontFamily: FONT_SANS }}>{item.description}</p>
          <span style={{ width: 34, height: 1, background: t.faceBackLn, margin: '2px 0' }} />
          <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.45, margin: 0, color: t.backMuted }}>&ldquo;{item.story}&rdquo;</p>
          <StatusPill collected={collected} onBack t={t} />
        </div>
      </div>
    </div>
  );
}

export default function YogaCollectionPage() {
  const { isDark } = useTheme();
  const t = tok(isDark);

  // Which items are collected (demo). Progress is derived from this.
  const collectedIds = ['welcome_mat', 'first_analysis_block', 'join_challenge_strap'];
  const collectedCount = allCollectibles.filter(c => collectedIds.includes(c.id)).length;
  const pct = Math.round((collectedCount / allCollectibles.length) * 100);

  return (
    <AppShell>
      {/* People who ask for less motion get an instant face swap, not a spin. */}
      <style>{`@media (prefers-reduced-motion: reduce){.sy-flip-inner{transition:none !important;}}`}</style>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 18px 90px' }}>

        {/* Header */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: 24 }}>
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            style={{ position: 'absolute', left: 0, top: 2, width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: t.backBg, border: `0.5px solid ${t.backBorder}`, color: t.backColor, textDecoration: 'none' }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600, color: t.eyebrow, margin: 0, fontFamily: FONT_SANS }}>SnapYoga · Collection</p>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 30, fontWeight: 600, color: t.heroTitle, margin: '4px 0 0' }}>The Yoga Collection</h1>
          <p style={{ fontSize: 13, color: t.sub, margin: '4px 0 0' }}>Swipe a card to see how it&rsquo;s earned.</p>

          {/* Progress */}
          <div style={{ maxWidth: 260, margin: '14px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.04em', color: t.sub, marginBottom: 5, fontFamily: FONT_SANS }}>
              <span>Collected</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{collectedCount} of {allCollectibles.length}</span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: t.progTrack, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: t.progFill, transition: 'width 0.9s ease' }} />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          {allCollectibles.map(item => (
            <CollectibleCard
              key={item.id}
              item={item}
              collected={collectedIds.includes(item.id)}
              t={t}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
