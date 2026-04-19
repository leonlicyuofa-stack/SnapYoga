"use client";

import { useTheme } from '@/contexts/ThemeContext';

export function ThemeBackground() {
  const { isDark } = useTheme();

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -10,
          overflow: 'hidden',
        }}
      >
        {/* Dark background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/images/darkbg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isDark ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
        {/* Light background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/images/lightbg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isDark ? 0 : 1,
            transition: 'opacity 0.6s ease',
          }}
        />
      </div>

      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -9,
          background: isDark ? 'rgba(0,0,0,0.48)' : 'rgba(255,248,240,0.30)',
          transition: 'background 0.6s ease',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
