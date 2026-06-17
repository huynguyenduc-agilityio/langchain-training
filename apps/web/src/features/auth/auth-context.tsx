'use client';

import type { AuthContextType, AuthUser } from '@/types';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { Car } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_EMAIL_USER_PREFIX, MOCK_USER } from '@/constants';
import {
  auth,
  signOut as firebaseSignOut,
  googleProvider,
  isFirebaseConfigured,
  signInWithPopup,
} from '@/lib/firebase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1. Initialize user state synchronously. For mock mode, read from localStorage.
  // We check typeof window to prevent SSR errors during build.
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined' && (!isFirebaseConfigured || !auth)) {
      const savedUser = localStorage.getItem('cityride_mock_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          localStorage.removeItem('cityride_mock_user');
        }
      }
    }
    return null;
  });

  // 2. Track hydration/mount state
  const [mounted, setMounted] = useState(false);
  const [firebaseLoading, setFirebaseLoading] = useState(isFirebaseConfigured);

  const router = useRouter();
  const pathname = usePathname();

  // 3. Mount effect (Sets mounted to true and registers Firebase Auth listener if active)
  useEffect(() => {
    // Wrap the state update in a setTimeout to avoid synchronous setState calls within the effect body
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    if (!isFirebaseConfigured || !auth) {
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setFirebaseLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Derived loading state to prevent hydration mismatches
  const loading = !mounted || (isFirebaseConfigured && firebaseLoading);

  // 4. Redirect and route protection logic
  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  const signInWithGoogle = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          setUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          });
        }
      } else {
        // Mock Google Sign-In using constant
        localStorage.setItem('cityride_mock_user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
      }
    } catch (error) {
      console.error('Sign in with Google error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      if (isFirebaseConfigured && auth) {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        if (result.user) {
          setUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          });
        }
      } else {
        const mockUser: AuthUser = {
          uid: MOCK_EMAIL_USER_PREFIX + email.replace(/[@.]/g, '-'),
          email,
          displayName: email.split('@')[0],
          photoURL: null,
        };
        localStorage.setItem('cityride_mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Sign in with Email error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      if (isFirebaseConfigured && auth) {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        if (result.user) {
          await updateProfile(result.user, { displayName: name });
          setUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: name,
            photoURL: null,
          });
        }
      } else {
        const mockUser: AuthUser = {
          uid: MOCK_EMAIL_USER_PREFIX + email.replace(/[@.]/g, '-'),
          email,
          displayName: name,
          photoURL: null,
        };
        localStorage.setItem('cityride_mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      } else {
        localStorage.removeItem('cityride_mock_user');
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isRedirecting =
    (!user && pathname !== '/login') || (user && pathname === '/login');

  if (loading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-100">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20 mb-4 animate-bounce">
          <Car className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide">
          Verifying session...
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseMode: isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
