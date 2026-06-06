"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && !authLoading) {
      router.replace(user ? '/dashboard' : '/welcome');
    }
  }, [showSplash, user, authLoading, router]);

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(175deg, #B0B5C0 0%, #9DA4B0 35%, #A8A0BC 70%, #9B96B5 100%)',
      padding: '48px 0 40px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 28,
          letterSpacing: '0.08em', fontWeight: 400, color: 'rgba(255,248,235,0.93)',
        }}>SnapYoga</span>
        <span style={{
          fontFamily: 'system-ui, sans-serif', fontSize: 9,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(255,248,235,0.55)',
        }}>Listen · Guide · Activate</span>
        <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.3)', marginTop: 8 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px 0' }}>
        <div style={{
          width: 260, height: 260, borderRadius: '50%', overflow: 'hidden',
          border: '1.5px solid rgba(255,255,255,0.3)',
          boxShadow: '0 0 0 10px rgba(255,255,255,0.07), 0 0 0 20px rgba(255,255,255,0.03)',
        }}>
          <img
            src="/images/yogi-splash.png"
            alt="Yogi in pigeon pose"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: 'system-ui, sans-serif', fontSize: 9,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(255,248,235,0.65)',
        }}>start your journey</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === 1 ? 'rgba(255,248,235,0.85)' : 'rgba(255,248,235,0.25)',
            }} />
          ))}
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&display=swap');`}</style>
    </div>
  );
}
