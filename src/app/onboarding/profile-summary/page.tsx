
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { UserCheck, ArrowRight, ArrowLeft, Edit3, MoveUpRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SmileyRockLoader } from '@/components/layout/smiley-rock-loader';
import { format } from 'date-fns';
import { OnboardingHeader } from '@/components/features/onboarding/OnboardingHeader';

interface UserProfile extends DocumentData {
  displayName?: string;
  email?: string;
  gender?: string;
  age?: number;
  mainGoal?: string;
  interestedPoses?: string[];
  currentBodyShape?: string;
  desiredBodyShape?: string;
  focusBodyParts?: string[];
}

export default function ProfileSummaryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isNavigatingNext, setIsNavigatingNext] = useState(false);

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
          console.error("Profile data not found for summary.");
        }
      })
      .catch(error => console.error("Error fetching profile summary:", error))
      .finally(() => setIsLoadingProfile(false));
  }, [user, authLoading, router]);

  const handleNext = () => {
    setIsNavigatingNext(true);
    setTimeout(() => {
        router.push('/onboarding/subscription');
    }, 500);
  };

  const handleBackNavigation = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 500);
  };

  const handleEdit = (stepPath: string) => {
    router.push(stepPath);
  }

  const renderDetailItem = (label: string, value?: string | number | string[] | null, editPath?: string) => {
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
    } else if (label === "Birthday" && typeof value === 'string') {
        try {
            displayValue = format(new Date(value), 'PPP');
        } catch (e) {
            displayValue = value;
        }
    }
    else {
      displayValue = <span className="capitalize">{value.toString()}</span>;
    }
    
    return (
      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-start">
        <dt className="text-sm font-medium leading-6 text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm leading-6 text-foreground sm:col-span-2 sm:mt-0 flex justify-between items-start gap-2">
          <div className="flex-grow">{displayValue}</div>
          {editPath && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(editPath)} className="text-xs text-primary hover:text-primary/80 shrink-0">
              <Edit3 className="mr-1 h-3 w-3" /> Edit
            </Button>
          )}
        </dd>
      </div>
    );
  };


  if (authLoading || isLoadingProfile) {
    return (
        <AppShell>
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <SmileyRockLoader text="Loading your profile..." />
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
                    {renderDetailItem("Nickname", profileData.displayName, '/onboarding/gender-profile')}
                    {renderDetailItem("Email", user.email)}
                    {renderDetailItem("Gender", profileData.gender, '/onboarding/gender-profile')}
                    {renderDetailItem("Age", profileData.age, '/onboarding/gender-profile')}
                    {renderDetailItem("Main Yoga Goal", profileData.mainGoal, '/onboarding/yoga-goal')}
                    {renderDetailItem("Interested Pose Types", profileData.interestedPoses, '/onboarding/yoga-type')}
                    {renderDetailItem("Current Body Shape", profileData.currentBodyShape, '/onboarding/current-body-shape')}
                    {renderDetailItem("Focus Areas", profileData.focusBodyParts, '/onboarding/focus-areas')}
                </dl>
                ) : (
                <p className="text-muted-foreground text-center">Could not load profile data.</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 mt-8 justify-center">
                    
                    <Button 
                    onClick={handleNext} 
                    className="w-auto rounded-full h-10 px-6 bg-white/30 hover:bg-white/50 text-splash-foreground text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm border-white/40"
                    disabled={isNavigatingBack || isNavigatingNext}
                    >
                    {isNavigatingNext ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Next: Subscription Options</span><MoveUpRight className="ml-2 h-5 w-5" /></>}
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
