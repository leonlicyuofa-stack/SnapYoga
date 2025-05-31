
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
  type AuthProvider as FirebaseAuthProvider,
  type AuthError,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase/clientApp';
import { doc, setDoc, getDoc, serverTimestamp, type DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const formatAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No user found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
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
  if (!user) return;

  const userRef = doc(firestore, `users/${user.uid}`);
  try {
    const userSnap = await getDoc(userRef);

    const { uid, email, displayName, photoURL } = user;
    const dataToSet: DocumentData = {
      uid,
      email,
      displayName: displayName || email?.split('@')[0] || 'User',
      photoURL,
      ...additionalData, 
    };

    if (!userSnap.exists()) {
      dataToSet.createdAt = serverTimestamp();
      if (additionalData.onboardingCompleted === undefined) {
        dataToSet.onboardingCompleted = false;
      }
    } else {
      dataToSet.updatedAt = serverTimestamp();
      if (userSnap.data()?.onboardingCompleted === true && additionalData.onboardingCompleted === undefined) {
        dataToSet.onboardingCompleted = true;
      } else if (additionalData.onboardingCompleted === undefined) {
        dataToSet.onboardingCompleted = userSnap.data()?.onboardingCompleted || false;
      }
    }
    await setDoc(userRef, dataToSet, { merge: true });
  } catch (error) {
    console.error("Error in createUserProfileDocument:", error);
    throw error; 
  }
};


const recordDailyLogin = async (userId: string) => {
  if (!userId) return;
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const loginDocRef = doc(firestore, `users/${userId}/dailyLogins/${todayStr}`);
  try {
    await setDoc(loginDocRef, { loggedInAt: serverTimestamp() }, { merge: true });
    console.log(`Login recorded for user ${userId} on ${todayStr}`);
  } catch (error) {
    console.error("Error recording daily login:", error);
    // Optionally, inform the user via a non-intrusive toast if this fails
  }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          await createUserProfileDocument(currentUser);
          // Do not record login here, as this fires on every auth state change (e.g. page reload)
        }
      } catch (error) {
        console.error("Error processing auth state change or creating user profile:", error);
      } finally {
        setLoading(false); 
      }
    });
    return () => unsubscribe();
  }, []); 

  const handleAuthSuccess = async (message: string, authUser: User, redirectPath: string = '/') => {
    await recordDailyLogin(authUser.uid); // Record login on successful auth action
    toast({ title: 'Success', description: message });
    router.push(redirectPath);
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
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const userDocRef = doc(firestore, 'users', result.user.uid);
      const userSnap = await getDoc(userDocRef);
      // Profile creation is handled by onAuthStateChanged, login record by handleAuthSuccess

      if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
        await handleAuthSuccess(`${providerName} sign-in successful.`, result.user, '/');
      } else {
        await handleAuthSuccess(`${providerName} sign-in successful. Please complete your profile.`, result.user, '/auth/onboarding/details');
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

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged handles profile creation.
      // For new sign-ups, we record the first login implicitly by redirecting,
      // but explicit call here ensures it if redirection is slow or user drops.
      // However, handleAuthSuccess will be called effectively by the redirect logic.
      // For direct sign up, we push to onboarding then potentially to home.
      // The login event can be recorded once user lands on dashboard after onboarding.
      // Or, record it when they sign up. Let's record it after sign up if successful.
      // For now, `handleAuthSuccess` is not called directly here to avoid double toast, onAuthStateChanged leads to createUserProfileDocument.
      // The redirect to onboarding then to home page will trigger a fresh user load there which can then count as first login.
      // To be more direct:
      await recordDailyLogin(userCredential.user.uid); 
      toast({ title: 'Account Created!', description: 'Please complete your profile.' });
      router.push('/auth/onboarding/details'); 
    } catch (error) {
      handleAuthError(error, 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
         await handleAuthSuccess('Signed in successfully.', userCredential.user, '/');
      } else {
        await handleAuthSuccess('Signed in successfully. Please complete your profile.', userCredential.user, '/auth/onboarding/details');
      }
    } catch (error) {
      handleAuthError(error, 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
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
    if (!user || !user.email) {
      toast({ title: "Error", description: "No authenticated user found or email is missing.", variant: "destructive" });
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: "Success", description: "Password updated successfully." });
      return true;
    } catch (error: any) {
      handleAuthError(error, 'Failed to update password.');
      return false;
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

    