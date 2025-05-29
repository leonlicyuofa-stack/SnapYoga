
"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type AuthProvider as FirebaseAuthProvider,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase/clientApp';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (message: string, redirectPath: string = '/') => {
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
    try {
      await signInWithPopup(auth, provider);
      handleAuthSuccess(`${providerName} sign-in successful.`);
    } catch (error) {
      handleAuthError(error, `Failed to sign in with ${providerName}.`);
    }
  };

  const signInWithGoogle = () => socialSignIn(new GoogleAuthProvider(), 'Google');
  const signInWithFacebook = () => socialSignIn(new FacebookAuthProvider(), 'Facebook');

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      handleAuthSuccess('Account created successfully! You are now signed in.');
    } catch (error) {
      handleAuthError(error, 'Failed to create account.');
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      handleAuthSuccess('Signed in successfully.');
    } catch (error) {
      handleAuthError(error, 'Failed to sign in.');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Signed Out', description: 'You have been signed out successfully.' });
      router.push('/'); // Redirect to home or sign-in page after sign out
    } catch (error) {
      handleAuthError(error, 'Failed to sign out.');
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signUpWithEmail,
    signInWithEmail,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
