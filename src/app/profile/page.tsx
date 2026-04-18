
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Save, Share2, Copy, MessageSquare, UserCircle, FileText, Star, Crown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { PinterestIcon } from '@/components/icons/PinterestIcon';
import { cn } from '@/lib/utils';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


const usernameChangeSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }).max(30, { message: "Username cannot be longer than 30 characters" }),
});

type UsernameChangeFormValues = z.infer<typeof usernameChangeSchema>;

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
  const { user, updateUserPassword, updateUserDisplayName, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isUsernameSubmitting, setIsUsernameSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  const { 
    register: registerUsername, 
    handleSubmit: handleSubmitUsername, 
    formState: { errors: usernameErrors },
    setValue: setUsernameValue,
  } = useForm<UsernameChangeFormValues>({
    resolver: zodResolver(usernameChangeSchema),
  });

  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(window.location.origin);
    }
    if (user?.displayName) {
      setUsernameValue('username', user.displayName);
    }
    if (user) {
      getDoc(doc(firestore, 'users', user.uid)).then((snap) => {
        if (snap.exists()) setSubscriptionStatus(snap.data()?.subscriptionStatus ?? null);
      });
    }
  }, [user, setUsernameValue]);


  const onUsernameSubmit: SubmitHandler<UsernameChangeFormValues> = async (data) => {
    setIsUsernameSubmitting(true);
    const success = await updateUserDisplayName(data.username);
    setIsUsernameSubmitting(false);
  };


  const onPasswordSubmit: SubmitHandler<PasswordChangeFormValues> = async (data) => {
    setIsPasswordSubmitting(true);
    const success = await updateUserPassword(data.currentPassword, data.newPassword);
    if (success) {
      resetPasswordForm();
    }
    setIsPasswordSubmitting(false);
  };
  
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
    return <AppShell><div className="flex justify-center items-center min-h-screen"><SmileyRockLoader /></div></AppShell>;
  }

  if (!user) {
    return <AppShell><div className="text-center p-8"><p>Please sign in to view your profile.</p></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="relative min-h-[calc(100vh-4rem)]">
        <div className="absolute top-0 left-0 right-0 h-[25vh] bg-secondary rounded-b-3xl" />
        <div className="relative z-10 flex flex-col h-full">
            <header className="container mx-auto px-4 pt-8 pb-4 text-primary-foreground">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                    <UserCircle className="h-8 w-8" />
                    Your Profile
                </h1>
                <p className="text-md text-primary/80">Manage your account settings and preferences.</p>
            </header>

            <main className="flex-grow container mx-auto px-4 mt-8">
              <div className="max-w-2xl mx-auto space-y-8 w-full">
                  {/* Username */}
                  <Card className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-xl border">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                              <UserCircle className="h-6 w-6 text-primary" />
                              Username
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                          <form onSubmit={handleSubmitUsername(onUsernameSubmit)} className="space-y-4">
                              <div className="space-y-2">
                                  <Label htmlFor="username" className="sr-only">Your username</Label>
                                  <div className="flex items-center gap-2">
                                      <Input 
                                          id="username" 
                                          type="text"
                                          {...registerUsername("username")}
                                          className={cn(usernameErrors.username ? "border-destructive" : "", "flex-grow h-12 text-base rounded-lg")}
                                      />
                                      <Button type="submit" disabled={isUsernameSubmitting || authLoading} className="h-12 rounded-lg">
                                          {isUsernameSubmitting ? <SmileyRockLoader /> : <Save className="h-4 w-4" />}
                                      </Button>
                                  </div>
                                  {usernameErrors.username && <p className="text-sm text-destructive">{usernameErrors.username.message}</p>}
                              </div>
                          </form>
                      </CardContent>
                  </Card>

                  {/* Subscription */}
                  <Card className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-xl border">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                              <Crown className="h-6 w-6 text-primary" />
                              Subscription
                          </CardTitle>
                          <CardDescription>Manage your SnapYoga plan.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          {subscriptionStatus === 'active' ? (
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <Badge className="bg-green-500 hover:bg-green-500 text-white gap-1">
                                          <Star className="h-3 w-3" /> Premium Active
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">Monthly plan</span>
                                  </div>
                                  <Button variant="outline" asChild className="h-9 rounded-lg text-sm">
                                      <Link href="/upgrade">Manage</Link>
                                  </Button>
                              </div>
                          ) : (
                              <div className="flex items-center justify-between">
                                  <div>
                                      <p className="font-medium">Free Plan</p>
                                      <p className="text-sm text-muted-foreground">Upgrade to unlock all features.</p>
                                  </div>
                                  <Button asChild className="h-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-1">
                                      <Link href="/upgrade"><Star className="h-4 w-4" /> Upgrade</Link>
                                  </Button>
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  {/* Change Password */}
                  <Card className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-xl border">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                              <KeyRound className="h-6 w-6 text-primary" />
                              Change Password
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                              <div className="space-y-2">
                                  <Label htmlFor="currentPassword">Current Password</Label>
                                  <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} placeholder="••••••••" className={cn(passwordErrors.currentPassword ? "border-destructive" : "", "h-12 text-base rounded-lg")}/>
                                  {passwordErrors.currentPassword && <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>}
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="newPassword">New Password</Label>
                                  <Input id="newPassword" type="password" {...registerPassword("newPassword")} placeholder="Minimum 6 characters" className={cn(passwordErrors.newPassword ? "border-destructive" : "", "h-12 text-base rounded-lg")}/>
                                  {passwordErrors.newPassword && <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>}
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                  <Input id="confirmNewPassword" type="password" {...registerPassword("confirmNewPassword")} placeholder="Re-type new password" className={cn(passwordErrors.confirmNewPassword ? "border-destructive" : "", "h-12 text-base rounded-lg")}/>
                                  {passwordErrors.confirmNewPassword && <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword.message}</p>}
                              </div>
                              <Button type="submit" className="w-full h-12 rounded-lg" disabled={isPasswordSubmitting || authLoading}>
                                  {isPasswordSubmitting ? <SmileyRockLoader /> : <Save className="mr-2 h-4 w-4" />}
                                  {isPasswordSubmitting ? "Updating..." : "Update Password"}
                              </Button>
                          </form>
                      </CardContent>
                  </Card>

                  {/* Analysis Logs */}
                  <Card className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-xl border">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                              <FileText className="h-6 w-6 text-primary" />
                              Your Past Analysis
                          </CardTitle>
                          <CardDescription>Review your past pose analysis sessions.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Button variant="outline" asChild className="w-full h-12 text-base rounded-lg">
                              <Link href="/profile/analysis-logs">View your analysis</Link>
                          </Button>
                      </CardContent>
                  </Card>

                  {/* Invite Friends */}
                  <Card className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-xl border">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                              <Share2 className="h-6 w-6 text-primary" />
                              {t('inviteFriendsTitle')}
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="text-center p-3 bg-green-100/50 text-green-800 border border-green-200 rounded-lg text-sm font-medium">
                              {t('referralBonusText')}
                          </div>
                          <div>
                              <p className="text-sm font-medium mb-1">{t('yourInviteLink')}</p>
                              <div className="flex items-center space-x-2">
                                  <Input type="text" value={inviteLink} readOnly className="text-sm text-muted-foreground h-12 text-base rounded-lg" aria-label="Invite Link" />
                                  <Button variant="outline" size="icon" onClick={handleCopyInviteLink} title="Copy Link" className="h-12 w-12 rounded-lg"><Copy className="h-5 w-5" /></Button>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <Button variant="outline" className="w-full rounded-lg h-12" asChild disabled={!inviteLink}><a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer"><MessageSquare className="mr-2 h-5 w-5" /> WhatsApp</a></Button>
                              <Button variant="outline" className="w-full rounded-lg h-12" onClick={handleInstagramShare} disabled={!inviteLink}><Share2 className="mr-2 h-5 w-5" /> Instagram</Button>
                              <Button variant="outline" className="w-full rounded-lg h-12" asChild disabled={!inviteLink}><a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer"><PinterestIcon className="mr-2 h-5 w-5" /> Pinterest</a></Button>
                          </div>
                          <p className="text-xs text-muted-foreground text-center w-full !mt-6">
                              {t('inviteLinkHelp')}
                          </p>
                      </CardContent>
                  </Card>
              </div>
            </main>
        </div>
      </div>
    </AppShell>
  );
}
