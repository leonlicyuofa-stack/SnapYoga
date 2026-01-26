"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, UserCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';
import Image from 'next/image';

const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const avatars = [
    { id: 'avatar1', imagePath: '/images/avatar1.png', bgColor: 'bg-white' },
    { id: 'avatar2', imagePath: '/images/avatar2.png', bgColor: 'bg-white' },
    { id: 'avatar3', imagePath: '/images/avatar3.png', bgColor: 'bg-white' },
    { id: 'avatar4', imagePath: '/images/avatar4.png', bgColor: 'bg-white' },
    { id: 'avatar5', imagePath: '/images/avatar5.png', bgColor: 'bg-white' },
    { id: 'avatar6', imagePath: '/images/avatar6.png', bgColor: 'bg-white' },
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
            <div className="w-full max-w-lg bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
                <header className="text-center">
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
                      
                      <div className="space-y-2">
                           <Label htmlFor="displayName" className="text-center block">How should we address you?</Label>
                           <div className="relative">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                                <Input 
                                    id="displayName" 
                                    placeholder="Enter your name" 
                                    {...register("displayName")}
                                    className="bg-white/10 border-white/20 rounded-full h-12 pl-12 text-white placeholder:text-white/50 focus:bg-white/20"
                                />
                           </div>
                          {errors.displayName && <p className="text-sm text-red-400 pl-4">{errors.displayName.message}</p>}
                        </div>
                        
                        <Button type="submit" form="gender-profile-form" className="w-full h-12 text-base rounded-full mt-8 bg-white/90 text-black hover:bg-white" disabled={isSubmitting || authLoading || !isValid}>
                            {isSubmitting || authLoading ? <Loader2 className="animate-spin" /> : <>Next <ArrowRight className="ml-2" /></>}
                        </Button>
                    </form>
                </main>
            </div>
        </div>
    </div>
  );
}
