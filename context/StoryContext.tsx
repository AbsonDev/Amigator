import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { Story } from '../types';
import { apiService } from '../services/api.service';
import { useAuthor } from './AuthorContext';

interface StoryContextType {
  stories: Story[];
  activeStory: Story | null;
  activeStoryId: string | null;
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
  selectStory: (storyId: string) => void;
  updateActiveStory: (updater: (story: Story) => Story) => Promise<void>;
  updateStory: (storyId: string, updater: (story: Story) => Story) => Promise<void>;
  startNewStory: () => void;
  returnToBookshelf: () => void;
  createStory: (genre: string, theme: string, prompt: string) => Promise<void>;
  importStory: (textContent: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  refreshStories: () => Promise<void>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

const initialAnalysisState = {
    scriptIssues: { results: [], ignored: [], lastAnalyzed: null },
    repetitions: { results: [], ignored: [], lastAnalyzed: null },
    pacing: { results: [], lastAnalyzed: null },
    characterVoices: {},
};

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { author } = useAuthor();

  // Load stories when author is available
  useEffect(() => {
    if (author) {
      refreshStories();
    } else {
      setStories([]);
      setActiveStoryId(null);
    }
  }, [author]);

  const refreshStories = useCallback(async () => {
    if (!author) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const fetchedStories = await apiService.getStories();
      
      // Ensure all stories have required fields
      const normalizedStories = fetchedStories.map((story: any) => ({
        ...story,
        world: story.world || [],
        analysis: story.analysis || initialAnalysisState,
        actionLog: story.actionLog || [],
        chatHistory: story.chatHistory || [],
        versions: story.versions || [],
        plot: story.plot || { cards: [], connections: [] },
        autosaveEnabled: story.autosaveEnabled !== false
      }));
      
      setStories(normalizedStories);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "Failed to load stories";
      setError(errorMessage);
      console.error('Failed to load stories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [author]);

  const activeStory = useMemo(() => stories.find(s => s.id === activeStoryId) || null, [stories, activeStoryId]);

  const selectStory = (storyId: string) => {
    setActiveStoryId(storyId);
  };

  const updateActiveStory = useCallback(async (updater: (story: Story) => Story) => {
    if (!activeStoryId) return;
    
    const story = stories.find(s => s.id === activeStoryId);
    if (!story) return;
    
    const updatedStory = updater(story);
    
    try {
      // Update on backend
      await apiService.updateStory(activeStoryId, updatedStory);
      
      // Update local state
      setStories(prevStories =>
        prevStories.map(s => s.id === activeStoryId ? updatedStory : s)
      );
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "Failed to update story";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [activeStoryId, stories]);
  
  const updateStory = useCallback(async (storyId: string, updater: (story: Story) => Story) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    const updatedStory = updater(story);
    
    try {
      // Update on backend
      await apiService.updateStory(storyId, updatedStory);
      
      // Update local state
      setStories(prevStories =>
        prevStories.map(s => s.id === storyId ? updatedStory : s)
      );
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "Failed to update story";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [stories]);
  
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
      // Generate story structure via backend
      const newStory = await apiService.generateStory(genre, theme, prompt);
      
      // Ensure story has all required fields
      const normalizedStory = {
        ...newStory,
        world: newStory.world || [],
        analysis: newStory.analysis || initialAnalysisState,
        actionLog: newStory.actionLog || [],
        chatHistory: newStory.chatHistory || [],
        versions: newStory.versions || [],
        plot: newStory.plot || { cards: [], connections: [] },
        autosaveEnabled: true
      };
      
      setStories(prevStories => [...prevStories, normalizedStory]);
      setActiveStoryId(normalizedStory.id);
      setIsCreating(false);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "Failed to create story";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [author]);

  const importStory = useCallback(async (textContent: string) => {
    if (!author) {
        alert("Você precisa estar logado para importar uma história.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
        // For now, create a basic story structure from text
        // In production, this would parse the text more intelligently
        const storyData = {
          title: "História Importada",
          genre: "Ficção",
          synopsis: textContent.substring(0, 500),
          chapters: [{
            id: `chapter_${Date.now()}`,
            title: "Capítulo 1",
            summary: "Capítulo importado",
            content: textContent,
            order: 1
          }]
        };
        
        const newStory = await apiService.createStory(storyData);
        
        // Ensure story has all required fields
        const normalizedStory = {
          ...newStory,
          world: [],
          analysis: initialAnalysisState,
          actionLog: [],
          chatHistory: [],
          versions: [],
          plot: { cards: [], connections: [] },
          autosaveEnabled: true
        };
        
        setStories(prevStories => [...prevStories, normalizedStory]);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "Failed to import story";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [author]);
  
  const deleteStory = useCallback(async (storyId: string) => {
    try {
      await apiService.deleteStory(storyId);
      setStories(prevStories => prevStories.filter(story => story.id !== storyId));
      if (activeStoryId === storyId) {
        setActiveStoryId(null);
      }
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "Failed to delete story";
      setError(errorMessage);
      alert(errorMessage);
    }
  }, [activeStoryId]);

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
    refreshStories
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