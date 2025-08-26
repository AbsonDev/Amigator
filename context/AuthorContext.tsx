import React, { createContext, useContext } from 'react';
import type { Author } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AuthorContextType {
  author: Author | null;
  setAuthor: React.Dispatch<React.SetStateAction<Author | null>>;
}

const AuthorContext = createContext<AuthorContextType | undefined>(undefined);

export const AuthorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [author, setAuthor] = useLocalStorage<Author | null>('author-profile', null);

  const value = { author, setAuthor };

  return <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>;
};

export const useAuthor = (): AuthorContextType => {
  const context = useContext(AuthorContext);
  if (context === undefined) {
    throw new Error('useAuthor must be used within an AuthorProvider');
  }
  return context;
};
