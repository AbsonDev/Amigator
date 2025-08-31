import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Author } from '../types';
import { apiService } from '../services/api.service';

interface AuthorContextType {
  author: Author | null;
  isLoading: boolean;
  error: string | null;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Author>) => Promise<void>;
  showPostTrialModal: boolean;
  closePostTrialModal: () => void;
}

const AuthorContext = createContext<AuthorContextType | undefined>(undefined);

export const AuthorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [author, setAuthor] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPostTrialModal, setShowPostTrialModal] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          apiService.setToken(token);
          const profile = await apiService.getProfile();
          setAuthor(profile);
          
          // Check trial status
          if (profile.subscription?.tier === 'Amador' && profile.subscription?.trialEnds) {
            const trialEndDate = new Date(profile.subscription.trialEnds);
            const now = new Date();
            if (trialEndDate < now) {
              const hasSeenModal = localStorage.getItem(`post-trial-modal-shown-${profile.id}`) === 'true';
              if (!hasSeenModal) {
                setShowPostTrialModal(true);
                localStorage.setItem(`post-trial-modal-shown-${profile.id}`, 'true');
              }
            }
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        apiService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.signup(name, email, password);
      setAuthor(response.user);
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.login(email, password);
      setAuthor(response.user);
      
      // Check trial status after login
      if (response.user.subscription?.tier === 'Amador' && response.user.subscription?.trialEnds) {
        const trialEndDate = new Date(response.user.subscription.trialEnds);
        const now = new Date();
        if (trialEndDate < now) {
          const hasSeenModal = localStorage.getItem(`post-trial-modal-shown-${response.user.id}`) === 'true';
          if (!hasSeenModal) {
            setShowPostTrialModal(true);
            localStorage.setItem(`post-trial-modal-shown-${response.user.id}`, 'true');
          }
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
      setAuthor(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Author>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await apiService.updateProfile(updates);
      setAuthor(updatedUser);
    } catch (err: any) {
      const errorMessage = err.message || 'Update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closePostTrialModal = () => {
    setShowPostTrialModal(false);
  };
  
  const value = { 
    author, 
    isLoading, 
    error,
    signUp, 
    login, 
    logout,
    updateProfile,
    showPostTrialModal, 
    closePostTrialModal 
  };

  return <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>;
};

export const useAuthor = (): AuthorContextType => {
  const context = useContext(AuthorContext);
  if (context === undefined) {
    throw new Error('useAuthor must be used within an AuthorProvider');
  }
  return context;
};