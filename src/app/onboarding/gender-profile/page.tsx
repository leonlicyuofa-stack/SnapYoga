
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import Image from 'next/image';
import { OnboardingScaffold } from '@/components/onboarding/onboarding-scaffold';

const profileSchema = z.object({
  avatar: z.string().min(1, { message: "Please select an avatar" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const avatars = [
    { id: 'avatar1', imagePath: '/images/girl 1.png', hint: 'girl portrait' },
    { id: 'avatar2', imagePath: '/images/girl 2.png', hint: 'girl portrait' },
    { id: 'avatar3', imagePath: '/images/girl 3.png', hint: 'girl portrait' },
    { id: 'avatar4', imagePath: '/images/guy 1.png', hint: 'guy portrait' },
    { id: 'avatar5', imagePath: '/images/guy 2.png', hint: 'guy portrait' },
    { id: 'avatar6', imagePath: '/images/guy 3.png', hint: 'guy portrait' },
];

export default function GenderProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<string>('');

  const { handleSubmit, setValue, formState: { errors, isValid } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  // Selected-avatar styling — amethyst on lavender (light) / gold on ink (dark).
  const ringSel  = isDark ? 'rgba(214,178,130,0.95)' : 'rgba(50,14,59,0.75)';
  const ringGlow = isDark ? 'rgba(193,154,107,0.15)' : 'rgba(50,14,59,0.12)';
  const avBorder = isDark ? 'rgba(193,154,107,0.20)' : 'rgba(50,14,59,0.18)';
  const badgeBg    = isDark ? 'rgba(214,178,130,0.95)' : '#320E3B';
  const badgeColor = isDark ? '#1a1210' : 'rgba(255,248,235,0.96)';

  useEffect(() => {
    if (user && !authLoading) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.avatar && avatars.some(a => a.id === data.avatar)) {
                    setSelected(data.avatar);
                    setValue('avatar', data.avatar, { shouldValidate: true });
                }
            }
        });
    }
  }, [user, authLoading, setValue]);

  const pickAvatar = (id: string) => {
    setSelected(id);
    setValue('avatar', id, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) {
        toast({ title: "Not logged in", description: "You must be logged in to update your profile.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      await createUserProfileDocument(user, {
          avatar: data.avatar,
      });
      router.push('/onboarding/yoga-goal');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: "There was a problem updating your profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackNavigation = () => {
    router.back();
  };

  return (
    <OnboardingScaffold
      title="Choose your avatar"
      subtitle="Tap the one that feels like you."
      step={1}
      totalSteps={5}
      onBack={handleBackNavigation}
      next={
        <Button
          type="submit"
          form="gender-profile-form"
          variant="ghost"
          className="rounded-full h-12 w-12 p-0 bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-[rgba(50,14,59,0.4)] dark:border-white/20"
          aria-label="Next"
          disabled={isSubmitting || authLoading || !isValid}
        >
          {isSubmitting || authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
        </Button>
      }
    >
      <form id="gender-profile-form" onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="grid grid-cols-3 gap-4">
            {avatars.map(a => {
              const on = selected === a.id;
              return (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => pickAvatar(a.id)}
                  aria-label={`Select ${a.hint}`}
                  aria-pressed={on}
                  className="relative aspect-square rounded-full overflow-hidden transition-transform active:scale-95"
                  style={{
                    background: '#fff',
                    border: `2px solid ${on ? ringSel : avBorder}`,
                    boxShadow: on ? `0 0 0 4px ${ringGlow}` : 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Image
                    src={a.imagePath}
                    alt={a.hint}
                    width={140}
                    height={140}
                    className="w-full h-full object-cover"
                    data-ai-hint={a.hint}
                  />
                  {on && (
                    <span
                      style={{
                        position: 'absolute', bottom: -2, right: -2,
                        width: 22, height: 22, borderRadius: '50%',
                        background: badgeBg, color: badgeColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${isDark ? '#12100e' : 'rgba(255,255,255,0.85)'}`,
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        {errors.avatar && <p className="text-sm text-red-400 text-center mt-4">{errors.avatar.message}</p>}
      </form>
    </OnboardingScaffold>
  );
}
