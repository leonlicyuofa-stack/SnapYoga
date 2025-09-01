
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';

interface DailyQuote {
  content: string;
  author: string;
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
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.quotable.io/quotes/random?limit=5&tags=wisdom|inspiration|life|philosophy&maxLength=180');
        if (!response.ok) throw new Error('Quotable API failed');
        const data = await response.json();
        if (data.length > 0) {
            setQuotes(data.map((q: any) => ({ content: q.content, author: q.author })));
        } else {
            setQuotes(fallbackQuotes);
        }
      } catch (err) {
        console.error("Failed to fetch quotes, using fallbacks:", err);
        setQuotes(fallbackQuotes);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? quotes.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex === quotes.length - 1 ? 0 : prevIndex + 1));
  };

  if (loading) {
    return (
        <Card className="relative w-full max-w-2xl h-64 md:h-72 shadow-2xl overflow-hidden bg-primary/10 border-primary/20 backdrop-blur-sm flex flex-col items-center justify-center p-8">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-5 w-1/2 mb-4" />
            <Skeleton className="h-4 w-1/4" />
        </Card>
    );
  }

  return (
    <div className="relative w-full max-w-2xl">
        <div className="relative h-64 md:h-72 overflow-hidden">
            {quotes.map((quote, index) => (
                <div
                    key={index}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center justify-center",
                        index === currentIndex ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden={index !== currentIndex}
                >
                    <Card className="w-full h-full shadow-2xl bg-gradient-to-br from-primary/10 via-background/80 to-secondary/10 border-primary/20 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 md:p-12">
                         <blockquote className="text-xl md:text-2xl font-script text-foreground/90 italic leading-relaxed">
                            &ldquo;{quote.content}&rdquo;
                        </blockquote>
                        <cite className="mt-4 block text-sm md:text-base text-muted-foreground not-italic">
                            &ndash; {quote.author}
                        </cite>
                    </Card>
                </div>
            ))}
        </div>
        <Button 
            variant="outline" 
            size="icon" 
            onClick={goToPrevious}
            className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-12 rounded-full w-10 h-10 bg-card/80 backdrop-blur-sm"
            aria-label="Previous quote"
        >
            <ChevronLeftIcon className="h-6 w-6" />
        </Button>
        <Button 
            variant="outline" 
            size="icon" 
            onClick={goToNext}
            className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-12 rounded-full w-10 h-10 bg-card/80 backdrop-blur-sm"
            aria-label="Next quote"
        >
            <ChevronRightIcon className="h-6 w-6" />
        </Button>
    </div>
  );
}
