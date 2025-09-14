
"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


interface DailyQuote {
  content: string;
  author: string;
}

interface CachedQuotes {
  timestamp: number;
  quotes: DailyQuote[];
}

const fallbackQuotes: DailyQuote[] = [
    { content: "The body benefits from movement, and the mind benefits from stillness.", author: "Sakyong Mipham" },
    { content: "Yoga is the journey of the self, through the self, to the self.", author: "The Bhagavad Gita" },
    { content: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", author: "Rumi" },
];

export function QuoteCarousel() {
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAndCacheQuotes = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.quotable.io/quotes/random?limit=5&tags=wisdom|inspiration|life|philosophy&maxLength=120', { cache: 'no-store' });
        if (!response.ok) throw new Error('Quotable API failed');
        const data = await response.json();
        
        let fetchedQuotes: DailyQuote[];
        if (data.length > 0) {
            fetchedQuotes = data.map((q: any) => ({ content: q.content, author: q.author }));
        } else {
            fetchedQuotes = fallbackQuotes;
        }

        const newCache: CachedQuotes = {
            timestamp: new Date().getTime(),
            quotes: fetchedQuotes,
        };
        localStorage.setItem('dailyYogaQuotes', JSON.stringify(newCache));
        setQuotes(fetchedQuotes);

      } catch (err) {
        console.error("Failed to fetch quotes, using fallbacks:", err);
        setQuotes(fallbackQuotes);
      } finally {
        setLoading(false);
      }
    };

    const loadQuotes = () => {
        const cachedData = localStorage.getItem('dailyYogaQuotes');
        if (cachedData) {
            try {
                const parsedData: CachedQuotes = JSON.parse(cachedData);
                const now = new Date().getTime();
                const oneDay = 24 * 60 * 60 * 1000;

                if (now - parsedData.timestamp < oneDay) {
                    setQuotes(parsedData.quotes);
                    setLoading(false);
                    return; // Use cached quotes
                }
            } catch (e) {
                console.error("Error parsing cached quotes, fetching new ones.", e);
            }
        }
        // If no cache or cache is expired, fetch new quotes
        fetchAndCacheQuotes();
    };

    loadQuotes();

  }, []);

  useEffect(() => {
    if (quotes.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex === quotes.length - 1 ? 0 : prevIndex + 1));
      }, 5000); // Change quote every 5 seconds
      return () => clearInterval(timer);
    }
  }, [quotes]);


  if (loading) {
    return (
        <Card className="relative w-full max-w-lg h-24 flex flex-col items-center justify-center p-8 bg-transparent border-0 shadow-none">
            <Skeleton className="h-4 w-3/4 mb-2" />
        </Card>
    );
  }

  return (
    <div className="relative w-full max-w-lg">
        <div className="relative h-24 overflow-hidden">
            {quotes.map((quote, index) => (
                <div
                    key={index}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center",
                        index === currentIndex ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden={index !== currentIndex}
                >
                    <Card className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-transparent border-0 shadow-none">
                         <blockquote className="text-lg md:text-xl text-foreground/90 leading-relaxed">
                            &ldquo;{quote.content}&rdquo;
                        </blockquote>
                    </Card>
                </div>
            ))}
        </div>
    </div>
  );
}
