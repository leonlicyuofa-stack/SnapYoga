"use client";

import { useTheme } from '@/contexts/ThemeContext';

/**
 * Compact light/dark pill toggle for the auth + onboarding flow.
 * Mirrors the homepage toggle. Stops click propagation so it can sit on
 * surfaces that are themselves tappable (e.g. the onboarding complete screen).
 */
export function OnboardingThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
      role="switch"
      aria-checked={!isDark}
      aria-label="Toggle light and dark mode"
      className="absolute top-4 right-4 z-30"
      style={{
        width: 52,
        height: 28,
        borderRadius: 999,
        padding: 0,
        cursor: 'pointer',
        border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.40)'}`,
        background: isDark
          ? 'linear-gradient(135deg,#2E2746 0%,#191327 100%)'
          : 'linear-gradient(135deg,#BDB6D9 0%,#A49FC2 100%)',
        boxShadow: 'inset 0 1px 2px rgba(80,70,100,0.25)',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2.5,
          left: 2.5,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: isDark ? '#D9C28A' : '#FBF4E6',
          boxShadow: '0 2px 5px rgba(60,50,80,0.35)',
          transform: isDark ? 'translateX(24px)' : 'translateX(0)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), background 0.4s ease',
        }}
      />
    </button>
  );
}
