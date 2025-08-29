import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { Story } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { generateStoryStructure, importStoryFromText } from '../services/geminiService';
import { useAuthor } from './AuthorContext';

interface StoryContextType {
  stories: Story[];
  activeStory: Story | null;
  activeStoryId: string | null;
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
  selectStory: (storyId: string) => void;
  updateActiveStory: (updater: (story: Story) => Story) => void;
  updateStory: (storyId: string, updater: (story: Story) => Story) => void;
  startNewStory: () => void;
  returnToBookshelf: () => void;
  createStory: (genre: string, theme: string, prompt: string) => Promise<void>;
  importStory: (textContent: string) => Promise<void>;
  deleteStory: (storyId: string) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

const initialAnalysisState = {
    scriptIssues: { results: [], ignored: [], lastAnalyzed: null },
    repetitions: { results: [], ignored: [], lastAnalyzed: null },
    pacing: { results: [], lastAnalyzed: null },
    characterVoices: {},
};


export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useLocalStorage<Story[]>('stories-data', []);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { author } = useAuthor();

  // Effect to migrate old story data structures on load
  useEffect(() => {
    if (stories.length > 0 && author) {
        const needsMigration = stories.some(story => 
            !story.world || 
            !story.analysis || 
            !story.actionLog || 
            !story.plot ||
            !story.analysis.pacing ||
            !story.analysis.characterVoices ||
            !story.authorId ||
            story.isPublished === undefined
        );
        if (needsMigration) {
            setStories(currentStories => 
                currentStories.map(story => {
                    const migratedAnalysis = {
                        ...initialAnalysisState,
                        ...(story.analysis || {}),
                    };
                    migratedAnalysis.scriptIssues = { ...initialAnalysisState.scriptIssues, ...(story.analysis?.scriptIssues || {})};
                    migratedAnalysis.repetitions = { ...initialAnalysisState.repetitions, ...(story.analysis?.repetitions || {})};
                    migratedAnalysis.pacing = { ...initialAnalysisState.pacing, ...(story.analysis?.pacing || {})};
                    migratedAnalysis.characterVoices = story.analysis?.characterVoices || {};

                    return {
                        ...story,
                        authorId: story.authorId || author.id,
                        isPublished: story.isPublished || false,
                        world: story.world || [],
                        analysis: migratedAnalysis,
                        actionLog: story.actionLog || [],
                        chatHistory: story.chatHistory || [],
                        versions: story.versions || [],
                        plot: story.plot || { cards: [], connections: [] },
                    };
                })
            );
        }
    }
  }, [author, setStories]);


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
  
  const updateStory = useCallback((storyId: string, updater: (story: Story) => Story) => {
    setStories(prevStories =>
      prevStories.map(story => {
        if (story.id === storyId) {
          return updater(story);
        }
        return story;
      })
    );
  }, [setStories]);
  
  const startNewStory = () => {
    setIsCreating(true);
  };
  
  const returnToBookshelf = () => {
    setActiveStoryId(null);
    setIsCreating(false);
  };
  
  const createStory = useCallback(async (genre: string, theme: string, prompt: string) => {
    if (!author) {
        alert("Você precisa estar logado para criar uma história.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // FIX: Pass author.id to generateStoryStructure and remove redundant property assignments.
      const newStory = await generateStoryStructure(genre, theme, prompt, author.id);
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
  }, [setStories, author]);

  const importStory = useCallback(async (textContent: string) => {
    if (!author) {
        alert("Você precisa estar logado para importar uma história.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        // FIX: Pass author.id to importStoryFromText and remove redundant property assignments.
        const newStory = await importStoryFromText(textContent, author.id);
        setStories(prevStories => [...prevStories, newStory]);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred during import.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [setStories, author]);
  
  const deleteStory = useCallback((storyId: string) => {
    setStories(prevStories => prevStories.filter(story => story.id !== storyId));
    if (activeStoryId === storyId) {
      setActiveStoryId(null);
    }
  }, [activeStoryId, setStories]);

  const value = {
    stories,
    activeStory,
    activeStoryId,
    isCreating,
    isLoading,
    error,
    selectStory,
    updateActiveStory,
    updateStory,
    startNewStory,
    returnToBookshelf,
    createStory,
    importStory,
    deleteStory,
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
