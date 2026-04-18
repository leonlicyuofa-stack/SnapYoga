'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function DynamicBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering a stable initial state
  const currentTheme = mounted ? theme : 'dark';
  
  const bgImage = currentTheme === 'dark' ? '/images/darkbg.png' : '/images/lightbg.png';
  const overlayColor = currentTheme === 'dark' ? 'rgba(0,0,0,0.50)' : 'rgba(255,255,255,0.15)';

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
        <Image
          key={bgImage} // Re-mount ensures smooth transition and priority reload
          src={bgImage}
          alt=""
          fill
          className="object-cover transition-opacity duration-700"
          priority
          sizes="100vw"
          quality={90}
        />
      </div>
      <div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: -9, 
          background: overlayColor,
          transition: 'background 0.5s ease'
        }} 
      />
    </>
  );
}
