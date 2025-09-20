
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { UserCheck, ArrowRight, Edit3, MoveUpRight, Loader2, Save, X, Check, CheckCircle, Spline, Dumbbell, BrainCircuit, MoreHorizontal, Wind, HeartPulse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface UserProfile extends DocumentData {
  displayName?: string;
  email?: string;
  gender?: string;
  age?: number;
  mainGoal?: string;
  interestedPoses?: string[];
  currentBodyShape?: string;
  focusBodyParts?: string[];
}

const mainGoalOptions = [
  { value: "fitness", label: "Stay Fit", icon: HeartPulse },
  { value: "stress-relief", label: "Stress Relief", icon: Wind },
  { value: "flexibility", label: "Improve Flexibility", icon: Spline },
  { value: "strength", label: "Build Strength", icon: Dumbbell },
  { value: "mindfulness", label: "Practice Mindfulness", icon: BrainCircuit },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

const poseCategoryOptions = [
  { id: "standing", label: "Standing Poses" },
  { id: "seated", label: "Seated Poses" },
  { id: "backbends", label: "Backbends" },
  { id: "inversions-balancing", label: "Inversions & Balancing" },
];

const bodyShapeOptions = [
  { value: "inverted-triangle", label: "Inverted Triangle" },
  { value: "hourglass", label: "Hourglass" },
  { value: "triangle", label: "Triangle" },
  { value: "round", label: "Round" },
  { value: "rectangle", label: "Rectangle" },
];

const ageOptions = Array.from({ length: 83 }, (_, i) => (i + 18).toString());

export default function ProfileSummaryPage() {
  const { user, loading: authLoading, updateUserDisplayName } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isNavigatingNext, setIsNavigatingNext] = useState(false);
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth/signin');
      return;
    }
    fetchProfileData();
  }, [user, authLoading, router]);
  
  const fetchProfileData = () => {
    if (!user) return;
    setIsLoadingProfile(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    getDoc(userDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setProfileData(docSnap.data() as UserProfile);
        } else {
          console.error("Profile data not found for summary.");
        }
      })
      .catch(error => console.error("Error fetching profile summary:", error))
      .finally(() => setIsLoadingProfile(false));
  };


  const handleNext = () => {
    setIsNavigatingNext(true);
    setTimeout(() => {
        router.push('/onboarding/subscription');
    }, 500);
  };
  
  const handleEditClick = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setFieldValue(currentValue);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setFieldValue(null);
  };
  
  const handleSave = async () => {
    if (!user || editingField === null) return;
    
    setIsSaving(true);
    try {
        await createUserProfileDocument(user, { [editingField]: fieldValue });

        // Special handling for displayName as it exists in Auth and Firestore
        if (editingField === 'displayName') {
            await updateUserDisplayName(fieldValue);
        }

        toast({
            title: "Profile Updated",
            description: `${editingField.charAt(0).toUpperCase() + editingField.slice(1)} has been successfully updated.`,
        });
        
        // Refetch data to show the latest state
        await fetchProfileData();
        
        handleCancelEdit();
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({ title: "Update Failed", description: "Could not save your changes.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const renderEditComponent = (fieldName: string) => {
    switch(fieldName) {
      case 'displayName':
        return <Input value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} className="max-w-xs" />;
      case 'gender':
        return (
          <Select value={fieldValue} onValueChange={setFieldValue}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'age':
         return (
            <Select value={fieldValue.toString()} onValueChange={(val) => setFieldValue(parseInt(val, 10))}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {ageOptions.map(age => <SelectItem key={age} value={age}>{age}</SelectItem>)}
                </SelectContent>
            </Select>
        );
      case 'mainGoal':
        return (
            <Select value={fieldValue} onValueChange={setFieldValue}>
                <SelectTrigger className="w-full sm:w-[240px]"><SelectValue placeholder="Select a goal" /></SelectTrigger>
                <SelectContent>
                    {mainGoalOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
            </Select>
        );
      case 'interestedPoses':
        return (
            <div className="flex flex-col gap-2">
                {poseCategoryOptions.map(opt => (
                    <Label key={opt.id} className="flex items-center gap-2 font-normal">
                        <Checkbox 
                            checked={fieldValue?.includes(opt.id)}
                            onCheckedChange={(checked) => {
                                const current = fieldValue || [];
                                const newValue = checked ? [...current, opt.id] : current.filter((p: string) => p !== opt.id);
                                setFieldValue(newValue);
                            }}
                        />
                        {opt.label}
                    </Label>
                ))}
            </div>
        );
       case 'currentBodyShape':
        return (
            <Select value={fieldValue} onValueChange={setFieldValue}>
                <SelectTrigger className="w-full sm:w-[240px]"><SelectValue placeholder="Select a shape" /></SelectTrigger>
                <SelectContent>
                    {bodyShapeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                     <SelectItem value="not-provided">Prefer not to say</SelectItem>
                </SelectContent>
            </Select>
        );
      default:
        return <p>Editing not supported for this field.</p>
    }
  }


  const renderDetailItem = (label: string, fieldName: string, value?: string | number | string[] | null) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      return null;
    }
    
    let displayValue: React.ReactNode = '';

    if (Array.isArray(value)) {
      displayValue = (
        <div className="flex flex-wrap gap-2">
          {value.map(v => 
            <Badge key={v} variant="secondary">{v.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Badge>
          )}
        </div>
      );
    }
    else {
      displayValue = <span className="capitalize">{value.toString()}</span>;
    }
    
    const isCurrentlyEditing = editingField === fieldName;
    
    return (
      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-start">
        <dt className="text-sm font-medium leading-6 text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm leading-6 text-foreground sm:col-span-2 sm:mt-0 flex justify-between items-start gap-2">
          {isCurrentlyEditing ? (
            <div className="flex-grow space-y-2">
                {renderEditComponent(fieldName)}
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4" />}
                        <span className="ml-2">Save</span>
                    </Button>
                     <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                        <span className="ml-2">Cancel</span>
                    </Button>
                </div>
            </div>
          ) : (
            <>
                <div className="flex-grow">{displayValue}</div>
                <Button variant="ghost" size="sm" onClick={() => handleEditClick(fieldName, value)} className="text-xs text-primary hover:text-primary/80 shrink-0">
                  <Edit3 className="mr-1 h-3 w-3" /> Edit
                </Button>
            </>
          )}
        </dd>
      </div>
    );
  };


  if (authLoading || isLoadingProfile) {
    return (
        <AppShell>
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <SmileyRockLoader />
            </div>
        </AppShell>
    );
  }
  if (!user && !authLoading) {
     return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting...</p></div></AppShell>;
  }


  return (
    <AppShell>
      <div className="relative flex flex-col min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4">
        
        <div className="w-full max-w-2xl flex flex-col items-center">
            <OnboardingHeader />
            <Card className="w-full shadow-xl z-10 bg-card/80 backdrop-blur-sm">
            <CardContent className="px-4 sm:px-6 pt-6">
                {profileData ? (
                <dl className="divide-y divide-border">
                    {renderDetailItem("Username", "displayName", profileData.displayName)}
                    {renderDetailItem("Email", "email", user.email)}
                    {renderDetailItem("Gender", "gender", profileData.gender)}
                    {renderDetailItem("Age", "age", profileData.age)}
                    {renderDetailItem("Main Yoga Goal", "mainGoal", profileData.mainGoal)}
                    {renderDetailItem("Interested Pose Types", "interestedPoses", profileData.interestedPoses)}
                    {renderDetailItem("Current Body Shape", "currentBodyShape", profileData.currentBodyShape)}
                </dl>
                ) : (
                <p className="text-muted-foreground text-center">Could not load profile data.</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 mt-8 justify-center">
                    
                    <Button 
                    onClick={handleNext} 
                    className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                    disabled={isNavigatingNext}
                    >
                    {isNavigatingNext ? <Loader2 className="animate-spin" /> : <><span>Next: Subscription Options</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground text-center w-full">
                Ensure all details are correct before proceeding.
                </p>
            </CardFooter>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}

    