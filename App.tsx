
import React, { useState, useCallback, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import type { Author, Story } from './types';
import AuthorProfile from './components/AuthorProfile';
import StorySetup from './components/StorySetup';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { generateStoryStructure, importStoryFromText } from './services/geminiService';
import Bookshelf from './components/Bookshelf';

const App: React.FC = () => {
  const [author, setAuthor] = useLocalStorage<Author | null>('author-profile', null);
  const [stories, setStories] = useLocalStorage<Story[]>('stories-data', []);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProfileCreate = (newAuthor: Author) => {
    setAuthor(newAuthor);
  };
  
  const handleStoryCreate = useCallback(async (genre: string, theme: string, prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newStory = await generateStoryStructure(genre, theme, prompt);
      setStories(prevStories => [...prevStories, newStory]);
      setActiveStoryId(newStory.id);
      setIsCreating(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        alert(err.message);
      } else {
        setError("An unknown error occurred.");
        alert("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [setStories]);
  
  const handleImportStory = useCallback(async (textContent: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const newStory = await importStoryFromText(textContent);
        setStories(prevStories => [...prevStories, newStory]);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
            alert(err.message);
        } else {
            setError("An unknown error occurred during import.");
            alert("An unknown error occurred during import.");
        }
    } finally {
        setIsLoading(false);
    }
  }, [setStories]);

  const handleSelectStory = (storyId: string) => {
    setActiveStoryId(storyId);
  };

  const handleStartNewStory = () => {
    setIsCreating(true);
  };
  
  const handleReturnToBookshelf = () => {
    setActiveStoryId(null);
    setIsCreating(false);
  };

  const handleUpdateActiveStory = (updatedStory: Story) => {
     setStories(prevStories => 
        prevStories.map(story => story.id === updatedStory.id ? updatedStory : story)
     );
  };

  const activeStory = useMemo(() => stories.find(s => s.id === activeStoryId) || null, [stories, activeStoryId]);


  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!author) {
    return <AuthorProfile onProfileCreate={handleProfileCreate} />;
  }
  
  if (isCreating) {
    return <StorySetup author={author} onStoryCreate={handleStoryCreate} />;
  }

  if (activeStory) {
    return <Dashboard 
      author={author} 
      story={activeStory} 
      setStory={handleUpdateActiveStory} 
      goToBookshelf={handleReturnToBookshelf}
    />;
  }

  return <Bookshelf 
    author={author} 
    stories={stories} 
    onSelectStory={handleSelectStory} 
    onStartNewStory={handleStartNewStory} 
    onImportStory={handleImportStory}
  />;
};

export default App;