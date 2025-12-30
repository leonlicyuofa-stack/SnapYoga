
"use client";

import { useEffect, useState } from 'react';

const quotes = [
    "The body benefits from movement, and the mind benefits from stillness.",
    "Yoga is the journey of the self, through the self, to the self.",
    "Inhale the future, exhale the past.",
    "The pose begins when you want to leave it.",
    "Yoga is not about touching your toes, it is what you learn on the way down.",
];

export function QuoteCarousel({ className }: { className?: string }) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Get the day of the year to have a consistent "quote of the day"
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setCurrentQuoteIndex(dayOfYear % quotes.length);
  }, []);

  return (
    <div className={className}>
      <p className="text-center text-lg italic text-foreground/80">
        &quot;{quotes[currentQuoteIndex]}&quot;
      </p>
    </div>
  );
}
