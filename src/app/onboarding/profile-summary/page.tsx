"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit3, Loader2, Spline, Dumbbell, BrainCircuit, MoreHorizontal, Wind, HeartPulse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OnboardingScaffold } from '@/components/onboarding/onboarding-scaffold';


interface UserProfile extends DocumentData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  mainGoals?: string[];
  interestedPoses?: string[];
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

export default function ProfileSummaryPage() {
  const { user, loading: authLoading, updateUserDisplayName } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
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
    router.push('/onboarding/subscription');
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
        return <Input value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} onBlur={() => handleSave(fieldName, fieldValue)} className="sy-input max-w-xs" />;
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
                            className="border-[rgba(193,154,107,0.5)] data-[state=checked]:bg-[rgba(193,154,107,0.85)] data-[state=checked]:text-black"
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
                            className="border-[rgba(193,154,107,0.5)] data-[state=checked]:bg-[rgba(193,154,107,0.85)] data-[state=checked]:text-black"
                        />
                        {opt.label}
                    </Label>
                ))}
            </div>
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
            <Badge key={v} variant="secondary" className="bg-[rgba(193,154,107,0.18)] text-[rgba(255,240,215,0.92)] border-none">{v.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Badge>
          )}
        </div>
      );
    }
    else {
      // Emails are case-sensitive identifiers — never title-case them.
      displayValue = <span className={fieldName === 'email' ? undefined : 'capitalize'}>{value.toString()}</span>;
    }
    
    const isCurrentlyEditing = editingField === fieldName;
    
    return (
      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-start border-b border-[rgba(193,154,107,0.18)]">
        <dt className="sy-subtitle text-sm font-medium leading-6">{label}</dt>
        <dd className="sy-body mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 flex justify-between items-start gap-2">
          {isCurrentlyEditing ? (
            <div className="flex-grow space-y-2">
                {renderEditComponent(fieldName)}
            </div>
          ) : (
            <>
                <div className="flex-grow">{displayValue}</div>
                <Button variant="ghost" size="sm" onClick={() => handleEditClick(fieldName, value)} className="sy-accent text-xs hover:opacity-80 shrink-0">
                  <Edit3 className="mr-1 h-3 w-3" /> Edit
                </Button>
            </>
          )}
        </dd>
      </div>
    );
  };
  
  const handleBackNavigation = () => {
    router.back();
  };
  
  const getInitials = (email?: string | null, displayName?: string | null) => {
    if (displayName) {
      const names = displayName.split(' ');
      if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    if (email) {
      const parts = email.split('@')[0].split(/[._-]/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (authLoading || isLoadingProfile) {
    return (
        <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>
    );
  }

  return (
    <OnboardingScaffold
      title="Your summary"
      subtitle="Let's review your profile."
      step={4}
      totalSteps={5}
      onBack={handleBackNavigation}
      next={
        <Button
          onClick={handleNext}
          variant="ghost"
          className="rounded-full h-12 w-12 p-0 bg-[#320E3B] dark:bg-black/30 hover:bg-[#320E3B]/90 dark:hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-[rgba(50,14,59,0.4)] dark:border-white/20"
          aria-label="Next"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      }
    >
                    {profileData?.photoURL && (
                        <Avatar className="w-24 h-24 mx-auto mb-6 border-4 border-[rgba(193,154,107,0.25)]">
                            <AvatarImage src={profileData.photoURL} alt={profileData.displayName || 'User Avatar'} />
                            <AvatarFallback className="text-2xl bg-[rgba(193,154,107,0.18)]">
                                {getInitials(profileData.email, profileData.displayName)}
                            </AvatarFallback>
                        </Avatar>
                    )}

                    <main>
                        {profileData ? (
                        <dl>
                            {renderDetailItem("Username", "displayName", profileData.displayName)}
                            {renderDetailItem("Email", "email", user.email)}
                            {renderDetailItem("Main Yoga Goals", "mainGoals", profileData.mainGoals)}
                            {renderDetailItem("Interested Pose Types", "interestedPoses", profileData.interestedPoses)}
                        </dl>
                        ) : (
                        <p className="sy-body text-center">Could not load profile data.</p>
                        )}
                        <p className="sy-body text-xs text-center w-full mt-6">
                            Ensure all details are correct before proceeding.
                        </p>
                    </main>
    </OnboardingScaffold>
  );
}
