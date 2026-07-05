
"use client";

import * as React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface TierBadgeProps {
  tier: 'trial' | 'gold';
}

export function TierBadge({ tier }: TierBadgeProps) {
  const isGold = tier === 'gold';
  const { isDark } = useTheme();

  // Trial reads as gold on the dark theme, but needs amethyst to stay legible on the lavender light theme.
  const style: React.CSSProperties = {
    color: isGold ? 'rgba(25,16,8,0.92)' : (isDark ? 'rgba(193,154,107,0.85)' : '#320E3B'),
    background: isGold ? 'rgba(193,154,107,0.85)' : (isDark ? 'rgba(193,154,107,0.10)' : 'rgba(50,14,59,0.08)'),
    border: `0.5px solid ${isGold ? 'rgba(193,154,107,0.9)' : (isDark ? 'rgba(193,154,107,0.30)' : 'rgba(50,14,59,0.35)')}`,
    borderRadius: 999,
    padding: '5px 12px',
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={style}>
      <span>{isGold ? '♛' : '✦'}</span>
      {isGold ? 'Gold' : 'Trial'}
    </div>
  );
}
