
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
      ...additionalData, // Apply additionalData first
    };

    if (!userSnap.exists()) {
      dataToSet.createdAt = serverTimestamp();
      // Only set onboardingCompleted if it's not already in additionalData
      if (additionalData.onboardingCompleted === undefined) {
        dataToSet.onboardingCompleted = false;
      }
    } else {
      dataToSet.updatedAt = serverTimestamp();
      // If user exists and onboardingCompleted is true, and additionalData doesn't override it, keep it true.
      if (userSnap.data()?.onboardingCompleted === true && additionalData.onboardingCompleted === undefined) {
        dataToSet.onboardingCompleted = true;
      } else if (additionalData.onboardingCompleted === undefined) {
        // If additionalData doesn't specify onboardingCompleted, retain existing value or default to false
        dataToSet.onboardingCompleted = userSnap.data()?.onboardingCompleted || false;
      }
    }
    await setDoc(userRef, dataToSet, { merge: true });
  } catch (error) {
    console.error("Error in createUserProfileDocument:", error);
    throw error; // Re-throw the error to be caught by the caller
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
        }
      } catch (error) {
        console.error("Error processing auth state change or creating user profile:", error);
        // Optionally show a toast to the user about profile creation failure, but don't block app loading
      } finally {
        setLoading(false); // Ensure loading state is always updated
      }
    });
    return () => unsubscribe();
  }, []); // Empty dependency array ensures it runs once on mount

  const handleAuthSuccess = async (message: string, authUser: User, redirectPath: string = '/') => {
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
      // createUserProfileDocument is already called by onAuthStateChanged
      // We just need to determine the redirect path based on onboarding status
      const userDocRef = doc(firestore, 'users', result.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
        await handleAuthSuccess(`${providerName} sign-in successful.`, result.user, '/');
      } else {
        // If onboarding is not complete, or profile doesn't exist yet (onAuthStateChanged will create it)
        // redirect to onboarding.
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
      // createUserWithEmailAndPassword will trigger onAuthStateChanged, which handles profile creation.
      await createUserWithEmailAndPassword(auth, email, pass);
      // Do not call createUserProfileDocument here directly, onAuthStateChanged handles it.
      toast({ title: 'Account Created!', description: 'Please complete your profile.' });
      router.push('/auth/onboarding/details'); // Redirect to start onboarding
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
      // onAuthStateChanged will handle profile document check/creation.
      // We need to check onboarding status to redirect appropriately.
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data()?.onboardingCompleted) {
         await handleAuthSuccess('Signed in successfully.', userCredential.user, '/');
      } else {
        // If onboarding not complete, or profile doesn't exist yet, redirect to onboarding
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
      router.push('/'); // Redirect to home or sign-in page
      setUser(null); // Explicitly set user to null
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
    // setLoading(true); // This loading is for the page, not global auth loading
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
      // setLoading(false);
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
