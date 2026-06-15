
"use client";

import * as React from 'react';

interface TierBadgeProps {
  tier: 'trial' | 'gold';
}

export function TierBadge({ tier }: TierBadgeProps) {
  const isGold = tier === 'gold';

  const style: React.CSSProperties = {
    color: isGold ? 'rgba(25,16,8,0.92)' : 'rgba(193,154,107,0.85)',
    background: isGold ? 'rgba(193,154,107,0.85)' : 'rgba(193,154,107,0.10)',
    border: `0.5px solid ${isGold ? 'rgba(193,154,107,0.9)' : 'rgba(193,154,107,0.30)'}`,
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
