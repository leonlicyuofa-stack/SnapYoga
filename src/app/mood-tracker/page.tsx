"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ArrowLeft, Smile, Wind, Frown, Meh, Sparkles, CheckCircle2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';

const GOLD       = 'rgba(193,154,107';
const PARCHMENT  = 'rgba(255,240,215';
const FONT_PANCAKE = "Didot, 'Bodoni MT', 'Century Schoolbook', 'Palatino Linotype', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const MOOD_SPECTRUM = [
  { threshold: 25,  name: 'Fatigue',   emoji: '😫', color: 'rgba(139,100,75,0.92)',  icon: Meh },
  { threshold: 50,  name: 'Emotional', emoji: '😢', color: 'rgba(193,154,107,0.92)', icon: Frown },
  { threshold: 75,  name: 'Calm',      emoji: '😌', color: 'rgba(140,185,215,0.92)', icon: Wind },
  { threshold: 100, name: 'Joyful',    emoji: '😊', color: 'rgba(160,195,130,0.92)', icon: Smile },
];

export default function MoodTrackerPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const [value, setValue] = useState(75);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    getDoc(doc(firestore, 'users', user.uid, 'moods', todayStr)).then(s => {
      if (s.exists()) {
        const data = s.data();
        const moodIndex = MOOD_SPECTRUM.findIndex(m => m.name === data.name);
        if (moodIndex !== -1) setValue(MOOD_SPECTRUM[moodIndex].threshold - 5);
        setReflection(data.reflection || '');
      }
      setIsLoaded(true);
    });
  }, [user]);

  const currentMood = MOOD_SPECTRUM.find(m => value <= m.threshold) || MOOD_SPECTRUM[3];

  const handleSave = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      await setDoc(doc(firestore, 'users', user.uid, 'moods', todayStr), {
        name: currentMood.name,
        emoji: currentMood.emoji,
        value,
        reflection,
        loggedAt: serverTimestamp(),
      }, { merge: true });

      toast({ title: 'Check-in saved', description: 'Your mindful reflection has been logged.' });
      router.push('/dashboard');
    } catch (e) {
      toast({ title: 'Error', description: 'Could not log your reflection.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) return <AppShell><div className="flex items-center justify-center min-h-screen"><SmileyRockLoader /></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 pt-10 pb-32 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="flex items-center gap-4 mb-12">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: `${GOLD},0.9)` }} />
          </button>
          <div>
            <h1 style={{ fontSize: 28, fontFamily: FONT_PANCAKE, color: isDark ? `${PARCHMENT},1)` : 'black' }}>Check-in</h1>
            <p style={{ fontSize: 12, fontFamily: FONT_CASUAL, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, color: isDark ? 'white' : 'black' }}>Mindful Reflection</p>
          </div>
        </header>

        <main className="flex-1 space-y-16">
          
          {/* SPECTRUM SECTION */}
          <section className="text-center">
            <p style={{ fontSize: 14, fontFamily: FONT_PANCAKE, fontStyle: 'italic', marginBottom: 40, opacity: 0.8, color: isDark ? 'white' : 'black' }}>
              Where is your spirit resting today?
            </p>

            <div className="relative py-10 px-4">
              <div 
                className="absolute inset-0 blur-3xl opacity-20 pointer-events-none transition-colors duration-700" 
                style={{ background: currentMood.color }}
              />
              
              <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="transition-all duration-500 transform hover:scale-110">
                  <span className="text-7xl block drop-shadow-2xl">{currentMood.emoji}</span>
                  <h2 className="mt-4 text-xl font-bold uppercase tracking-widest transition-all duration-500" style={{ color: currentMood.color, fontFamily: FONT_CASUAL }}>
                    {currentMood.name}
                  </h2>
                </div>

                <div className="w-full max-w-sm mt-4">
                  <Slider 
                    value={[value]} 
                    onValueChange={(v) => setValue(v[0])} 
                    max={100} 
                    step={1}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between mt-4 px-1 opacity-40">
                    <span className="text-[10px] uppercase font-bold tracking-tighter" style={{ color: isDark ? 'white' : 'black' }}>Muted</span>
                    <span className="text-[10px] uppercase font-bold tracking-tighter" style={{ color: isDark ? 'white' : 'black' }}>Radiant</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* REFLECTION SECTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 opacity-60">
              <Sparkles className="w-4 h-4" style={{ color: `${GOLD},1)` }} />
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: isDark ? 'white' : 'black', fontFamily: FONT_CASUAL }}>Daily Reflection</h3>
            </div>
            
            <div className="relative">
              <Textarea 
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What's flowing through your mind..."
                className="min-h-[160px] bg-white/5 border-none rounded-2xl p-6 text-base italic leading-relaxed focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
                style={{ 
                  fontFamily: FONT_PANCAKE,
                  color: isDark ? `${PARCHMENT},0.9)` : 'black',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: isDark ? '0.5px solid rgba(255,255,255,0.05)' : '0.5px solid rgba(0,0,0,0.05)'
                }}
              />
            </div>
          </section>

          {/* SAVE BUTTON */}
          <section>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full h-14 rounded-2xl text-base font-bold tracking-widest transition-all duration-300"
              style={{ 
                background: currentMood.color, 
                color: 'white',
                fontFamily: FONT_CASUAL,
                boxShadow: `0 8px 24px -4px ${currentMood.color}`
              }}
            >
              {isSaving ? <SmileyRockLoader /> : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  SAVE REFLECTION
                </>
              )}
            </Button>
          </section>

        </main>
      </div>
    </AppShell>
  );
}
