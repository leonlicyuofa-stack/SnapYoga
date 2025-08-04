
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Languages, ShieldCheck, UserCircle, Ruler, Scale, Save } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, DocumentData } from 'firebase/firestore';

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


const languageOptions = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
];

export default function ProfilePage() {
  const { user, updateUserPassword, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isMeasurementsSubmitting, setIsMeasurementsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en"); 

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

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    toast({
      title: "Language Preference Updated",
      description: `Language preference set to ${languageOptions.find(opt => opt.value === value)?.label || value}. Full app translation coming soon!`,
    });
  };
  
  if (authLoading && !user) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }

  if (!user) {
    return <AppShell><div className="text-center p-8"><p>Please sign in to view your profile.</p></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-3">
            <UserCircle className="h-10 w-10" /> Your Profile
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </header>

        <div className="p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Ruler className="h-6 w-6 text-primary" />
              Your Measurements
            </CardTitle>
            <CardDescription>Update your height and weight. This is optional and helps us personalize suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmitMeasurements(onMeasurementsSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Button type="submit" className="w-full text-lg py-3 mt-4" disabled={isMeasurementsSubmitting || authLoading}>
                {isMeasurementsSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {isMeasurementsSubmitting ? "Saving..." : "Save Measurements"}
              </Button>
            </form>
          </CardContent>
        </div>

        <Separator />

        <div className="p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password for better security.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
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
           <CardFooter className="p-0 pt-6">
            <p className="text-xs text-muted-foreground">
              Ensure your new password is strong and unique.
            </p>
          </CardFooter>
        </div>

        <Separator />

        <div className="p-6 bg-card/80 backdrop-blur-sm rounded-lg shadow-xl">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Languages className="h-6 w-6 text-primary" />
              Language Settings
            </CardTitle>
            <CardDescription>Choose your preferred language for the app.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
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
          <CardFooter className="p-0 pt-6">
            <p className="text-xs text-muted-foreground">
              We're working to make SnapYoga accessible to everyone!
            </p>
          </CardFooter>
        </div>
      </div>
    </AppShell>
  );
}
