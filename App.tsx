

import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useStory } from './context/StoryContext';
import { useAuthor } from './context/AuthorContext';
import AuthorProfile from './components/AuthorProfile';
import StorySetup from './components/StorySetup';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import Bookshelf from './components/Bookshelf';
import LandingPage from './components/LandingPage';
import PostTrialModal from './components/PostTrialModal';
import UpgradeModal from './components/UpgradeModal';

const App: React.FC = () => {
  const { author, showPostTrialModal, closePostTrialModal } = useAuthor();
  const [hasVisited, setHasVisited] = useLocalStorage<boolean>('has-visited-writer-app', false);
  const [isUpgradeModalOpenForPostTrial, setIsUpgradeModalOpenForPostTrial] = useState(false);
  
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

  const handleOpenUpgradeFromPostTrial = () => {
      closePostTrialModal();
      setIsUpgradeModalOpenForPostTrial(true);
  };
  
  const handleCloseUpgradeModal = () => {
      setIsUpgradeModalOpenForPostTrial(false);
  };

  const renderContent = () => {
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

  return (
    <>
      {renderContent()}
      {showPostTrialModal && <PostTrialModal onClose={closePostTrialModal} onUpgrade={handleOpenUpgradeFromPostTrial} />}
      {isUpgradeModalOpenForPostTrial && <UpgradeModal isOpen={true} onClose={handleCloseUpgradeModal} />}
    </>
  );
};

export default App;