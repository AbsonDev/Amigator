
import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import type { Author } from './types';
import { useStory } from './context/StoryContext';
import AuthorProfile from './components/AuthorProfile';
import StorySetup from './components/StorySetup';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import Bookshelf from './components/Bookshelf';

const App: React.FC = () => {
  const [author, setAuthor] = useLocalStorage<Author | null>('author-profile', null);
  const {
    stories,
    activeStory,
    isCreating,
    isLoading,
    selectStory,
    startNewStory,
    returnToBookshelf,
    createStory,
    importStory
  } = useStory();

  const handleProfileCreate = (newAuthor: Author) => {
    setAuthor(newAuthor);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!author) {
    return <AuthorProfile onProfileCreate={handleProfileCreate} />;
  }
  
  if (isCreating) {
    return <StorySetup author={author} onStoryCreate={createStory} />;
  }

  if (activeStory) {
    return <Dashboard 
      author={author} 
      goToBookshelf={returnToBookshelf}
    />;
  }

  return <Bookshelf 
    author={author} 
    stories={stories} 
    onSelectStory={selectStory} 
    onStartNewStory={startNewStory} 
    onImportStory={importStory}
  />;
};

export default App;
