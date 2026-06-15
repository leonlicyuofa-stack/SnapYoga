import quotes from './mood-quotes.json';

/**
 * Retrieves a random selection of inspirational quotes tailored to a specific mood.
 * 
 * @param mood - The user's current mood (Joyful, Calm, Emotional, Fatigue).
 * @param count - The number of quotes to return (default: 3).
 * @returns An array of quote objects containing text and author.
 */
export function getQuotesForMood(mood: string, count = 3) {
  const list = (quotes as Record<string, {text:string;author:string}[]>)[mood] || [];
  
  // Shuffle using Fisher-Yates or simple sort (simple sort is fine for small lists)
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, count);
}
