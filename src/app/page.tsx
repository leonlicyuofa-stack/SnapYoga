"use client";
import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => { setMounted(true); }, []);

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
  const tagColor      = dark ? 'rgba(193,154,107,0.48)' : '#320E3B';
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
  const linkEmColor   = dark ? 'rgba(193,154,107,0.88)' : '#320E3B';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '28px 0 36px',
      transition: 'background 0.6s ease',
    }}>

      {/* Theme toggle — pill switch (knob left = light, knob right = dark) */}
      <button
        onClick={toggleTheme}
        role="switch"
        aria-checked={!dark}
        aria-label="Toggle light and dark mode"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 52, height: 28, borderRadius: 999,
          border: `0.5px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.40)'}`,
          padding: 0, cursor: 'pointer',
          background: dark
            ? 'linear-gradient(135deg,#2E2746 0%,#191327 100%)'
            : 'linear-gradient(135deg,#BDB6D9 0%,#A49FC2 100%)',
          boxShadow: 'inset 0 1px 2px rgba(80,70,100,0.25)',
          transition: 'background 0.4s ease, border-color 0.4s ease',
        }}
      >
        <span style={{ position: 'absolute', top: 8, width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,250,240,0.80)', transition: 'all 0.3s ease', ...(dark ? { left: 10 } : { right: 10 }) }} />
        <span style={{ position: 'absolute', top: 15, width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,250,240,0.55)', transition: 'all 0.3s ease', ...(dark ? { left: 18 } : { right: 18 }) }} />
        <span style={{
          position: 'absolute', top: 2.5, left: 2.5,
          width: 22, height: 22, borderRadius: '50%',
          background: dark ? '#D9C28A' : '#FBF4E6',
          boxShadow: '0 2px 5px rgba(60,50,80,0.35)',
          transform: dark ? 'translateX(24px)' : 'translateX(0)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), background 0.4s ease',
        }} />
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
          Begin Your Journey →
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
