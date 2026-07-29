'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  guestUsageCount: number;
  maxFreeGuestGenerations: number;
  isAuthModalOpen: boolean;
  canGenerate: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  recordGeneration: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const MAX_FREE_GUEST_GENERATIONS = 1;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [guestUsageCount, setGuestUsageCount] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Load stored guest generations count
    if (typeof window !== 'undefined') {
      const storedCount = localStorage.getItem('promptlens_guest_generations');
      if (storedCount !== null) {
        setGuestUsageCount(parseInt(storedCount, 10) || 0);
      }
    }

    // Subscribe to Firebase auth state updates
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const canGenerate = !!user || guestUsageCount < MAX_FREE_GUEST_GENERATIONS;

  const recordGeneration = () => {
    if (!user) {
      const newCount = guestUsageCount + 1;
      setGuestUsageCount(newCount);
      if (typeof window !== 'undefined') {
        localStorage.setItem('promptlens_guest_generations', newCount.toString());
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      // Ignore user-closed popup error
      if (err.code !== 'auth/popup-closed-by-user') {
        alert('Google Sign-In failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        guestUsageCount,
        maxFreeGuestGenerations: MAX_FREE_GUEST_GENERATIONS,
        isAuthModalOpen,
        canGenerate,
        loginWithGoogle,
        logout,
        recordGeneration,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
