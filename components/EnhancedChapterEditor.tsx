import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStory } from '../context/StoryContext';
import type { Chapter } from '../types';
import ZenFocusMode from './ZenFocusMode';
import WritingSprint from './WritingSprint';
import VoiceCommands from './VoiceCommands';
import AIContextualSuggestions from './AIContextualSuggestions';
import InspirationBank from './InspirationBank';
import { 
  EyeIcon, 
  MoonIcon, 
  SunIcon, 
  CommandLineIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  KeyIcon
} from './Icons';

interface EnhancedChapterEditorProps {
  chapter: Chapter;
  onBack: () => void;
}

const EnhancedChapterEditor: React.FC<EnhancedChapterEditorProps> = ({ chapter, onBack }) => {
  const { updateActiveStory } = useStory();
  const [content, setContent] = useState(chapter.content);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSprintMode, setIsSprintMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFlowView, setShowFlowView] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto Dark Mode based on time
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsDarkMode(hour >= 19 || hour < 6);
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  // Save content
  const saveContent = useCallback(() => {
    updateActiveStory(story => ({
      ...story,
      chapters: story.chapters.map(ch => 
        ch.id === chapter.id ? { ...ch, content } : ch
      )
    }));
  }, [content, chapter.id, updateActiveStory]);

  // Handle voice command
  const handleVoiceCommand = (command: string, params?: any) => {
    switch(command) {
      case 'newParagraph':
        setContent(prev => prev + '\n\n');
        break;
      case 'newLine':
        setContent(prev => prev + '\n');
        break;
      case 'save':
        saveContent();
        break;
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
    }
  };

  // Handle voice text insert
  const handleVoiceInsert = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      // Move cursor after inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + text.length;
          textareaRef.current.selectionEnd = start + text.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  // Handle AI suggestion
  const handleSuggestionAccept = (suggestion: string) => {
    handleVoiceInsert(' ' + suggestion);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's':
            e.preventDefault();
            saveContent();
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              document.execCommand('redo');
            }
            break;
          case 'f':
            e.preventDefault();
            setShowSearch(!showSearch);
            break;
          case 'Enter':
            e.preventDefault();
            setIsZenMode(true);
            break;
        }
      }
      
      // Alt combinations
      if (e.altKey) {
        switch(e.key) {
          case 's':
            e.preventDefault();
            setIsSprintMode(true);
            break;
          case 'k':
            e.preventDefault();
            setShowShortcuts(!showShortcuts);
            break;
          case 'r':
            e.preventDefault();
            setShowRevision(!showRevision);
            break;
          case 'f':
            e.preventDefault();
            setShowFlowView(!showFlowView);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, showShortcuts, showRevision, showFlowView]);

  // Track cursor position
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  // Wikipedia search
  const searchWikipedia = async () => {
    if (!searchQuery) return;
    const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.extract) {
        handleVoiceInsert(`\n\n[Referência: ${data.extract.substring(0, 200)}...]\n\n`);
      }
    } catch (error) {
      console.error('Wikipedia search error:', error);
    }
  };

  // Flow visualization data
  const getFlowData = () => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((p, i) => ({
      id: i,
      text: p.substring(0, 50) + '...',
      wordCount: p.split(/\s+/).length,
      type: p.includes('"') ? 'dialogue' : 'narrative'
    }));
  };

  // Revision comparison
  const getRevisionDiff = () => {
    // Simplified diff - in real app would use a proper diff library
    const original = chapter.content;
    const current = content;
    
    const originalLines = original.split('\n');
    const currentLines = current.split('\n');
    
    return { originalLines, currentLines };
  };

  if (isZenMode) {
    return (
      <ZenFocusMode
        content={content}
        onChange={setContent}
        onClose={() => {
          setIsZenMode(false);
          saveContent();
        }}
        chapterTitle={chapter.title}
      />
    );
  }

  if (isSprintMode) {
    return (
      <WritingSprint
        initialText={content}
        onTextChange={setContent}
        onComplete={(stats) => {
          setIsSprintMode(false);
          saveContent();
          alert(`Sprint concluído! ${stats.wordsWritten} palavras em ${Math.round(stats.timeElapsed / 60)} minutos!`);
        }}
      />
    );
  }

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Enhanced Toolbar */}
      <div className="bg-brand-surface/50 backdrop-blur-sm border-b border-brand-secondary/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-brand-text-secondary hover:text-brand-text-primary">
              ← Voltar
            </button>
            <h2 className="text-xl font-bold">{chapter.title}</h2>
            <span className="text-sm text-brand-text-secondary">
              {content.split(/\s+/).filter(Boolean).length} palavras
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice Commands */}
            <VoiceCommands 
              onTextInsert={handleVoiceInsert}
              onCommand={handleVoiceCommand}
            />
            
            {/* Mode Toggles */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-2 bg-brand-secondary/30 rounded hover:bg-brand-secondary/50"
              title="Modo Zen (Ctrl+Enter)"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsSprintMode(true)}
              className="p-2 bg-brand-secondary/30 rounded hover:bg-brand-secondary/50"
              title="Sprint de Escrita (Alt+S)"
            >
              ⏱️
            </button>
            
            <button
              onClick={() => setShowFlowView(!showFlowView)}
              className="p-2 bg-brand-secondary/30 rounded hover:bg-brand-secondary/50"
              title="Visualização de Fluxo (Alt+F)"
            >
              <ChartBarIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowRevision(!showRevision)}
              className="p-2 bg-brand-secondary/30 rounded hover:bg-brand-secondary/50"
              title="Modo Revisão (Alt+R)"
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 bg-brand-secondary/30 rounded hover:bg-brand-secondary/50"
              title="Pesquisar (Ctrl+F)"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="p-2 bg-brand-secondary/30 rounded hover:bg-brand-secondary/50"
              title="Atalhos (Alt+K)"
            >
              <KeyIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-brand-secondary/30 rounded hover:bg-brand-secondary/50"
              title="Alternar Tema"
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={saveContent}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Salvar
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar na Wikipedia..."
              className="flex-1 px-3 py-2 bg-brand-secondary/30 rounded"
            />
            <button
              onClick={searchWikipedia}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Pesquisar
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Flow View Sidebar */}
        {showFlowView && (
          <div className="w-64 bg-brand-surface/50 border-r border-brand-secondary/30 p-4 overflow-y-auto">
            <h3 className="font-bold mb-4">Fluxo Narrativo</h3>
            <div className="space-y-2">
              {getFlowData().map(item => (
                <div 
                  key={item.id}
                  className={`p-2 rounded text-xs ${
                    item.type === 'dialogue' 
                      ? 'bg-blue-600/20 border-l-4 border-blue-600' 
                      : 'bg-brand-secondary/20'
                  }`}
                >
                  <div className="font-medium">{item.text}</div>
                  <div className="text-brand-text-secondary">{item.wordCount} palavras</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 p-6 relative">
          {!showRevision ? (
            <>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextChange}
                onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                className="w-full h-full p-4 bg-brand-surface/50 rounded-xl border border-brand-secondary/30 
                         text-brand-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#fafafa',
                  color: isDarkMode ? '#e0e0e0' : '#2a2a2a'
                }}
              />
              
              {/* AI Suggestions */}
              <AIContextualSuggestions
                currentText={content}
                cursorPosition={cursorPosition}
                onSuggestionAccept={handleSuggestionAccept}
              />
            </>
          ) : (
            // Revision Mode - Side by Side
            <div className="flex gap-4 h-full">
              <div className="flex-1">
                <h3 className="font-bold mb-2">Original</h3>
                <div className="h-full p-4 bg-brand-surface/50 rounded-xl border border-brand-secondary/30 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{chapter.content}</pre>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2">Atual</h3>
                <div className="h-full p-4 bg-brand-surface/50 rounded-xl border border-green-600/30 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{content}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shortcuts Panel */}
        {showShortcuts && (
          <div className="w-64 bg-brand-surface/50 border-l border-brand-secondary/30 p-4">
            <h3 className="font-bold mb-4">Atalhos de Teclado</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Salvar</span>
                <kbd className="px-2 py-1 bg-brand-secondary/30 rounded text-xs">Ctrl+S</kbd>
              </div>
              <div className="flex justify-between">
                <span>Modo Zen</span>
                <kbd className="px-2 py-1 bg-brand-secondary/30 rounded text-xs">Ctrl+Enter</kbd>
              </div>
              <div className="flex justify-between">
                <span>Sprint</span>
                <kbd className="px-2 py-1 bg-brand-secondary/30 rounded text-xs">Alt+S</kbd>
              </div>
              <div className="flex justify-between">
                <span>Pesquisar</span>
                <kbd className="px-2 py-1 bg-brand-secondary/30 rounded text-xs">Ctrl+F</kbd>
              </div>
              <div className="flex justify-between">
                <span>Fluxo</span>
                <kbd className="px-2 py-1 bg-brand-secondary/30 rounded text-xs">Alt+F</kbd>
              </div>
              <div className="flex justify-between">
                <span>Revisão</span>
                <kbd className="px-2 py-1 bg-brand-secondary/30 rounded text-xs">Alt+R</kbd>
              </div>
              <div className="flex justify-between">
                <span>Desfazer</span>
                <kbd className="px-2 py-1 bg-brand-secondary/30 rounded text-xs">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span>Refazer</span>
                <kbd className="px-2 py-1 bg-brand-secondary/30 rounded text-xs">Ctrl+Shift+Z</kbd>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inspiration Bank */}
      <InspirationBank />

      {/* Custom Styles for Dark/Light Mode */}
      <style jsx>{`
        .dark-theme {
          --bg-primary: #0a0a0a;
          --bg-secondary: #1a1a1a;
          --text-primary: #e0e0e0;
          --text-secondary: #a0a0a0;
        }
        
        .light-theme {
          --bg-primary: #ffffff;
          --bg-secondary: #f5f5f5;
          --text-primary: #2a2a2a;
          --text-secondary: #6a6a6a;
        }
      `}</style>
    </div>
  );
};

export default EnhancedChapterEditor;