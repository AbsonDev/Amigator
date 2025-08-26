
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StoryProvider } from './context/StoryContext';
import { AuthorProvider } from './context/AuthorContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthorProvider>
      <StoryProvider>
        <App />
      </StoryProvider>
    </AuthorProvider>
  </React.StrictMode>
);