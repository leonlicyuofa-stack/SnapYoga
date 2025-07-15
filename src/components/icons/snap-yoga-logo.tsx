
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
        {/* Big Bottom Pebble */}
        <path
          d="M85 80C85 88.2843 69.4036 95 50 95C30.5964 95 15 88.2843 15 80C15 71.7157 30.5964 65 50 65C69.4036 65 85 71.7157 85 80Z"
          fill="hsl(var(--primary)/ 0.4)"
        />
        {/* Middle Pebble */}
        <path
          d="M75 68C75 74.6274 63.8071 80 50 80C36.1929 80 25 74.6274 25 68C25 61.3726 36.1929 56 50 56C63.8071 56 75 61.3726 75 68Z"
          fill="hsl(var(--accent) / 0.5)"
        />
        {/* Small Top Pebble */}
        <path
          d="M65 59C65 64.5228 58.2843 69 50 69C41.7157 69 35 64.5228 35 59C35 53.4772 41.7157 49 50 49C58.2843 49 65 53.4772 65 59Z"
          fill="hsl(var(--secondary))"
        />
      </svg>
      <span className="text-2xl font-bold tracking-tight text-primary">{t('snapYogaTitle')}</span>
    </div>
  );
}
