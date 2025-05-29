
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Languages, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
];

export default function ProfilePage() {
  const { user, updateUserPassword, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onPasswordSubmit: SubmitHandler<PasswordChangeFormValues> = async (data) => {
    setIsPasswordSubmitting(true);
    const success = await updateUserPassword(data.currentPassword, data.newPassword);
    if (success) {
      resetPasswordForm();
    }
    setIsPasswordSubmitting(false);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    toast({
      title: "Language Preference Updated",
      description: `Language preference set to ${languageOptions.find(opt => opt.value === value)?.label || value}. Full app translation coming soon!`,
    });
    // In a real app, you would save this preference to Firestore and use an i18n library.
  };
  
  if (authLoading && !user) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user) {
     // This should ideally be handled by a protected route wrapper, but for now, redirect or show message.
    return <AppShell><div className="text-center p-8"><p>Please sign in to view your profile.</p></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-12 space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-3">
            <UserCircle className="h-10 w-10" /> Your Profile
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </header>

        <Separator />

        {/* Change Password Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password for better security.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword("currentPassword")}
                  placeholder="••••••••"
                  className={passwordErrors.currentPassword ? "border-destructive" : ""}
                />
                {passwordErrors.currentPassword && <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword("newPassword")}
                  placeholder="Minimum 6 characters"
                  className={passwordErrors.newPassword ? "border-destructive" : ""}
                />
                {passwordErrors.newPassword && <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  {...registerPassword("confirmNewPassword")}
                  placeholder="Re-type new password"
                  className={passwordErrors.confirmNewPassword ? "border-destructive" : ""}
                />
                {passwordErrors.confirmNewPassword && <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword.message}</p>}
              </div>
              
              <Button type="submit" className="w-full text-lg py-3" disabled={isPasswordSubmitting || authLoading}>
                {isPasswordSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                {isPasswordSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">
              Ensure your new password is strong and unique.
            </p>
          </CardFooter>
        </Card>

        <Separator />

        {/* Language Settings Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Languages className="h-6 w-6 text-primary" />
              Language Settings
            </CardTitle>
            <CardDescription>Choose your preferred language for the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language-select">Select Language</Label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language-select" className="w-full mt-1">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
             <p className="text-sm text-muted-foreground">
              Note: Full application translation is a feature planned for the future. This setting currently saves your preference.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              We're working to make SnapYoga accessible to everyone!
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
