"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import Image from 'next/image';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

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
];

export default function GenderProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | 'none'>('none');

  const { control, handleSubmit, setValue, formState: { errors, isValid }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (user && !authLoading) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.avatar) {
                    const foundIndex = avatars.findIndex(a => a.id === data.avatar);
                    if (foundIndex !== -1) {
                        setCurrentIndex(foundIndex);
                        setValue('avatar', data.avatar, { shouldValidate: true });
                    }
                }
            }
        });
    }
  }, [user, authLoading, reset, setValue]);
  
  useEffect(() => {
    const currentAvatar = avatars[currentIndex];
    setValue('avatar', currentAvatar.id, { shouldValidate: true });
  }, [currentIndex, setValue]);

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
  
  const handlePrevious = () => {
    setAnimationDirection('left');
    setCurrentIndex((prevIndex) => (prevIndex - 1 + avatars.length) % avatars.length);
  };

  const handleNext = () => {
    setAnimationDirection('right');
    setCurrentIndex((prevIndex) => (prevIndex + 1) % avatars.length);
  };
  
  const currentItem = avatars[currentIndex];

  return (
    <div className="relative min-h-screen font-serif text-white">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-lg relative">
                 <Button
                    onClick={handleBackNavigation}
                    variant="ghost"
                    className="absolute top-4 left-4 rounded-full h-12 w-12 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
                    <header className="text-center">
                        <div className="mx-auto mb-4 inline-block">
                            <SnapYogaLogo />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Choose your avatar</h1>
                        <p className="text-sm text-white/80">Select one that represents you.</p>
                    </header>
                    
                    <main>
                        <form id="gender-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                            <div className="relative w-full flex items-center justify-center" style={{ minHeight: '13rem' }}>
                                <Button
                                    type="button"
                                    onClick={handlePrevious}
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full text-white/70 hover:bg-white/20 hover:text-white"
                                    aria-label="Previous avatar"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </Button>

                                <div className="relative w-48 h-48 md:w-52 md:h-52">
                                     <div key={currentIndex} className={cn(
                                        "w-full h-full",
                                        animationDirection === 'right' ? 'animate-in fade-in-0 slide-in-from-right-12 duration-300' : '',
                                        animationDirection === 'left' ? 'animate-in fade-in-0 slide-in-from-left-12 duration-300' : ''
                                    )}>
                                        <div className="p-1 rounded-full aspect-square flex items-center justify-center bg-white/10 ring-2 ring-offset-2 ring-white ring-offset-black/20">
                                            <div className="rounded-full w-full h-full flex items-center justify-center overflow-hidden bg-white">
                                                <Image src={currentItem.imagePath} alt={currentItem.id} width={192} height={192} className="object-cover" data-ai-hint={currentItem.hint} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full text-white/70 hover:bg-white/20 hover:text-white"
                                    aria-label="Next avatar"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </Button>
                            </div>
                          
                          {errors.avatar && <p className="text-sm text-red-400 text-center -mt-4">{errors.avatar.message}</p>}
                        </form>
                    </main>
                </div>
                <Button
                    type="submit"
                    form="gender-profile-form"
                    variant="ghost"
                    className="absolute bottom-4 right-4 rounded-full h-14 w-14 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
                    aria-label="Next"
                    disabled={isSubmitting || authLoading || !isValid}
                >
                    {isSubmitting || authLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-7 w-7" />}
                </Button>
            </div>
        </div>
    </div>
  );
}
