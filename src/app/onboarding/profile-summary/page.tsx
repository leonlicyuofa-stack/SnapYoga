
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
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { QuadrantBackground } from '@/components/layout/QuadrantBackground';

interface UserProfile extends DocumentData {
  displayName?: string;
  email?: string;
  gender?: string;
  age?: number;
  mainGoals?: string[];
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
  
  const handleSave = async (fieldName: string | null, value: any) => {
    if (!user || fieldName === null) return;
    
    setIsSaving(true);
    try {
        await createUserProfileDocument(user, { [fieldName]: value });

        // Special handling for displayName as it exists in Auth and Firestore
        if (fieldName === 'displayName') {
            await updateUserDisplayName(value);
        }

        toast({
            title: "Profile Updated",
            description: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} has been successfully updated.`,
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

  const handleFieldChange = (value: any) => {
    setFieldValue(value);
    if (editingField) {
      handleSave(editingField, value);
    }
  }
  
  const renderEditComponent = (fieldName: string) => {
    switch(fieldName) {
      case 'displayName':
        return <Input value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} onBlur={() => handleSave(fieldName, fieldValue)} className="max-w-xs" />;
      case 'gender':
        return (
          <Select value={fieldValue} onValueChange={handleFieldChange}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'age':
         return (
            <Select value={fieldValue.toString()} onValueChange={(val) => handleFieldChange(parseInt(val, 10))}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {ageOptions.map(age => <SelectItem key={age} value={age}>{age}</SelectItem>)}
                </SelectContent>
            </Select>
        );
      case 'mainGoals':
        return (
            <div className="flex flex-col gap-2">
                {mainGoalOptions.map(opt => (
                    <Label key={opt.value} className="flex items-center gap-2 font-normal">
                        <Checkbox 
                            checked={fieldValue?.includes(opt.value)}
                            onCheckedChange={(checked) => {
                                const current = fieldValue || [];
                                const newValue = checked ? [...current, opt.value] : current.filter((p: string) => p !== opt.value);
                                setFieldValue(newValue);
                                handleSave(fieldName, newValue);
                            }}
                        />
                        {opt.label}
                    </Label>
                ))}
            </div>
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
                                handleSave(fieldName, newValue);
                            }}
                        />
                        {opt.label}
                    </Label>
                ))}
            </div>
        );
       case 'currentBodyShape':
        return (
            <Select value={fieldValue} onValueChange={handleFieldChange}>
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
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        </AppShell>
    );
  }
  if (!user && !authLoading) {
     return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting...</p></div></AppShell>;
  }


  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
      <QuadrantBackground />
      <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 m-4">
        <OnboardingHeader />
        <div className="w-full mt-8">
            <div className="px-4 sm:px-0">
                {profileData ? (
                <dl className="divide-y divide-border">
                    {renderDetailItem("Username", "displayName", profileData.displayName)}
                    {renderDetailItem("Email", "email", user.email)}
                    {renderDetailItem("Gender", "gender", profileData.gender)}
                    {renderDetailItem("Age", "age", profileData.age)}
                    {renderDetailItem("Main Yoga Goals", "mainGoals", profileData.mainGoals)}
                    {renderDetailItem("Interested Pose Types", "interestedPoses", profileData.interestedPoses)}
                    {renderDetailItem("Current Body Shape", "currentBodyShape", profileData.currentBodyShape)}
                </dl>
                ) : (
                <p className="text-muted-foreground text-center">Could not load profile data.</p>
                )}
            </div>
            <div className="mt-6">
                <p className="text-xs text-muted-foreground text-center w-full">
                Ensure all details are correct before proceeding.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

    