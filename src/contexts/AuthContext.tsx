
"use client";

import type { ReactNode } from 'react';
import * as React from 'react';
import {
  type User,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type FirebaseAuthProvider,
  type AuthError,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { auth, firestore, storage } from '@/lib/firebase/clientApp';
import { doc, setDoc, getDoc, serverTimestamp, type DocumentData } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { getAvatarDataUri } from '@/lib/avatar-utils';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, profileData: DocumentData) => Promise<UserCredential | null>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateUserDisplayName: (newDisplayName: string) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const formatAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please sign in again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup closed by user. Please try again.';
    case 'auth/cancelled-popup-request':
       return 'Multiple popup requests. Please complete one before starting another.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.';
    case 'auth/oauth-credential-already-in-use':
      return 'This Apple ID is already associated with another user account.';
    default:
      if (error.customData && (error.customData as any)._tokenResponse?.error?.message) {
        return (error.customData as any)._tokenResponse.error.message;
      }
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export const createUserProfileDocument = async (user: User, additionalData: DocumentData = {}) => {
  if (!user || !firestore) return;

  const userRef = doc(firestore, `users/${user.uid}`);
  try {
    const userSnap = await getDoc(userRef);

    const { uid, email } = user;
    let photoURL = user.photoURL;
    let displayName = user.displayName || additionalData.displayName || email?.split('@')[0] || 'User';

    let dataUriForUpload: string | null = null;
    
    // Handle custom avatar upload (if avatar is a data URI)
    if (additionalData.avatar && additionalData.avatar.startsWith('data:image')) {
        dataUriForUpload = additionalData.avatar;
    } 
    // Handle preset avatar selection
    else if (additionalData.avatar && additionalData.avatar.startsWith('avatar')) {
        dataUriForUpload = await getAvatarDataUri(additionalData.avatar);
    }
    
    if (dataUriForUpload) {
        const avatarId = uuidv4();
        const avatarRef = ref(storage, `avatars/${user.uid}/${avatarId}.png`);
        await uploadString(avatarRef, dataUriForUpload, 'data_url');
        photoURL = await getDownloadURL(avatarRef);

        // Update Auth profile with new photo URL
        await updateProfile(user, { photoURL: photoURL });
    }

    const dataToSet: DocumentData = {
      uid,
      email,
      displayName: displayName,
      photoURL: photoURL,
      emailVerified: user.emailVerified,
      ...additionalData,
    };
    
    // Store the avatar ID, not the data URI, in Firestore
    if (additionalData.avatar && !additionalData.avatar.startsWith('data:image')) {
      dataToSet.avatar = additionalData.avatar;
    } else {
      // If it was a custom upload, store the final URL.
      dataToSet.avatar = photoURL;
    }


    if (!userSnap.exists()) {
      dataToSet.createdAt = serverTimestamp();
      if (additionalData.onboardingCompleted === undefined) {
        dataToSet.onboardingCompleted = false;
      }
    } else {
      dataToSet.updatedAt = serverTimestamp();
      if (additionalData.onboardingCompleted === undefined) {
        dataToSet.onboardingCompleted = userSnap.data()?.onboardingCompleted || false;
      }
    }
    
    if (dataToSet.name && !additionalData.displayName && dataToSet.displayName === dataToSet.name) {
        delete dataToSet.name;
    }
    
    if (dataToSet.birthday instanceof Date) {
        dataToSet.birthday = serverTimestamp();
    }

    await setDoc(userRef, dataToSet, { merge: true });
  } catch (error) {
    console.error("Error in createUserProfileDocument:", error);
    throw error;
  }
};


const recordDailyLogin = async (userId: string) => {
  if (!userId || !firestore) return;
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const loginDocRef = doc(firestore, `users/${userId}/dailyLogins/${todayStr}`);
  try {
    await setDoc(loginDocRef, { loggedInAt: serverTimestamp() }, { merge: true });
    console.log(`Login recorded for user ${userId} on ${todayStr}`);
  } catch (error) {
    console.error("Error recording daily login:", error);
  }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!auth) {
        console.error("Firebase Auth is not initialized. Authentication features will be disabled.");
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          await createUserProfileDocument(currentUser); 
        }
      } catch (error) {
        console.error("Error processing auth state change or creating user profile:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  
  const checkFirebaseConfig = () => {
    if (!auth || !firestore) {
      toast({
        title: "Firebase Not Configured",
        description: "Please ensure all Firebase credentials in your .env file are correct.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleAuthError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const friendlyMessage = error.code ? formatAuthError(error as AuthError) : defaultMessage;
    toast({
      title: 'Authentication Error',
      description: friendlyMessage,
      variant: 'destructive',
    });
  };

  const socialSignIn = async (provider: FirebaseAuthProvider, providerName: string) => {
    if (!checkFirebaseConfig()) return;
    
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await recordDailyLogin(result.user.uid);
      await createUserProfileDocument(result.user, { 
        displayName: result.user.displayName, 
        email: result.user.email, 
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified
      });

      const userDocRef = doc(firestore, 'users', result.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
        toast({ title: 'Success', description: `${providerName} sign-in successful. Welcome back!` });
        router.push('/dashboard');
      } else {
        toast({ title: 'Success', description: `${providerName} sign-in successful. Let's get you set up.` });
        router.push('/onboarding/gender-profile');
      }
    } catch (error) {
      handleAuthError(error, `Failed to sign in with ${providerName}.`);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => socialSignIn(new GoogleAuthProvider(), 'Google');

  const signInWithApple = () => {
    const provider = new OAuthProvider('apple.com');
    return socialSignIn(provider, 'Apple');
  };

  const signUpWithEmail = async (email: string, pass: string, profileData: DocumentData): Promise<UserCredential | null> => {
    if (!checkFirebaseConfig()) {
      throw new Error("Firebase not configured");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await recordDailyLogin(userCredential.user.uid);
      
      const displayName = profileData.displayName || userCredential.user.displayName;
      await updateProfile(userCredential.user, { displayName });
      
      await createUserProfileDocument(userCredential.user, { ...profileData, displayName, email });
      
      return userCredential;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          title: "Email Already in Use",
          description: "Signing you in instead.",
        });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, pass);
          await recordDailyLogin(userCredential.user.uid);
          return userCredential;
        } catch (signInError) {
           handleAuthError(signInError, 'Failed to sign in with existing email.');
           throw signInError;
        }
      } else {
        handleAuthError(error, 'Failed to create account.');
        throw error;
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!checkFirebaseConfig()) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      
      await recordDailyLogin(userCredential.user.uid);
      await createUserProfileDocument(userCredential.user);

      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
         toast({ title: 'Success', description: 'Signed in successfully. Welcome back!' });
         router.push('/dashboard');
      } else {
        toast({ title: 'Success', description: 'Signed in successfully. Let\'s complete your profile.' });
        router.push('/onboarding/gender-profile');
      }
    } catch (error) {
      handleAuthError(error, 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    if (!checkFirebaseConfig()) return;

    setLoading(true);
    try {
      await signOut(auth);
      toast({ title: 'Signed Out', description: 'You have been signed out successfully.' });
      router.push('/');
      setUser(null);
    } catch (error) {
      handleAuthError(error, 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!checkFirebaseConfig() || !user?.email) {
       if (user) toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
      return false;
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: "Success", description: "Password updated successfully." });
      return true;
    } catch (error: any) {
      handleAuthError(error, 'Failed to update password.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserDisplayName = async (newDisplayName: string): Promise<boolean> => {
    if (!checkFirebaseConfig() || !user) {
      if (!user) toast({ title: "Error", description: "You must be logged in to update your username.", variant: "destructive" });
      return false;
    }
    setLoading(true);
    try {
      await updateProfile(user, { displayName: newDisplayName });
      await createUserProfileDocument(user, { displayName: newDisplayName });
      
      setUser({ ...user, displayName: newDisplayName });
      
      return true;
    } catch (error: any) {
      handleAuthError(error, 'Failed to update username.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signUpWithEmail,
    signInWithEmail,
    signOutUser,
    updateUserPassword,
    updateUserDisplayName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
