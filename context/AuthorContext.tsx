
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Author } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AuthorContextType {
  author: Author | null;
  setAuthor: React.Dispatch<React.SetStateAction<Author | null>>;
  showPostTrialModal: boolean;
  closePostTrialModal: () => void;
}

const AuthorContext = createContext<AuthorContextType | undefined>(undefined);

export const AuthorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [author, setAuthor] = useLocalStorage<Author | null>('author-profile', null);
  const [showPostTrialModal, setShowPostTrialModal] = useState(false);
  
  useEffect(() => {
    if (author) {
      let needsUpdate = false;
      const updatedAuthor = { ...author };

      // Check for trial expiration
      if (author.subscription.tier === 'Amador' && author.subscription.trialEnds) {
        const trialEndDate = new Date(author.subscription.trialEnds);
        const now = new Date();
        if (trialEndDate < now) {
          updatedAuthor.subscription = { tier: 'Free' };
          
          const hasSeenModal = localStorage.getItem('post-trial-modal-shown') === 'true';
          if (!hasSeenModal) {
            setShowPostTrialModal(true);
            localStorage.setItem('post-trial-modal-shown', 'true');
          }
          needsUpdate = true;
        }
      }

      // Check for monthlyUsage field for backward compatibility
      if (!author.monthlyUsage) {
        updatedAuthor.monthlyUsage = {};
        needsUpdate = true;
      }

      if (needsUpdate) {
        setAuthor(updatedAuthor);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on app load to check status

  const closePostTrialModal = () => {
    setShowPostTrialModal(false);
  };

  const value = { author, setAuthor, showPostTrialModal, closePostTrialModal };

  return <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>;
};

export const useAuthor = (): AuthorContextType => {
  const context = useContext(AuthorContext);
  if (context === undefined) {
    throw new Error('useAuthor must be used within an AuthorProvider');
  }
  return context;
};