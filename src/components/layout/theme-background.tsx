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
          backgroundColor: isDark ? '#050505' : '#FDF8F0',
          transition: 'background-color 0.8s ease',
        }}
      >
        {/* Dynamic CSS Gradient "Streaks" */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: isDark 
              ? 'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)'
              : 'radial-gradient(circle at 80% 20%, rgba(193, 154, 107, 0.05) 0%, transparent 40%)',
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
          background: isDark ? 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)' : 'rgba(255,255,255,0.05)',
          transition: 'background 0.8s ease',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
