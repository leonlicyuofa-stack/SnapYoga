
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import Image from 'next/image';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';

const profileSchema = z.object({
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const avatars = [
    { id: 'avatar1', imagePath: 'https://picsum.photos/seed/avatar1/120/120', bgColor: 'bg-white', hint: 'abstract art' },
    { id: 'avatar2', imagePath: 'https://picsum.photos/seed/avatar2/120/120', bgColor: 'bg-white', hint: 'nature landscape' },
    { id: 'avatar3', imagePath: 'https://picsum.photos/seed/avatar3/120/120', bgColor: 'bg-white', hint: 'animal portrait' },
    { id: 'avatar4', imagePath: 'https://picsum.photos/seed/avatar4/120/120', bgColor: 'bg-white', hint: 'minimalist design' },
    { id: 'avatar5', imagePath: 'https://picsum.photos/seed/avatar5/120/120', bgColor: 'bg-white', hint: 'galaxy space' },
];

export default function GenderProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  
  const { control, handleSubmit, setValue, watch, formState: { errors, isValid }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (user && !authLoading) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const defaultValues: Partial<ProfileFormValues> = {};
                // If photoURL is a custom one, set it as customAvatar
                if (data.photoURL && !data.photoURL.includes('googleusercontent.com')) {
                    setCustomAvatar(data.photoURL);
                    defaultValues.avatar = data.photoURL;
                } else if (data.avatar) {
                    defaultValues.avatar = data.avatar;
                }
                
                reset(defaultValues);
            }
        });
    }
  }, [user, authLoading, reset]);


  const selectedAvatar = watch('avatar');

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setCustomAvatar(dataUri);
        setValue('avatar', dataUri, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
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
    <div className="relative min-h-screen font-serif text-white bg-home-dark-bg">
        <Image
            src="https://picsum.photos/seed/yogawellness/1920/1080"
            alt="A tranquil, modern space for practicing yoga."
            fill
            className="object-cover"
            data-ai-hint="modern wellness room"
            priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-lg">
                 <Button
                    onClick={handleBackNavigation}
                    variant="ghost"
                    className="mb-4 rounded-full h-12 w-12 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20"
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
                        <p className="text-sm text-white/80">Let's start with the basics.</p>
                    </header>
                    
                    <main>
                        <form id="gender-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                            <div className="grid grid-cols-3 gap-4">
                              {avatars.map(avatar => {
                                return (
                                    <div 
                                        key={avatar.id}
                                        className={cn(
                                            "cursor-pointer p-1 rounded-full transition-all aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20",
                                            selectedAvatar === avatar.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black/20' : ''
                                        )}
                                        onClick={() => setValue('avatar', avatar.id, { shouldValidate: true })}
                                    >
                                        <div className={cn("rounded-full w-full h-full flex items-center justify-center overflow-hidden", avatar.bgColor)}>
                                            <Image src={avatar.imagePath} alt={avatar.id} width={120} height={120} className="object-cover" data-ai-hint={avatar.hint} />
                                        </div>
                                    </div>
                                )
                              })}
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleCustomAvatarUpload}
                                className="hidden"
                                accept="image/*"
                              />
                              <div 
                                className={cn(
                                    "cursor-pointer p-2 rounded-full transition-all aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20",
                                    customAvatar && selectedAvatar === customAvatar ? 'ring-2 ring-white ring-offset-2 ring-offset-black/20' : 'border-2 border-dashed border-white/30 text-white/50 hover:border-white hover:text-white'
                                )}
                                onClick={() => fileInputRef.current?.click()}
                                >
                                {customAvatar ? (
                                    <Image src={customAvatar} alt="Custom Avatar" width={100} height={100} className="rounded-full object-cover w-full h-full" />
                                ) : (
                                    <PlusCircle className="w-10 h-10" />
                                )}
                              </div>
                          </div>
                          {errors.avatar && <p className="text-sm text-red-400 text-center -mt-4">{errors.avatar.message}</p>}
                            
                            <Button type="submit" form="gender-profile-form" className="w-full h-12 text-base rounded-full mt-8 bg-white/90 text-black hover:bg-white" disabled={isSubmitting || authLoading || !isValid}>
                                {isSubmitting || authLoading ? <Loader2 className="animate-spin" /> : <>Next <ArrowLeft className="ml-2 -rotate-180" /></>}
                            </Button>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    </div>
  );
}
