import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './Icons';

interface ZenFocusModeProps {
  content: string;
  onChange: (content: string) => void;
  onClose: () => void;
  chapterTitle?: string;
}

const ZenFocusMode: React.FC<ZenFocusModeProps> = ({ 
  content, 
  onChange, 
  onClose,
  chapterTitle 
}) => {
  const [text, setText] = useState(content);
  const [wordCount, setWordCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'coffee' | 'library'>('none');
  const [typewriterMode, setTypewriterMode] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate word count
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [text]);

  // Typewriter scrolling effect
  const handleScroll = useCallback(() => {
    if (!typewriterMode || !textareaRef.current || !containerRef.current) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    
    // Calculate approximate line height
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const scrollPosition = (currentLine - 1) * lineHeight - (window.innerHeight / 2) + lineHeight;
    
    containerRef.current.scrollTop = Math.max(0, scrollPosition);
  }, [text, typewriterMode]);

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange(newText);
    
    // Typewriter scroll on text change
    setTimeout(handleScroll, 0);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ESC to exit
    if (e.key === 'Escape' && e.shiftKey) {
      onClose();
    }
    
    // Typewriter scroll on navigation
    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
      setTimeout(handleScroll, 0);
    }
  };

  // Ambient sounds
  const toggleAmbientSound = (sound: typeof ambientSound) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (sound === 'none' || sound === ambientSound) {
      setAmbientSound('none');
      setIsPlaying(false);
      return;
    }

    // Create audio element for ambient sound
    const audio = new Audio();
    
    // In a real app, you'd have actual audio files
    // For demo, we'll use placeholder URLs
    const soundUrls: Record<string, string> = {
      rain: '/sounds/rain.mp3',
      coffee: '/sounds/coffee-shop.mp3',
      library: '/sounds/library.mp3'
    };
    
    audio.src = soundUrls[sound] || '';
    audio.loop = true;
    audio.volume = 0.3;
    
    audio.play().catch(() => {
      console.log('Audio playback requires user interaction');
    });
    
    audioRef.current = audio;
    setAmbientSound(sound);
    setIsPlaying(true);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Minimal Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-6">
          {chapterTitle && (
            <span className="text-gray-400 text-sm">{chapterTitle}</span>
          )}
          <span className="text-gray-400 text-sm">{wordCount} palavras</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Ambient Sound Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => toggleAmbientSound('rain')}
              className={`p-2 rounded-lg transition-all ${
                ambientSound === 'rain' 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Som de chuva"
            >
              🌧️
            </button>
            <button
              onClick={() => toggleAmbientSound('coffee')}
              className={`p-2 rounded-lg transition-all ${
                ambientSound === 'coffee' 
                  ? 'bg-amber-600/20 text-amber-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Cafeteria"
            >
              ☕
            </button>
            <button
              onClick={() => toggleAmbientSound('library')}
              className={`p-2 rounded-lg transition-all ${
                ambientSound === 'library' 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Biblioteca"
            >
              📚
            </button>
          </div>
          
          {/* Typewriter Mode Toggle */}
          <button
            onClick={() => setTypewriterMode(!typewriterMode)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              typewriterMode 
                ? 'bg-green-600/20 text-green-400' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Typewriter
          </button>
          
          {/* Exit Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors"
            title="Sair (Shift+ESC)"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Writing Area */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto flex items-center justify-center px-4 py-20"
      >
        <div className="w-full max-w-4xl">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="w-full min-h-[80vh] bg-transparent text-gray-100 text-lg leading-relaxed 
                     focus:outline-none resize-none placeholder-gray-600
                     font-serif selection:bg-blue-600/30"
            placeholder="Comece a escrever... A inspiração está esperando."
            style={{
              caretColor: '#60a5fa',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
        </div>
      </div>

      {/* Focus Line (Typewriter Mode) */}
      {typewriterMode && (
        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="h-px bg-blue-500/20 mx-auto max-w-4xl"></div>
        </div>
      )}

      {/* Subtle gradient overlay for better focus */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>
    </div>
  );
};

export default ZenFocusMode;