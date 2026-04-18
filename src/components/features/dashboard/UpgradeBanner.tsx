"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';

const GOLD      = 'rgba(193,154,107';
const PARCHMENT = 'rgba(255,240,215';
const DEEP_BARK = 'rgba(25,16,8';

export function UpgradeBanner() {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(firestore, 'users', user.uid)).then((snap) => {
      if (snap.exists()) setSubscriptionStatus(snap.data()?.subscriptionStatus ?? null);
    });
  }, [user]);

  if (subscriptionStatus === 'active' || dismissed) return null;

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 rounded-2xl gap-3"
      style={{
        background: `${GOLD},0.12)`,
        border: `0.5px solid ${GOLD},0.35)`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base flex-shrink-0">⭐</span>
        <p className="text-sm font-serif truncate" style={{ color: `${PARCHMENT},0.85)` }}>
          Unlock unlimited poses &amp; advanced feedback
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/upgrade"
          className="text-xs font-semibold font-serif px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
          style={{ background: `${GOLD},0.80)`, color: `${DEEP_BARK},0.95)` }}
        >
          Upgrade
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: `${PARCHMENT},0.70)` }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
