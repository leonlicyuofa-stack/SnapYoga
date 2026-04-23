
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ArrowLeft, Wind, Sparkles, CheckCircle2, Loader2, Zap, Droplets, Moon, Sun, Flame } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { cn } from '@/lib/utils';

const GOLD       = 'rgba(193,154,107';
const PARCHMENT  = 'rgba(255,240,215';
const TERRACOTTA = 'rgba(180,110,65';
const SAGE       = 'rgba(120,140,100';
const FONT_PANCAKE = "Didot, 'Bodoni MT', 'Century Schoolbook', 'Palatino Linotype', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const MOOD_SPECTRUM = [
  { threshold: 25,  name: 'Fatigue',   emoji: '😫', color: 'rgba(139,100,75,0.92)' },
  { threshold: 50,  name: 'Emotional', emoji: '😢', color: 'rgba(193,154,107,0.92)' },
  { threshold: 75,  name: 'Calm',      emoji: '😌', color: 'rgba(140,185,215,0.92)' },
  { threshold: 100, name: 'Joyful',    emoji: '😊', color: 'rgba(160,195,130,0.92)' },
];

const HABITS = [
  { id: 'practice', label: 'Practice', emoji: '🧘', color: `${TERRACOTTA},0.85)` },
  { id: 'hydrate',  label: 'Hydrate',  emoji: '💧', color: 'rgba(100,160,200,0.85)' },
  { id: 'rest',     label: 'Rest',     emoji: '🌙', color: `${GOLD},0.85)` },
  { id: 'sunlight', label: 'Sunlight', emoji: '☀️', color: 'rgba(220,180,80,0.85)' },
  { id: 'active',   label: 'Active',   emoji: '🔥', color: `${SAGE},0.85)` },
];

export default function MoodTrackerPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const [value, setValue] = useState(75);
  const [reflection, setReflection] = useState('');
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    const fetchData = async () => {
      const moodDoc = await getDoc(doc(firestore, 'users', user.uid, 'moods', todayStr));
      if (moodDoc.exists()) {
        const data = moodDoc.data();
        const moodIndex = MOOD_SPECTRUM.findIndex(m => m.name === data.name);
        if (moodIndex !== -1) setValue(MOOD_SPECTRUM[moodIndex].threshold - 5);
        setReflection(data.reflection || '');
      }

      const habitDoc = await getDoc(doc(firestore, 'users', user.uid, 'habits', todayStr));
      if (habitDoc.exists()) {
        setCompletedHabits(habitDoc.data().completed || []);
      }
      setIsLoaded(true);
    };

    fetchData();
  }, [user]);

  const currentMood = MOOD_SPECTRUM.find(m => value <= m.threshold) || MOOD_SPECTRUM[3];

  // Autosave logic for everything
  const triggerSave = (newReflection?: string, newVal?: number, newHabits?: string[]) => {
    if (!user) return;
    setIsSaving(true);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        
        // Save Mood & Reflection
        await setDoc(doc(firestore, 'users', user.uid, 'moods', todayStr), {
          name: currentMood.name,
          emoji: currentMood.emoji,
          value: newVal ?? value,
          reflection: newReflection ?? reflection,
          loggedAt: serverTimestamp(),
        }, { merge: true });

        // Save Habits
        await setDoc(doc(firestore, 'users', user.uid, 'habits', todayStr), {
          date: todayStr,
          completed: newHabits ?? completedHabits,
          updatedAt: serverTimestamp(),
        }, { merge: true });

      } catch (e) {
        console.error("Autosave failed", e);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  const toggleHabit = (id: string) => {
    const updated = completedHabits.includes(id) 
      ? completedHabits.filter(h => h !== id) 
      : [...completedHabits, id];
    setCompletedHabits(updated);
    triggerSave(undefined, undefined, updated);
  };

  if (!isLoaded) return <AppShell><div className="flex items-center justify-center min-h-screen"><SmileyRockLoader /></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 pt-10 pb-32 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="flex items-center gap-4 mb-12">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: `${GOLD},0.9)` }} />
          </button>
          <div>
            <h1 style={{ fontSize: 28, fontFamily: FONT_PANCAKE, color: isDark ? `${PARCHMENT},1)` : 'black' }}>Daily Check-in</h1>
            <p style={{ fontSize: 12, fontFamily: FONT_CASUAL, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, color: isDark ? 'white' : 'black' }}>Mindful Presence</p>
          </div>
        </header>

        <main className="flex-1 space-y-12">
          
          {/* SPECTRUM SECTION */}
          <section className="text-center">
            <p style={{ fontSize: 14, fontFamily: FONT_PANCAKE, fontStyle: 'italic', marginBottom: 32, opacity: 0.8, color: isDark ? 'white' : 'black' }}>
              Where is your spirit resting today?
            </p>

            <div className="relative py-6 px-4">
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
                    onValueChange={(v) => {
                      setValue(v[0]);
                      triggerSave(undefined, v[0]);
                    }} 
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

          {/* HABITS SECTION */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 opacity-60">
              <Zap className="w-4 h-4" style={{ color: `${GOLD},1)` }} />
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: isDark ? 'white' : 'black', fontFamily: FONT_CASUAL }}>Today's Habits</h3>
            </div>
            <div className="flex justify-around bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
               {HABITS.map(h => {
                const done = completedHabits.includes(h.id);
                return (
                  <button 
                    key={h.id} 
                    onClick={() => toggleHabit(h.id)}
                    className="flex flex-col items-center gap-2 transition-transform active:scale-95"
                  >
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300",
                        done ? "scale-110 shadow-lg" : "grayscale opacity-40 scale-100"
                      )}
                      style={{ 
                        background: done ? h.color : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${done ? h.color : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: done ? `0 4px 12px ${h.color}` : 'none'
                      }}
                    >
                      {h.emoji}
                    </div>
                    <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', fontFamily: FONT_CASUAL, color: done ? (isDark ? 'white' : 'black') : 'rgba(255,255,255,0.3)', fontWeight: done ? 700 : 400 }}>{h.label}</span>
                  </button>
                );
               })}
            </div>
          </section>

          {/* REFLECTION SECTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 opacity-60">
              <Sparkles className="w-4 h-4" style={{ color: `${GOLD},1)` }} />
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: isDark ? 'white' : 'black', fontFamily: FONT_CASUAL }}>Daily Reflection</h3>
            </div>
            
            <div className="relative group">
              <Textarea 
                value={reflection}
                onChange={(e) => {
                  setReflection(e.target.value);
                  triggerSave(e.target.value);
                }}
                placeholder="What's flowing through your mind..."
                className="min-h-[180px] bg-white/5 border-none rounded-2xl p-6 text-base italic leading-relaxed focus-visible:ring-1 focus-visible:ring-white/10 transition-all no-scrollbar"
                style={{ 
                  fontFamily: FONT_PANCAKE,
                  color: isDark ? `${PARCHMENT},0.9)` : 'black',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: isDark ? '0.5px solid rgba(255,255,255,0.05)' : '0.5px solid rgba(0,0,0,0.05)'
                }}
              />
              
              {/* Saving Indicator */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 transition-opacity duration-300">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: `${GOLD},0.6)` }} />
                ) : reflection.length > 0 && (
                  <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                )}
              </div>
            </div>
          </section>

          <footer className="pt-8 text-center">
             <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="px-10 h-12 rounded-full text-xs font-bold tracking-widest bg-transparent border-white/10 hover:bg-white/5"
              style={{ fontFamily: FONT_CASUAL, color: isDark ? 'white' : 'black' }}
            >
              FINISH CHECK-IN
            </Button>
          </footer>

        </main>
      </div>
    </AppShell>
  );
}
