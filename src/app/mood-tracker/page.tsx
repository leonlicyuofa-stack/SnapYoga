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
import { ArrowLeft, Wind, Sparkles, CheckCircle2, Loader2, Zap, Droplets, Moon, Sun, Flame, ArrowRight, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { MoonPhaseRingLoader } from '@/components/layout/moon-phase-ring-loader';
import { cn } from '@/lib/utils';
import { getQuotesForMood } from '@/lib/mood-quotes';
import { PracticeIcon, HydrateIcon, RestIcon, SunlightIcon, ActiveIcon } from '@/components/icons/HabitIcons';

const GOLD       = 'rgba(193,154,107';
const PARCHMENT  = 'rgba(255,240,215';
const TERRACOTTA = 'rgba(180,110,65';
const SAGE       = 'rgba(120,140,100';
const DEEP_BARK  = 'rgba(25,16,8';
const FONT_PANCAKE = "Didot, 'Bodoni MT', 'Century Schoolbook', 'Palatino Linotype', Georgia, serif";
const FONT_CASUAL  = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const MOOD_SPECTRUM = [
  { threshold: 25,  name: 'Fatigue',   emoji: '😫', color: 'rgba(139,100,75,0.92)' },
  { threshold: 50,  name: 'Emotional', emoji: '😢', color: 'rgba(193,154,107,0.92)' },
  { threshold: 75,  name: 'Calm',      emoji: '😌', color: 'rgba(140,185,215,0.92)' },
  { threshold: 100, name: 'Joyful',    emoji: '😊', color: 'rgba(160,195,130,0.92)' },
];

const HABITS = [
  { id: 'practice', label: 'Practice', Icon: PracticeIcon, color: `${TERRACOTTA},0.85)` },
  { id: 'hydrate',  label: 'Hydrate',  Icon: HydrateIcon,  color: 'rgba(100,160,200,0.85)' },
  { id: 'rest',     label: 'Rest',     Icon: RestIcon,     color: `${GOLD},0.85)` },
  { id: 'sunlight', label: 'Sunlight', Icon: SunlightIcon, color: 'rgba(220,180,80,0.85)' },
  { id: 'active',   label: 'Active',   Icon: ActiveIcon,   color: `${SAGE},0.85)` },
];

const BODY_TAGS_OPTIONS = ['Energized', 'Sore', 'Flexible', 'Tired', 'Tense'];

export default function MoodTrackerPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [value, setValue] = useState(75);
  const [reflection, setReflection] = useState('');
  const [messageToSelf, setMessageToSelf] = useState('');
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [bodyTags, setBodyTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // States for Step 1
  const [quotes, setQuotes] = useState<{text:string;author:string}[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentMood = MOOD_SPECTRUM.find(m => value <= m.threshold) || MOOD_SPECTRUM[3];

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
        setMessageToSelf(data.messageToSelf || '');
        setSelectedQuote(data.quote || null);
        setBodyTags(data.bodyTags || []);
      }

      const habitDoc = await getDoc(doc(firestore, 'users', user.uid, 'habits', todayStr));
      if (habitDoc.exists()) {
        setCompletedHabits(habitDoc.data().completed || []);
      }
      setIsLoaded(true);
    };

    fetchData();
  }, [user]);

  // Fetch quotes when mood changes
  useEffect(() => {
    if (currentMood) {
      setQuotes(getQuotesForMood(currentMood.name, 3));
      setSelectedQuote(null);
    }
  }, [currentMood.name]);

  // Pre-fill reflection with quote when moving to step 2
  useEffect(() => {
    if (step === 2 && selectedQuote && !reflection.includes(selectedQuote)) {
      setReflection(prev => {
        if (!prev.trim()) {
          return `"${selectedQuote}"\n\n`;
        }
        return prev;
      });
    }
  }, [step, selectedQuote]);

  const triggerSave = (newReflection?: string, newVal?: number, newHabits?: string[], newMessageToSelf?: string, newBodyTags?: string[]) => {
    if (!user) return;
    setIsSaving(true);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        await setDoc(doc(firestore, 'users', user.uid, 'moods', todayStr), {
          name: currentMood.name,
          emoji: currentMood.emoji,
          value: newVal ?? value,
          reflection: newReflection ?? reflection,
          messageToSelf: newMessageToSelf ?? messageToSelf,
          bodyTags: newBodyTags ?? bodyTags,
          quote: selectedQuote,
          loggedAt: serverTimestamp(),
        }, { merge: true });

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

  const toggleBodyTag = (tag: string) => {
    const updated = bodyTags.includes(tag)
      ? bodyTags.filter(t => t !== tag)
      : [...bodyTags, tag];
    setBodyTags(updated);
    triggerSave(undefined, undefined, undefined, undefined, updated);
  };

  if (!isLoaded) return <AppShell><div className="flex items-center justify-center min-h-screen"><MoonPhaseRingLoader /></div></AppShell>;

  const headerColor = isDark ? `${PARCHMENT},1)` : `${DEEP_BARK},1)`;
  const labelColor = isDark ? 'white' : 'black';

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 pt-10 pb-32 flex flex-col min-h-screen">
        
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => step === 1 ? router.push('/dashboard') : setStep(1)}
              aria-label="Go back"
              className="rounded-full h-10 w-10 p-0 inline-flex items-center justify-center bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-md transition-all hover:scale-105 backdrop-blur-sm border border-[rgba(50,14,59,0.4)] dark:border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 style={{ fontSize: 24, fontFamily: FONT_PANCAKE, color: headerColor }}>Daily Check-in</h1>
              <p style={{ fontSize: 10, fontFamily: FONT_CASUAL, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, color: labelColor }}>Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${GOLD},0.30)`, background: `${GOLD},0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {isDark
              ? <Sun style={{ width: 14, height: 14, color: `${GOLD},0.75)` }} />
              : <Moon style={{ width: 14, height: 14, color: `${GOLD},0.75)` }} />
            }
          </button>
        </header>

        <div style={{ display: 'flex', gap: 5, marginBottom: 24 }}>
          {[1, 2].map((seg) => (
            <div key={seg} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= seg ? 'rgba(193,154,107,0.85)' : 'rgba(255,240,215,0.10)' }} />
          ))}
        </div>

        <main className="flex-1 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {step === 1 && (
            <>
              <section className="text-center">
                <p style={{ 
                  fontSize: 14, 
                  fontFamily: FONT_PANCAKE, 
                  fontStyle: 'italic', 
                  marginBottom: 32, 
                  color: 'rgba(255,240,215,0.62)' 
                }}>
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
                      <h2 className="mt-4 text-xl font-bold uppercase tracking-widest transition-all duration-500" style={{ color: isDark ? currentMood.color : `${DEEP_BARK},0.9)`, fontFamily: FONT_CASUAL }}>
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
                        <span className="text-[10px] uppercase font-bold tracking-tighter" style={{ color: labelColor }}>Muted</span>
                        <span className="text-[10px] uppercase font-bold tracking-tighter" style={{ color: labelColor }}>Radiant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 opacity-60">
                  <Zap className="w-4 h-4" style={{ color: isDark ? `${GOLD},1)` : `${TERRACOTTA},1)` }} />
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: labelColor, fontFamily: FONT_CASUAL }}>Today's Habits</h3>
                </div>
                <div className="flex justify-around bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                  {HABITS.map(h => {
                    const done = completedHabits.includes(h.id);
                    const Icon = h.Icon;
                    return (
                      <button 
                        key={h.id} 
                        onClick={() => toggleHabit(h.id)}
                        className="flex flex-col items-center gap-2 transition-transform active:scale-95"
                      >
                        <div 
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                            done ? "scale-110 shadow-lg" : "grayscale opacity-40 scale-100"
                          )}
                          style={{
                            background: done ? h.color : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                            border: `1px solid ${done ? h.color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                            boxShadow: done ? `0 4px 12px ${h.color}` : 'none'
                          }}
                        >
                          <Icon size={30} />
                        </div>
                        <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', fontFamily: FONT_CASUAL, color: done ? labelColor : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'), fontWeight: done ? 700 : 400 }}>{h.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* How's your body? (moved here from the journal) */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 opacity-60">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: labelColor, fontFamily: FONT_CASUAL }}>How's your body?</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BODY_TAGS_OPTIONS.map(tag => {
                    const active = bodyTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleBodyTag(tag)}
                        style={{
                          borderRadius: 20, padding: '6px 16px', fontSize: 11, fontWeight: 500,
                          background: active ? 'rgba(193,154,107,0.18)' : 'transparent',
                          border: `0.5px solid ${active ? 'rgba(214,178,130,0.6)' : 'rgba(193,154,107,0.18)'}`,
                          color: active ? 'rgba(255,240,215,0.95)' : 'rgba(255,240,215,0.55)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Quotes Section */}
              <section className="space-y-4 animate-in fade-in duration-700">
                <div className="flex items-center gap-2 opacity-60">
                   <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(193,154,107,0.55)', fontFamily: FONT_CASUAL }}>
                      Quotes for your mood · tap to reflect on one
                   </h3>
                </div>
                <div className="space-y-2">
                  {quotes.map((q, idx) => {
                    const isSelected = selectedQuote === q.text;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedQuote(q.text)}
                        className="w-full text-left transition-all duration-300 active:scale-[0.98]"
                        style={{
                          borderRadius: 14,
                          border: isSelected ? '0.5px solid rgba(193,154,107,0.50)' : '0.5px solid rgba(193,154,107,0.18)',
                          background: isSelected ? 'rgba(193,154,107,0.10)' : 'rgba(13,20,30,0.50)',
                          padding: '10px 12px',
                        }}
                      >
                        <p style={{ fontSize: 10.5, fontStyle: 'italic', color: 'rgba(255,240,215,0.70)', marginBottom: 2 }}>
                          "{q.text}"
                        </p>
                        <p style={{ fontSize: 8, textTransform: 'uppercase', color: 'rgba(193,154,107,0.55)', fontWeight: 600 }}>
                          — {q.author}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <footer className="pt-8 text-center">
                <div className="flex items-center justify-end gap-4">
                  <span style={{ fontFamily: FONT_CASUAL, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: isDark ? 'rgba(193,154,107,0.92)' : '#320E3B' }}>NEXT: REFLECT</span>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!currentMood}
                    aria-label="Next: reflect"
                    className="rounded-full h-12 w-12 p-0 inline-flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm disabled:opacity-50 disabled:pointer-events-none"
                    style={{ background: isDark ? 'rgba(0,0,0,0.30)' : '#320E3B', border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.20)' : 'rgba(50,14,59,0.40)'}` }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </footer>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex justify-center">
                <div 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[rgba(140,170,115,0.3)] bg-[rgba(120,155,95,0.12)]"
                  style={{ color: 'rgba(160,195,130,0.85)' }}
                >
                  <span className="text-xl">{currentMood.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Feeling {currentMood.name} today</span>
                </div>
              </div>

              <section className="space-y-4">
                <div className="flex items-center gap-2 opacity-60">
                  <Sparkles className="w-4 h-4" style={{ color: 'rgba(193,154,107,0.80)' }} />
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: labelColor, fontFamily: FONT_CASUAL }}>Daily Reflection</h3>
                </div>
                
                <div className="relative group">
                  <Textarea 
                    value={reflection}
                    onChange={(e) => {
                      setReflection(e.target.value);
                      triggerSave(e.target.value);
                    }}
                    placeholder="What's flowing through your mind..."
                    className="min-h-[120px] border-none p-6 text-base italic leading-relaxed focus-visible:ring-1 transition-all no-scrollbar"
                    style={{ 
                      borderRadius: 14,
                      fontFamily: FONT_PANCAKE,
                      color: 'rgba(255,240,215,0.62)',
                      background: 'rgba(255,240,215,0.02)',
                      border: '0.5px solid rgba(193,154,107,0.16)'
                    }}
                  />
                  
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: isDark ? `${GOLD},0.6)` : `${TERRACOTTA},0.6)` }} />
                    ) : reflection.length > 0 && (
                      <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 opacity-60">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: labelColor, fontFamily: FONT_CASUAL }}>Message to myself (Optional)</h3>
                </div>
                
                <Textarea 
                  value={messageToSelf}
                  onChange={(e) => {
                    setMessageToSelf(e.target.value);
                    triggerSave(undefined, undefined, undefined, e.target.value);
                  }}
                  placeholder="A note for future me..."
                  className="min-h-[60px] border-none rounded-xl p-4 text-sm leading-relaxed focus-visible:ring-1 transition-all no-scrollbar"
                  style={{ 
                    fontFamily: FONT_PANCAKE,
                    color: isDark ? `${PARCHMENT},0.9)` : `${DEEP_BARK},0.9)`,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: isDark ? '0.5px solid rgba(255,255,255,0.05)' : '0.5px solid rgba(0,0,0,0.05)'
                  }}
                />
              </section>

              <footer className="pt-8 text-center space-y-4">
                <Button 
                  onClick={() => {
                    router.push('/dashboard');
                  }}
                  className="w-full h-14 rounded-full text-sm font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
                  style={{ 
                    fontFamily: FONT_CASUAL,
                    background: 'rgba(193,154,107,0.85)', 
                    color: 'rgba(25,16,8,0.95)'
                  }}
                >
                  <Check className="w-4 h-4" /> FINISH CHECK-IN
                </Button>
                <button 
                  onClick={() => setStep(1)}
                  className="text-xs opacity-40 hover:opacity-70 transition-opacity uppercase tracking-widest font-bold"
                  style={{ color: labelColor }}
                >
                  Back to mood selection
                </button>
              </footer>
            </>
          )}

        </main>
      </div>
    </AppShell>
  );
}
