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
          background: isDark
            ? 'linear-gradient(175deg,#131a24 0%,#0D1821 55%,#11121d 100%)'
            : 'linear-gradient(175deg,#B0B5C0 0%,#9DA4B0 35%,#A8A0BC 70%,#9B96B5 100%)',
          transition: 'background 0.8s ease',
        }}
      >
        {/* Dynamic CSS Gradient "Streaks" - Tinted with Black Cherry #5A0002 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: isDark
              ? 'radial-gradient(circle at 50% 13%, rgba(193,154,107,0.14) 0%, rgba(193,154,107,0.04) 28%, transparent 50%), radial-gradient(circle at 80% 85%, rgba(90,0,2,0.08) 0%, transparent 55%)'
              : 'none',
            opacity: 1,
            transition: 'background-image 0.8s ease',
          }}
        />
        
        {/* Subtle texture/grain for luxury feel */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Modern Overlay - extremely subtle to keep it sleek */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -9,
          background: isDark ? 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)' : 'transparent',
          transition: 'background 0.8s ease',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
