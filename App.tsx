import React, { useState, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useStory } from './context/StoryContext';
import { useAuthor } from './context/AuthorContext';
import { StorySetup } from './components/StorySetup';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import LandingPage from './components/LandingPage';
import PostTrialModal from './components/PostTrialModal';
import UpgradeModal from './components/UpgradeModal';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import MainLayout from './components/MainLayout';
import PublicBlogLayout from './components/PublicBlog';

const App: React.FC = () => {
  const { author, showPostTrialModal, closePostTrialModal } = useAuthor();
  const [hasVisited, setHasVisited] = useLocalStorage<boolean>('has-visited-writer-app', false);
  const [isUpgradeModalOpenForPostTrial, setIsUpgradeModalOpenForPostTrial] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const [currentView, setCurrentView] = useState<'app' | 'blog'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('blog') ? 'blog' : 'app';
  });

  const {
    activeStory,
    isCreating,
    isLoading,
    returnToBookshelf,
    createStory,
  } = useStory();
  
  const handleStart = () => {
    setCurrentView('app');
    setHasVisited(true);
  };

  const navigateToBlog = () => {
    setCurrentView('blog');
  };

  const navigateToHome = () => {
    setCurrentView('app');
  };

  const handleOpenUpgradeFromPostTrial = () => {
      closePostTrialModal();
      setIsUpgradeModalOpenForPostTrial(true);
  };
  
  const handleCloseUpgradeModal = () => {
      setIsUpgradeModalOpenForPostTrial(false);
  };

  const renderContent = () => {
    if (currentView === 'blog') {
      return <PublicBlogLayout onStart={handleStart} navigateToHome={navigateToHome} />;
    }

    if (!hasVisited) {
      return <LandingPage onStart={handleStart} navigateToBlog={navigateToBlog} />;
    }
    
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (!author) {
       if (authView === 'login') {
         return <Login onSwitchToSignUp={() => setAuthView('signup')} />;
       }
       return <SignUp onSwitchToLogin={() => setAuthView('login')} />;
    }
    
    if (isCreating) {
      return <StorySetup author={author} onStoryCreate={createStory} />;
    }

    if (activeStory) {
      return <Dashboard 
        goToBookshelf={returnToBookshelf}
      />;
    }

    return <MainLayout />;
  };
  
  let viewKey = 'landing';
  if (currentView === 'blog') viewKey = 'public-blog';
  else if (hasVisited) {
    if (isLoading) viewKey = 'loading';
    else if (!author) viewKey = authView;
    else if (isCreating) viewKey = 'creating';
    else if (activeStory) viewKey = `dashboard-${activeStory.id}`;
    else viewKey = 'main-layout';
  }

  return (
    <>
      <div key={viewKey} className="animate-fadeInUp">
        {renderContent()}
      </div>
      {showPostTrialModal && <PostTrialModal onClose={closePostTrialModal} onUpgrade={handleOpenUpgradeFromPostTrial} />}
      {isUpgradeModalOpenForPostTrial && <UpgradeModal isOpen={true} onClose={handleCloseUpgradeModal} />}
    </>
  );
};

export default App;