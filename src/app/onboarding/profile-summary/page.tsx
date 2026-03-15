"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, createUserProfileDocument } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Edit3, Loader2, Spline, Dumbbell, BrainCircuit, MoreHorizontal, Wind, HeartPulse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
        return <Input value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} onBlur={() => handleSave(fieldName, fieldValue)} className="max-w-xs bg-white/20 text-white placeholder:text-white/50" />;
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
                            className="border-white/50 data-[state=checked]:bg-white/80 data-[state=checked]:text-black"
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
                            className="border-white/50 data-[state=checked]:bg-white/80 data-[state=checked]:text-black"
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
            <Badge key={v} variant="secondary" className="bg-white/20 text-white/90 border-none">{v.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Badge>
          )}
        </div>
      );
    }
    else {
      displayValue = <span className="capitalize">{value.toString()}</span>;
    }
    
    const isCurrentlyEditing = editingField === fieldName;
    
    return (
      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-start border-b border-white/20">
        <dt className="text-sm font-medium leading-6 text-white/80">{label}</dt>
        <dd className="mt-1 text-sm leading-6 text-white sm:col-span-2 sm:mt-0 flex justify-between items-start gap-2">
          {isCurrentlyEditing ? (
            <div className="flex-grow space-y-2">
                {renderEditComponent(fieldName)}
            </div>
          ) : (
            <>
                <div className="flex-grow">{displayValue}</div>
                <Button variant="ghost" size="sm" onClick={() => handleEditClick(fieldName, value)} className="text-xs text-white/80 hover:text-white shrink-0">
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
    <div className="relative min-h-screen font-serif text-white">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-2xl relative">
                 <Button
                    onClick={handleBackNavigation}
                    variant="ghost"
                    className="absolute top-4 left-4 rounded-full h-12 w-12 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8">
                    <header className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Your Summary</h1>
                        <p className="text-sm text-white/80 mb-6">Let's review your profile.</p>
                         {profileData?.photoURL && (
                            <Avatar className="w-24 h-24 mx-auto border-4 border-white/20">
                                <AvatarImage src={profileData.photoURL} alt={profileData.displayName || 'User Avatar'} />
                                <AvatarFallback className="text-2xl bg-white/20">
                                    {getInitials(profileData.email, profileData.displayName)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </header>
                    
                    <main>
                        {profileData ? (
                        <dl>
                            {renderDetailItem("Username", "displayName", profileData.displayName)}
                            {renderDetailItem("Email", "email", user.email)}
                            {renderDetailItem("Main Yoga Goals", "mainGoals", profileData.mainGoals)}
                            {renderDetailItem("Interested Pose Types", "interestedPoses", profileData.interestedPoses)}
                        </dl>
                        ) : (
                        <p className="text-white/80 text-center">Could not load profile data.</p>
                        )}
                        <p className="text-xs text-white/60 text-center w-full mt-6">
                            Ensure all details are correct before proceeding.
                        </p>
                    </main>
                </div>
                 <Button
                    onClick={handleNext}
                    variant="ghost"
                    className="absolute bottom-4 right-4 rounded-full h-14 w-14 p-0 bg-black/30 hover:bg-black/50 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/20 z-20"
                    aria-label="Next"
                >
                    <ArrowRight className="h-7 w-7" />
                </Button>
            </div>
        </div>
    </div>
  );
}
