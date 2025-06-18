
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, UserCheck, ArrowRight, ArrowLeft, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserProfile extends DocumentData {
  displayName?: string;
  email?: string;
  gender?: string;
  ageGroup?: string;
  mainGoal?: string;
  height?: number;
  heightUnit?: 'cm' | 'in';
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  preferredYogaType?: string;
  currentBodyShape?: string;
  desiredBodyShape?: string;
  focusBodyParts?: string[];
}

export default function ProfileSummaryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth/signin');
      return;
    }

    setIsLoadingProfile(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    getDoc(userDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setProfileData(docSnap.data() as UserProfile);
        } else {
          // Should not happen if previous steps saved data
          console.error("Profile data not found for summary.");
        }
      })
      .catch(error => console.error("Error fetching profile summary:", error))
      .finally(() => setIsLoadingProfile(false));
  }, [user, authLoading, router]);

  const handleNext = () => {
    router.push('/onboarding/subscription');
  };

  const handleEdit = (stepPath: string) => {
    router.push(stepPath);
  }

  const renderDetailItem = (label: string, value?: string | number | string[] | null, unit?: string, editPath?: string) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      return null; // Don't render if value is not set
    }
    let displayValue = '';
    if (Array.isArray(value)) {
      displayValue = value.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ');
    } else if (typeof value === 'number') {
      displayValue = `${value}${unit || ''}`;
    } else {
      displayValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    return (
      <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
        <dt className="text-sm font-medium leading-6 text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm leading-6 text-foreground sm:col-span-2 sm:mt-0 flex justify-between items-center">
          <span>{displayValue}</span>
          {editPath && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(editPath)} className="text-xs text-primary hover:text-primary/80">
              <Edit3 className="mr-1 h-3 w-3" /> Edit
            </Button>
          )}
        </dd>
      </div>
    );
  };


  if (authLoading || isLoadingProfile) {
    return <AppShell><div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppShell>;
  }
  if (!user && !authLoading) {
     return <AppShell><div className="flex justify-center items-center min-h-screen"><p>Redirecting...</p></div></AppShell>;
  }


  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <UserCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Fitness Profile Summary</CardTitle>
            <CardDescription>Step 10 & 11 of 14: Review your selections. You can edit them if needed.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {profileData ? (
              <dl className="divide-y divide-border">
                {renderDetailItem("Display Name", profileData.displayName, undefined, '/onboarding/gender-profile')} {/* Assuming name/displayName is part of first steps */}
                {renderDetailItem("Email", profileData.email)}
                {renderDetailItem("Gender", profileData.gender, undefined, '/onboarding/gender-profile')}
                {renderDetailItem("Age Group", profileData.ageGroup, undefined, '/onboarding/age-group')}
                {renderDetailItem("Main Yoga Goal", profileData.mainGoal, undefined, '/onboarding/yoga-goal')}
                {renderDetailItem("Height", profileData.height, profileData.heightUnit, '/onboarding/measurements')}
                {renderDetailItem("Weight", profileData.weight, profileData.weightUnit, '/onboarding/measurements')}
                {renderDetailItem("Preferred Yoga Type", profileData.preferredYogaType, undefined, '/onboarding/yoga-type')}
                {renderDetailItem("Current Body Shape", profileData.currentBodyShape, undefined, '/onboarding/current-body-shape')}
                {renderDetailItem("Desired Body Shape", profileData.desiredBodyShape, undefined, '/onboarding/desired-body-shape')}
                {profileData.focusBodyParts && profileData.focusBodyParts.length > 0 && (
                  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-start">
                    <dt className="text-sm font-medium leading-6 text-muted-foreground">Focus Areas</dt>
                    <dd className="mt-1 text-sm leading-6 text-foreground sm:col-span-2 sm:mt-0 flex justify-between items-start">
                       <div className="flex flex-wrap gap-2">
                        {profileData.focusBodyParts.map(part => <Badge key={part} variant="secondary">{part.charAt(0).toUpperCase() + part.slice(1)}</Badge>)}
                      </div>
                       {profileData.focusBodyParts && (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit('/onboarding/focus-areas')} className="text-xs text-primary hover:text-primary/80 ml-2 shrink-0">
                          <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                       )}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-muted-foreground text-center">Could not load profile data.</p>
            )}
             <div className="flex flex-col sm:flex-row gap-2 mt-8">
                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                </Button>
                <Button onClick={handleNext} className="w-full text-lg py-6 flex-grow">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Next: Subscription Options
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
    </AppShell>
  );
}

    