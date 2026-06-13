"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Redirect only if the user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const dark = mounted ? isDark : true;

  const bg = dark
    ? 'linear-gradient(175deg,#1a1210 0%,#0D1821 55%,#1a0f1e 100%)'
    : 'linear-gradient(175deg,#B0B5C0 0%,#9DA4B0 35%,#A8A0BC 70%,#9B96B5 100%)';

  const brandColor    = dark ? 'rgba(255,240,215,0.90)' : 'rgba(255,248,235,0.93)';
  const tagColor      = dark ? 'rgba(193,154,107,0.48)' : 'rgba(255,248,235,0.52)';
  const divColor      = dark ? 'rgba(193,154,107,0.22)' : 'rgba(255,255,255,0.28)';
  const ringDash      = dark ? 'rgba(193,154,107,0.18)' : 'rgba(255,255,255,0.22)';
  const ringSolid     = dark ? 'rgba(193,154,107,0.09)' : 'rgba(255,255,255,0.09)';
  const dotColor      = dark ? 'rgba(193,154,107,0.78)' : 'rgba(255,255,255,0.72)';
  const dot2Color     = dark ? 'rgba(193,154,107,0.50)' : 'rgba(255,255,255,0.50)';
  const yogiBorder    = dark ? 'rgba(193,154,107,0.28)' : 'rgba(255,255,255,0.32)';
  const yogiGlow1     = dark ? 'rgba(193,154,107,0.05)' : 'rgba(255,255,255,0.06)';
  const yogiGlow2     = dark ? 'rgba(193,154,107,0.025)' : 'rgba(255,255,255,0.03)';
  const ctaColor      = dark ? 'rgba(255,240,215,0.88)' : 'rgba(255,248,235,0.90)';
  const ctaBorder     = dark ? 'rgba(193,154,107,0.40)' : 'rgba(255,255,255,0.45)';
  const activeDot     = dark ? 'rgba(193,154,107,0.80)' : 'rgba(255,248,235,0.85)';
  const inactiveDot   = dark ? 'rgba(193,154,107,0.18)' : 'rgba(255,248,235,0.22)';
  const linkColor     = dark ? 'rgba(255,240,215,0.35)' : 'rgba(255,248,235,0.45)';
  const linkEmColor   = dark ? 'rgba(193,154,107,0.88)' : 'rgba(255,248,235,0.88)';
  const toggleBorder  = dark ? 'rgba(193,154,107,0.30)' : 'rgba(255,255,255,0.40)';
  const toggleBg      = dark ? 'rgba(193,154,107,0.08)' : 'rgba(255,255,255,0.15)';
  const toggleStroke  = dark ? 'rgba(193,154,107,0.75)' : 'rgba(255,255,255,0.72)';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '28px 0 36px',
      transition: 'background 0.6s ease',
    }}>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 32, height: 32, borderRadius: '50%',
          border: `1.5px solid ${toggleBorder}`,
          background: toggleBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {dark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={toggleStroke} strokeWidth="1.5">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={toggleStroke} strokeWidth="1.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
          </svg>
        )}
      </button>

      {/* Brand */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8 }}>
        <span style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 28, fontWeight: 400,
          letterSpacing: '0.08em',
          color: brandColor,
          transition: 'color 0.4s ease',
        }}>SnapYoga</span>
        <span style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: 9, letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: tagColor,
          transition: 'color 0.4s ease',
        }}>Listen • Guide • Activate</span>
        <div style={{ width: 26, height: 1, background: divColor, marginTop: 5, transition: 'background 0.4s ease' }} />
      </div>

      {/* Yogi + orbit */}
      <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer dashed ring */}
        <div style={{
          position: 'absolute', width: 210, height: 210, borderRadius: '50%',
          border: `0.5px dashed ${ringDash}`,
          animation: 'syOrbit1 18s linear infinite',
        }}>
          <div style={{
            position: 'absolute', width: 5, height: 5, borderRadius: '50%',
            background: dotColor, top: -2.5, left: '50%', transform: 'translateX(-50%)',
          }}/>
          <div style={{
            position: 'absolute', width: 4, height: 4, borderRadius: '50%',
            background: dot2Color, bottom: -2, left: '50%', transform: 'translateX(-50%)',
          }}/>
        </div>
        {/* Inner solid ring */}
        <div style={{
          position: 'absolute', width: 190, height: 190, borderRadius: '50%',
          border: `0.5px solid ${ringSolid}`,
          animation: 'syOrbit1 28s linear infinite reverse',
        }}/>
        {/* Yogi image */}
        <div style={{
          width: 168, height: 168, borderRadius: '50%', overflow: 'hidden',
          border: `1.5px solid ${yogiBorder}`,
          boxShadow: `0 0 0 7px ${yogiGlow1}, 0 0 0 14px ${yogiGlow2}`,
        }}>
          <img
            src="/images/yogi-splash.png"
            alt="Yogi in pigeon pose"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Link
          href="/auth/signup"
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 15, letterSpacing: '0.12em',
            color: ctaColor,
            borderBottom: `0.5px solid ${ctaBorder}`,
            paddingBottom: 2,
            textDecoration: 'none',
            transition: 'color 0.4s ease',
          }}
        >
          Start Your Journey →
        </Link>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: i === 1 ? activeDot : inactiveDot,
              transition: 'background 0.4s ease',
            }}/>
          ))}
        </div>
        <span style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: 9.5,
          color: linkColor,
          transition: 'color 0.4s ease',
        }}>
          Already have an account?{' '}
          <Link 
            href="/auth/signin" 
            style={{ color: linkEmColor, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&display=swap');
        @keyframes syOrbit1 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
