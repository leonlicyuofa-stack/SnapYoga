"use client";

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useTheme } from '@/contexts/ThemeContext';
import { allCollectibles, type Collectible } from '@/components/features/dashboard/rock-data';
import { ArrowLeft, Check, Lock, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import Link from 'next/link';

const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
const FONT_SANS  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const RARITY_RANK: Record<Collectible['rarity'], number> = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4 };

const CARD_HEIGHT = 400;
const GAP = 16;

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
    cardShadow: isDark ? '0 14px 34px rgba(0,0,0,0.50)' : '0 14px 34px rgba(90,80,120,0.20)',
    discBg    : isDark ? 'rgba(255,240,215,0.06)' : 'rgba(255,255,255,0.5)',
    discBorder: isDark ? 'rgba(193,154,107,0.18)' : 'rgba(255,255,255,0.7)',
    pipOn     : isDark ? 'rgba(193,154,107,0.95)' : '#320E3B',
    pipOff    : isDark ? 'rgba(193,154,107,0.25)' : 'rgba(50,14,59,0.18)',
    gotColor  : isDark ? 'rgba(160,195,130,0.95)' : '#3B6D11',
    noColor   : isDark ? 'rgba(255,240,215,0.45)' : 'rgba(50,14,59,0.50)',
    noBg      : isDark ? 'rgba(255,240,215,0.05)' : 'rgba(50,14,59,0.06)',
    progTrack : isDark ? 'rgba(255,240,215,0.10)' : 'rgba(50,14,59,0.12)',
    progFill  : isDark ? 'linear-gradient(90deg,rgba(214,178,130,0.98),rgba(193,154,107,0.92))' : '#320E3B',
    ctrlBg    : isDark ? 'rgba(193,154,107,0.14)' : '#320E3B',
    ctrlBorder: isDark ? 'rgba(193,154,107,0.4)'  : 'rgba(50,14,59,0.4)',
    ctrlColor : isDark ? 'rgba(255,240,215,0.9)'  : 'rgba(255,248,235,0.96)',
    dotOn     : isDark ? 'rgba(214,178,130,0.98)' : '#320E3B',
    dotOff    : isDark ? 'rgba(193,154,107,0.28)' : 'rgba(50,14,59,0.20)',
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 999, padding: '5px 12px', fontFamily: FONT_SANS, ...style }}>
      {collected ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
      {collected ? 'Collected' : 'Locked'}
    </span>
  );
}

function CollectibleCard({ item, collected, t }: { item: Collectible; collected: boolean; t: T }) {
  const [flipped, setFlipped] = React.useState(false);
  const rank = RARITY_RANK[item.rarity];

  const face: React.CSSProperties = {
    position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    padding: '26px 20px 22px',
    boxShadow: `${t.cardShadow}, inset 0 1px 0 ${t.cardHi}`,
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${item.name}, ${item.rarity}, ${collected ? 'collected' : 'locked'}. Tap to turn the card over.`}
      onClick={() => setFlipped(f => !f)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(f => !f); } }}
      style={{
        perspective: 1200,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        height: CARD_HEIGHT,
      }}
    >
      <div
        className="sy-flip-inner"
        style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateY(${flipped ? 180 : 0}deg)`,
          transition: 'transform 0.62s cubic-bezier(0.22,0.72,0.26,1)',
        }}
      >
        {/* Front */}
        <div style={{ ...face, gap: 12, justifyContent: 'center', paddingBottom: 44, background: t.cardBg, border: `0.5px solid ${t.cardBorder}`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', opacity: collected ? 1 : 0.8 }}>
          <div style={{ width: 150, height: 150, borderRadius: 22, overflow: 'hidden', flex: 'none', background: t.discBg, border: `0.5px solid ${t.discBorder}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: collected ? 'none' : 'grayscale(1)', opacity: collected ? 1 : 0.55 }}
            />
          </div>

          <p style={{ fontFamily: FONT_SERIF, fontSize: 25, fontWeight: 600, lineHeight: 1.12, margin: 0, color: t.name }}>{item.name}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: t.eyebrow, fontFamily: FONT_SANS }}>{item.rarity}</span>
            <span style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4].map(i => (
                <span key={i} style={{ width: 6, height: 6, transform: 'rotate(45deg)', borderRadius: 1, background: i <= rank ? t.pipOn : t.pipOff }} />
              ))}
            </span>
          </div>

          <StatusPill collected={collected} onBack={false} t={t} />

          <p style={{ position: 'absolute', bottom: 18, left: 0, right: 0, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: t.sub, opacity: 0.8, fontFamily: FONT_SANS }}>
            <RotateCw className="h-3 w-3" /> Tap to turn
          </p>
        </div>

        {/* Back */}
        <div style={{ ...face, gap: 12, justifyContent: 'center', background: t.faceBack, border: `0.5px solid ${t.faceBackLn}`, transform: 'rotateY(180deg)', color: t.backInk }}>
          <p style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 600, lineHeight: 1.12, margin: 0, color: t.backInk }}>{item.name}</p>
          <span style={{ width: 40, height: 1, background: t.faceBackLn }} />
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: t.backMuted, margin: 0, fontFamily: FONT_SANS }}>How to earn</p>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, color: t.backInk, fontFamily: FONT_SANS }}>{item.description}</p>
          <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 15, lineHeight: 1.5, margin: 0, color: t.backMuted }}>&ldquo;{item.story}&rdquo;</p>
          <StatusPill collected={collected} onBack t={t} />
          <p style={{ position: 'absolute', bottom: 18, left: 0, right: 0, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: t.backMuted, opacity: 0.7, margin: 0, fontFamily: FONT_SANS }}>Tap to turn back</p>
        </div>
      </div>
    </div>
  );
}

export default function YogaCollectionPage() {
  const { isDark } = useTheme();
  const t = tok(isDark);

  const railRef = React.useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = React.useState(0);

  // Which items are collected (demo). Progress is derived from this.
  const collectedIds = ['welcome_mat', 'first_analysis_block', 'join_challenge_strap'];
  const collectedCount = allCollectibles.filter(c => collectedIds.includes(c.id)).length;
  const pct = Math.round((collectedCount / allCollectibles.length) * 100);
  const last = allCollectibles.length - 1;

  // Whichever card sits nearest the middle of the rail is the one you're on.
  const onScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const mid = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0, bestGap = Infinity;
    Array.from(rail.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const gap = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (gap < bestGap) { bestGap = gap; best = i; }
    });
    setIndex(best);
  };

  const goTo = (i: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const clamped = Math.max(0, Math.min(last, i));
    const el = rail.children[clamped] as HTMLElement | undefined;
    if (!el) return;
    rail.scrollTo({ left: el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
  };

  const current = allCollectibles[index];

  return (
    <AppShell>
      <style>{`
        /* The rail scrolls by swipe; its scrollbar would only be clutter. */
        .sy-rail{ -ms-overflow-style:none; scrollbar-width:none; }
        .sy-rail::-webkit-scrollbar{ display:none; }
        @media (prefers-reduced-motion: reduce){
          .sy-flip-inner{ transition:none !important; }
          .sy-rail{ scroll-behavior:auto; }
        }
      `}</style>

      <div style={{ padding: '28px 0 90px' }}>

        {/* Header */}
        <div style={{ position: 'relative', textAlign: 'center', padding: '0 18px', maxWidth: 1040, margin: '0 auto 20px' }}>
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            style={{ position: 'absolute', left: 18, top: 2, width: 40, height: 40, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: t.ctrlBg, border: `0.5px solid ${t.ctrlBorder}`, color: t.ctrlColor, textDecoration: 'none' }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600, color: t.eyebrow, margin: 0, fontFamily: FONT_SANS }}>SnapYoga · Collection</p>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 30, fontWeight: 600, color: t.heroTitle, margin: '4px 0 0' }}>The Yoga Collection</h1>
          <p style={{ fontSize: 13, color: t.sub, margin: '4px 0 0' }}>Swipe to browse. Tap a card to see how it&rsquo;s earned.</p>

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

        {/* Swipeable rail */}
        <div
          ref={railRef}
          className="sy-rail"
          onScroll={onScroll}
          tabIndex={0}
          role="group"
          aria-label="Collectibles. Swipe sideways, or use the left and right arrow keys."
          onKeyDown={e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(index - 1); }
          }}
          style={{
            display: 'flex',
            gap: GAP,
            overflowX: 'auto',
            overscrollBehaviorX: 'contain',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            paddingBlock: '10px 4px',
            // Centre the first and last card instead of pinning them to the edges.
            paddingInline: 'max(18px, calc(50% - min(320px, 78vw) / 2))',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {allCollectibles.map(item => (
            <div
              key={item.id}
              style={{ flex: '0 0 min(320px, 78vw)', scrollSnapAlign: 'center', scrollSnapStop: 'always' }}
            >
              <CollectibleCard
                item={item}
                collected={collectedIds.includes(item.id)}
                t={t}
              />
            </div>
          ))}
        </div>

        {/* Where you are — arrows for trackpads and keyboards, dots for everyone */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18 }}>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous collectible"
            style={{ width: 38, height: 38, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: t.ctrlBg, border: `0.5px solid ${t.ctrlBorder}`, color: t.ctrlColor, cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.35 : 1, transition: 'opacity 0.2s ease' }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {allCollectibles.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${item.name}`}
                aria-current={i === index}
                style={{
                  width: i === index ? 20 : 7, height: 7, borderRadius: 999, padding: 0, border: 'none',
                  background: i === index ? t.dotOn : t.dotOff, cursor: 'pointer',
                  transition: 'width 0.28s ease, background 0.28s ease',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === last}
            aria-label="Next collectible"
            style={{ width: 38, height: 38, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: t.ctrlBg, border: `0.5px solid ${t.ctrlBorder}`, color: t.ctrlColor, cursor: index === last ? 'default' : 'pointer', opacity: index === last ? 0.35 : 1, transition: 'opacity 0.2s ease' }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <p aria-live="polite" style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: t.sub, margin: '12px 0 0', fontFamily: FONT_SANS, fontVariantNumeric: 'tabular-nums' }}>
          {index + 1} / {allCollectibles.length} · {current?.name}
        </p>
      </div>
    </AppShell>
  );
}
