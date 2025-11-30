
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function SnapYogaLogo() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center space-x-3" aria-label="SnapYoga Home">
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
      >
        <title>SnapYoga Logo</title>
        {/* Bottom Pebble */}
        <path d="M84.7,85.4c-2.3,4.8-19.4,8.9-34.7,8.9s-32.4-4.1-34.7-8.9c-2.3-4.8,2.7-14.5,17.4-16.7c14.7-2.2,34.3-1.1,44.7,4.3C88.1,78.2,87,80.6,84.7,85.4z" fill="#6c757d"/>
        {/* Eyes */}
        <circle cx="42" cy="80" r="3.5" fill="#343a40"/>
        <circle cx="58" cy="80" r="3.5" fill="#343a40"/>
        {/* Middle Pebble */}
        <path d="M78.6,65.8c-2.7,3.6-14.6,6.3-28.6,6.3s-25.9-2.7-28.6-6.3c-2.7-3.6,1.2-11.3,13.6-13.1c12.4-1.8,27.5-0.9,35.8,3.2C81.8,60.1,81.3,62.2,78.6,65.8z" fill="#adb5bd"/>
        {/* Top Pebble */}
        <path d="M69.9,51.3c-2.5,2.4-11,4-20,4s-17.5-1.6-20-4c-2.5-2.4,0.4-7.5,9.2-8.7s18.4-0.6,24.1,2.1C68.8,46.5,72.4,48.9,69.9,51.3z" fill="#e9ecef"/>
      </svg>
      <div className="relative">
        <span className="text-2xl font-bold tracking-tight text-primary font-script">{t('snapYogaTitle')}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute text-pink-300"
          style={{ top: '-14px', left: 'calc(50% - 10px)' }}
        >
          <path d="M12 17.5C14.7614 17.5 17 15.2614 17 12.5C17 9.73858 14.7614 7.5 12 7.5C9.23858 7.5 7 9.73858 7 12.5C7 15.2614 9.23858 17.5 12 17.5Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 7.5C12 7.5 12.5 2 15 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 12.5C17 12.5 22 12 20.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 7.5C12 7.5 11.5 2 9 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 12.5C7 12.5 2 12 3.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 20.5C9 20.5 7.5 22 7.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 20.5C15 20.5 16.5 22 16.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="text-2xl">🌿</span>
    </div>
  );
}
