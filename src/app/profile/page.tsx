
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Save, Share2, Copy, MessageSquare, UserCircle, Ruler } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { cn } from '@/lib/utils';


const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

const measurementsSchema = z.object({
  height: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Height must be a number" }).positive({ message: "Height must be positive" }).optional()
  ),
  heightUnit: z.enum(['cm', 'in']).default('cm'),
  weight: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Weight must be a number" }).positive({ message: "Weight must be positive" }).optional()
  ),
  weightUnit: z.enum(['kg', 'lbs']).default('kg'),
});

type MeasurementsFormValues = z.infer<typeof measurementsSchema>;


export default function ProfilePage() {
  const { user, updateUserPassword, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isMeasurementsSubmitting, setIsMeasurementsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  });
  
  const {
    control: controlMeasurements,
    register: registerMeasurements,
    handleSubmit: handleSubmitMeasurements,
    watch: watchMeasurements,
    setValue: setMeasurementsValue,
    formState: { errors: measurementsErrors },
    reset: resetMeasurementsForm,
  } = useForm<MeasurementsFormValues>({
    resolver: zodResolver(measurementsSchema),
    defaultValues: {
        height: undefined,
        weight: undefined,
        heightUnit: 'cm',
        weightUnit: 'kg',
    },
  });

  const heightUnit = watchMeasurements('heightUnit');
  const weightUnit = watchMeasurements('weightUnit');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(window.location.origin);
    }
    if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as DocumentData;
                resetMeasurementsForm({
                    height: data.height,
                    weight: data.weight,
                    heightUnit: data.heightUnit || 'cm',
                    weightUnit: data.weightUnit || 'kg',
                });
            }
        });
    }
  }, [user, resetMeasurementsForm]);


  const onPasswordSubmit: SubmitHandler<PasswordChangeFormValues> = async (data) => {
    setIsPasswordSubmitting(true);
    const success = await updateUserPassword(data.currentPassword, data.newPassword);
    if (success) {
      resetPasswordForm();
    }
    setIsPasswordSubmitting(false);
  };
  
  const onMeasurementsSubmit: SubmitHandler<MeasurementsFormValues> = async (data) => {
    if (!user) {
      toast({ title: 'Not authenticated', description: 'You must be logged in to update your profile.', variant: 'destructive'});
      return;
    }
    setIsMeasurementsSubmitting(true);
    try {
      const profileData: any = {};
      if (data.height) profileData.height = data.height;
      profileData.heightUnit = data.heightUnit;
      if (data.weight) profileData.weight = data.weight;
      profileData.weightUnit = data.weightUnit;
      
      await createUserProfileDocument(user, profileData);
      toast({ title: "Measurements Saved", description: "Your measurements have been updated." });
    } catch (error) {
       toast({ title: "Error", description: "Failed to save measurements. Please try again.", variant: 'destructive'});
    } finally {
      setIsMeasurementsSubmitting(false);
    }
  }

  const handleCopyInviteLink = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied!",
            description: "Invite link copied to your clipboard.",
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy the link. Please try manually.",
            variant: "destructive",
          });
        });
    }
  };

  const shareText = inviteLink ? `Hey! Check out SnapYoga - an awesome app to analyze and improve your yoga poses: ${inviteLink}` : '';
  const whatsappShareUrl = inviteLink ? `whatsapp://send?text=${encodeURIComponent(shareText)}` : '#';
  const pinterestShareUrl = inviteLink ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(inviteLink)}&media=${encodeURIComponent('https://placehold.co/600x400.png')}&description=${encodeURIComponent(shareText)}` : '#';

  const handleTikTokShare = () => {
    if (navigator.clipboard && inviteLink) {
        navigator.clipboard.writeText(inviteLink).then(() => {
            toast({
                title: "Link Copied for TikTok!",
                description: "Paste this link in your TikTok bio or video description.",
                duration: 5000,
            });
        });
    }
  };


  const handleInstagramShare = () => {
    if (navigator.clipboard && inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          toast({
            title: "Link Copied for Instagram!",
            description: "Paste this link in your Instagram bio or stories.",
            duration: 5000,
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy the link. Please try manually.",
            variant: "destructive",
          });
        });
    }
  };
  
  if (authLoading && !user) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user) {
    return <AppShell><div className="text-center p-8"><p>Please sign in to view your profile.</p></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center p-4 overflow-hidden">
         <div className="absolute inset-0 z-0 bg-splash-background">
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                    <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
                <path d="M 0,0 L 100,0 C 50,50 100,50 100,100 L 0,100 Z" fill="hsl(var(--splash-blob-1))" />
                <path d="M 0,100 C 50,50 0,50 0,0" fill="hsl(var(--splash-background))" />
                <path d="M 100,0 L 0,0 C 50,50 0,50 0,100 L 100,100 Z" fill="hsl(var(--splash-blob-2))" style={{ opacity: 0.5 }}/>
            </svg>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-8 w-full">
            <header className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-3">
                <UserCircle className="h-10 w-10" /> Your Profile
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </header>

            <dl className="divide-y divide-border/50">
                {/* Measurements */}
                <div className="py-5">
                    <dt className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Ruler className="h-6 w-6 text-primary" />
                        Your Measurements
                    </dt>
                    <dd>
                        <form onSubmit={handleSubmitMeasurements(onMeasurementsSubmit)} className="space-y-6 mt-2">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label htmlFor="height">Height ({heightUnit})</Label>
                                    <div className="flex items-center space-x-2">
                                      <Label htmlFor="heightUnitCm" className="text-sm">cm</Label>
                                      <Switch
                                        id="heightUnitSwitch"
                                        checked={heightUnit === 'in'}
                                        onCheckedChange={(checked) => setMeasurementsValue('heightUnit', checked ? 'in' : 'cm')}
                                      />
                                      <Label htmlFor="heightUnitIn" className="text-sm">in</Label>
                                    </div>
                                  </div>
                                  <Input
                                    id="height"
                                    type="number"
                                    step="any"
                                    placeholder={heightUnit === 'cm' ? "e.g., 170" : "e.g., 67"}
                                    {...registerMeasurements("height")}
                                  />
                                  {measurementsErrors.height && <p className="text-sm text-destructive">{measurementsErrors.height.message}</p>}
                                </div>
                                <div className="space-y-2">
                                   <div className="flex justify-between items-center">
                                    <Label htmlFor="weight">Weight ({weightUnit})</Label>
                                    <div className="flex items-center space-x-2">
                                      <Label htmlFor="weightUnitKg" className="text-sm">kg</Label>
                                      <Switch
                                        id="weightUnitSwitch"
                                        checked={weightUnit === 'lbs'}
                                        onCheckedChange={(checked) => setMeasurementsValue('weightUnit', checked ? 'lbs' : 'kg')}
                                      />
                                      <Label htmlFor="weightUnitLbs" className="text-sm">lbs</Label>
                                    </div>
                                  </div>
                                  <Input
                                    id="weight"
                                    type="number"
                                    step="any"
                                    placeholder={weightUnit === 'kg' ? "e.g., 65" : "e.g., 143"}
                                    {...registerMeasurements("weight")}
                                  />
                                  {measurementsErrors.weight && <p className="text-sm text-destructive">{measurementsErrors.weight.message}</p>}
                                </div>
                              </div>
                              <Button type="submit" className="w-full" disabled={isMeasurementsSubmitting || authLoading}>
                                {isMeasurementsSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isMeasurementsSubmitting ? "Saving..." : "Save Measurements"}
                              </Button>
                        </form>
                    </dd>
                </div>
                
                {/* Change Password */}
                <div className="py-5">
                    <dt className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <KeyRound className="h-6 w-6 text-primary" />
                        Change Password
                    </dt>
                    <dd>
                        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 mt-2">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} placeholder="••••••••" className={passwordErrors.currentPassword ? "border-destructive" : ""}/>
                            {passwordErrors.currentPassword && <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" {...registerPassword("newPassword")} placeholder="Minimum 6 characters" className={passwordErrors.newPassword ? "border-destructive" : ""}/>
                            {passwordErrors.newPassword && <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                            <Input id="confirmNewPassword" type="password" {...registerPassword("confirmNewPassword")} placeholder="Re-type new password" className={passwordErrors.confirmNewPassword ? "border-destructive" : ""}/>
                            {passwordErrors.confirmNewPassword && <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword.message}</p>}
                          </div>
                          <Button type="submit" className="w-full" disabled={isPasswordSubmitting || authLoading}>
                            {isPasswordSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isPasswordSubmitting ? "Updating..." : "Update Password"}
                          </Button>
                        </form>
                    </dd>
                </div>
                
                {/* Invite Friends */}
                <div className="py-5">
                    <dt className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Share2 className="h-6 w-6 text-primary" />
                        {t('inviteFriendsTitle')}
                    </dt>
                    <dd className="space-y-4">
                         <div className="text-center p-3 bg-green-100/50 text-green-800 border border-green-200 rounded-md text-sm font-medium">
                            {t('referralBonusText')}
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">{t('yourInviteLink')}</p>
                            <div className="flex items-center space-x-2">
                                <Input type="text" value={inviteLink} readOnly className="text-sm text-muted-foreground" aria-label="Invite Link" />
                                <Button variant="outline" size="icon" onClick={handleCopyInviteLink} title="Copy Link"><Copy className="h-5 w-5" /></Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Button variant="outline" className="w-full" asChild disabled={!inviteLink}><a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer"><MessageSquare className="mr-2 h-5 w-5" /> WhatsApp</a></Button>
                            <Button variant="outline" className="w-full" onClick={handleInstagramShare} disabled={!inviteLink}><Share2 className="mr-2 h-5 w-5" /> Instagram</Button>
                            <Button variant="outline" className="w-full" asChild disabled={!inviteLink}><a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer"><PinterestIcon className="mr-2 h-5 w-5" /> Pinterest</a></Button>
                            <Button variant="outline" className="w-full" onClick={handleTikTokShare} disabled={!inviteLink}><TikTokIcon className="mr-2 h-5 w-5" /> TikTok</Button>
                        </div>
                         <p className="text-xs text-muted-foreground text-center w-full !mt-6">
                            {t('inviteLinkHelp')}
                        </p>
                    </dd>
                </div>
            </dl>
          </div>
        </div>
    </AppShell>
  );
}

    