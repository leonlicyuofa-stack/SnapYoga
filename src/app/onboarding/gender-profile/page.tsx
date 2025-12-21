
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, MoveUpRight, Loader2, UserCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const avatars = [
    { id: 'avatar1', imagePath: '/images/avatar1.png', bgColor: 'bg-purple-200' },
    { id: 'avatar2', imagePath: '/images/avatar2.png', bgColor: 'bg-pink-200' },
    { id: 'avatar3', imagePath: '/images/avatar3.png', bgColor: 'bg-orange-200' },
    { id: 'avatar4', imagePath: '/images/avatar4.png', bgColor: 'bg-rose-200' },
    { id: 'avatar5', imagePath: '/images/avatar5.png', bgColor: 'bg-green-200' },
    { id: 'avatar6', imagePath: '/images/avatar6.png', bgColor: 'bg-blue-200' },
];

export default function GenderProfilePage() {
  const { user, loading: authLoading, updateUserDisplayName } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  
  const { control, register, handleSubmit, setValue, watch, formState: { errors, isValid }, reset } = useForm<ProfileFormValues>({
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
                
                if (data.displayName) defaultValues.displayName = data.displayName;
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
      
      // Update both Auth profile and Firestore document
      await updateUserDisplayName(data.displayName);
      await createUserProfileDocument(user, {
          avatar: data.avatar, // This will be the data URI if a custom avatar is selected
          displayName: data.displayName,
      });

      router.push('/onboarding/yoga-goal');
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: "There was a problem updating your profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSelectedAvatar = () => {
    if (!selectedAvatar) {
        return <UserCircle className="h-6 w-6 text-muted-foreground" />;
    }

    if (customAvatar && selectedAvatar === customAvatar) {
        return <AvatarImage src={customAvatar} alt="Custom Avatar" />;
    }

    const avatarData = avatars.find(a => a.id === selectedAvatar);
    if (avatarData) {
        return <div className={cn("w-full h-full flex items-center justify-center p-1", avatarData.bgColor)}><Image src={avatarData.imagePath} alt={avatarData.id} width={80} height={80} /></div>
    }

    return <UserCircle className="h-6 w-6 text-muted-foreground" />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
      <QuadrantBackground />
      <div className="fixed top-8 left-8 right-8 z-20 flex justify-between items-center">
        <Button
            onClick={() => router.back()}
            className="rounded-full h-12 w-12 p-0 bg-white/30 hover:bg-white/50 text-splash-foreground shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
            aria-label="Go back"
        >
            <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 m-4">
        <OnboardingHeader />
        
        <form id="gender-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full mt-8">
          <div className="grid grid-cols-3 gap-4">
              {avatars.map(avatar => {
                return (
                    <div 
                        key={avatar.id}
                        className={cn(
                            "cursor-pointer p-2 rounded-full transition-all aspect-square flex items-center justify-center",
                            selectedAvatar === avatar.id ? 'ring-2 ring-primary ring-offset-2' : ''
                        )}
                        onClick={() => setValue('avatar', avatar.id, { shouldValidate: true })}
                    >
                        <div className={cn("rounded-full w-full h-full flex items-center justify-center overflow-hidden", avatar.bgColor)}>
                            <Image src={avatar.imagePath} alt={avatar.id} width={120} height={120} className="object-cover" />
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
                    "cursor-pointer p-2 rounded-full transition-all aspect-square flex items-center justify-center",
                    customAvatar && selectedAvatar === customAvatar ? 'ring-2 ring-primary ring-offset-2' : 'border-2 border-dashed border-muted-foreground/50 text-muted-foreground/50 hover:border-primary hover:text-primary'
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
          {errors.avatar && <p className="text-sm text-destructive text-center -mt-4">{errors.avatar.message}</p>}
          
          <div className="space-y-4">
            <div className="space-y-2">
               <Label htmlFor="displayName" className="text-center block">How should we address you?</Label>
               <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        id="displayName" 
                        placeholder="Enter your name" 
                        {...register("displayName")}
                        className="bg-gray-100/80 border-border/50 rounded-full h-12 pl-12 shadow-inner"
                    />
               </div>
              {errors.displayName && <p className="text-sm text-destructive pl-4">{errors.displayName.message}</p>}
            </div>
            
          </div>
            <div className="px-8">
              <Button type="submit" form="gender-profile-form" className="w-full h-12 text-base rounded-full mt-8" disabled={isSubmitting || authLoading || !isValid}>
                {isSubmitting || authLoading ? <Loader2 className="animate-spin" /> : 'Next'}
              </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
