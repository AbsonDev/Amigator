
import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import type { Story } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { generateStoryStructure, importStoryFromText } from '../services/geminiService';

interface StoryContextType {
  stories: Story[];
  activeStory: Story | null;
  activeStoryId: string | null;
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
  selectStory: (storyId: string) => void;
  updateActiveStory: (updater: (story: Story) => Story) => void;
  startNewStory: () => void;
  returnToBookshelf: () => void;
  createStory: (genre: string, theme: string, prompt: string) => Promise<void>;
  importStory: (textContent: string) => Promise<void>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useLocalStorage<Story[]>('stories-data', []);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeStory = useMemo(() => stories.find(s => s.id === activeStoryId) || null, [stories, activeStoryId]);

  const selectStory = (storyId: string) => {
    setActiveStoryId(storyId);
  };

  const updateActiveStory = useCallback((updater: (story: Story) => Story) => {
    setStories(prevStories =>
      prevStories.map(story => {
        if (story.id === activeStoryId) {
          return updater(story);
        }
        return story;
      })
    );
  }, [activeStoryId, setStories]);
  
  const startNewStory = () => {
    setIsCreating(true);
  };
  
  const returnToBookshelf = () => {
    setActiveStoryId(null);
    setIsCreating(false);
  };
  
  const createStory = useCallback(async (genre: string, theme: string, prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newStory = await generateStoryStructure(genre, theme, prompt);
      setStories(prevStories => [...prevStories, newStory]);
      setActiveStoryId(newStory.id);
      setIsCreating(false);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setStories]);

  const importStory = useCallback(async (textContent: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const newStory = await importStoryFromText(textContent);
        setStories(prevStories => [...prevStories, newStory]);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred during import.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [setStories]);
  
  const value = {
    stories,
    activeStory,
    activeStoryId,
    isCreating,
    isLoading,
    error,
    selectStory,
    updateActiveStory,
    startNewStory,
    returnToBookshelf,
    createStory,
    importStory,
  };

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
};

export const useStory = (): StoryContextType => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};
