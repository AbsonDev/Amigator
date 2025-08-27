import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Author } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AuthorContextType {
  author: Author | null;
  setAuthor: React.Dispatch<React.SetStateAction<Author | null>>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  showPostTrialModal: boolean;
  closePostTrialModal: () => void;
}

const AuthorContext = createContext<AuthorContextType | undefined>(undefined);

export const AuthorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<Author[]>('ia-writer-users', []);
  const [author, setAuthor] = useLocalStorage<Author | null>('ia-writer-current-user', null);
  const [showPostTrialModal, setShowPostTrialModal] = useState(false);
  
  useEffect(() => {
    if (author) {
      let needsUpdate = false;
      const updatedAuthor = { ...author };

      if (author.subscription.tier === 'Amador' && author.subscription.trialEnds) {
        const trialEndDate = new Date(author.subscription.trialEnds);
        const now = new Date();
        if (trialEndDate < now) {
          updatedAuthor.subscription = { tier: 'Free' };
          const hasSeenModal = localStorage.getItem(`post-trial-modal-shown-${author.id}`) === 'true';
          if (!hasSeenModal) {
            setShowPostTrialModal(true);
            localStorage.setItem(`post-trial-modal-shown-${author.id}`, 'true');
          }
          needsUpdate = true;
        }
      }

      if (!author.monthlyUsage) {
        updatedAuthor.monthlyUsage = {};
        needsUpdate = true;
      }

      if (needsUpdate) {
        setAuthor(updatedAuthor);
        // Also update the user in the main list
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedAuthor.id ? updatedAuthor : u));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error("Um usuário com este e-mail já existe.");
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const newUser: Author = {
      id: `author-${Date.now()}`,
      name,
      email,
      password, // Note: In a real app, hash this password!
      subscription: {
        tier: 'Amador',
        trialEnds: trialEndDate.toISOString(),
      },
      monthlyUsage: {},
    };

    setUsers(prev => [...prev, newUser]);
    setAuthor(newUser);
  }, [users, setUsers, setAuthor]);

  const login = useCallback(async (email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      throw new Error("E-mail ou senha inválidos.");
    }
    setAuthor(user);
  }, [users, setAuthor]);

  const logout = useCallback(() => {
    setAuthor(null);
  }, [setAuthor]);


  const closePostTrialModal = () => {
    setShowPostTrialModal(false);
  };
  
  const value = { author, setAuthor, signUp, login, logout, showPostTrialModal, closePostTrialModal };

  return <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>;
};

export const useAuthor = (): AuthorContextType => {
  const context = useContext(AuthorContext);
  if (context === undefined) {
    throw new Error('useAuthor must be used within an AuthorProvider');
  }
  return context;
};