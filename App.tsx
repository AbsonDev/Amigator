

import React from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useStory } from './context/StoryContext';
import { useAuthor } from './context/AuthorContext';
import AuthorProfile from './components/AuthorProfile';
import StorySetup from './components/StorySetup';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import Bookshelf from './components/Bookshelf';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const { author } = useAuthor();
  const [hasVisited, setHasVisited] = useLocalStorage<boolean>('has-visited-writer-app', false);
  
  const {
    stories,
    activeStory,
    isCreating,
    isLoading,
    selectStory,
    startNewStory,
    returnToBookshelf,
    createStory,
    importStory,
    deleteStory
  } = useStory();
  
  const handleStart = () => {
    setHasVisited(true);
  };

  if (!hasVisited) {
    return <LandingPage onStart={handleStart} />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!author) {
    return <AuthorProfile />;
  }
  
  if (isCreating) {
    return <StorySetup author={author} onStoryCreate={createStory} />;
  }

  if (activeStory) {
    return <Dashboard 
      goToBookshelf={returnToBookshelf}
    />;
  }

  return <Bookshelf 
    stories={stories} 
    onSelectStory={selectStory} 
    onStartNewStory={startNewStory} 
    onImportStory={importStory}
    onDeleteStory={deleteStory}
  />;
};

export default App;