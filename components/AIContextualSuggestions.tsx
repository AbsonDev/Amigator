import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SparklesIcon, LightBulbIcon } from './Icons';
import { geminiService } from '../services/geminiService';
import { useStory } from '../context/StoryContext';

interface AIContextualSuggestionsProps {
  currentText: string;
  cursorPosition: number;
  onSuggestionAccept: (suggestion: string) => void;
}

const AIContextualSuggestions: React.FC<AIContextualSuggestionsProps> = ({
  currentText,
  cursorPosition,
  onSuggestionAccept
}) => {
  const { activeStory } = useStory();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Get context around cursor
  const getContext = useCallback(() => {
    const beforeCursor = currentText.substring(Math.max(0, cursorPosition - 500), cursorPosition);
    const afterCursor = currentText.substring(cursorPosition, Math.min(currentText.length, cursorPosition + 200));
    return { before: beforeCursor, after: afterCursor };
  }, [currentText, cursorPosition]);

  // Generate suggestions
  const generateSuggestions = useCallback(async () => {
    if (currentText.length < 50) return; // Don't suggest for very short texts

    setIsLoading(true);
    const { before, after } = getContext();
    
    try {
      // Get last sentence for context
      const sentences = before.split(/[.!?]/).filter(Boolean);
      const lastSentence = sentences[sentences.length - 1]?.trim() || '';
      
      if (lastSentence.length < 10) {
        setIsLoading(false);
        return;
      }

      // Generate multiple suggestions
      const prompt = `
        Contexto da história: ${activeStory?.title || 'Uma história'}
        Gênero: ${activeStory?.genre || 'Ficção'}
        
        Texto anterior: "${before.slice(-200)}"
        Texto posterior: "${after.slice(0, 100)}"
        
        Baseado no contexto, sugira 3 continuações diferentes para completar a próxima frase ou parágrafo.
        Cada sugestão deve:
        1. Manter o tom e estilo do texto
        2. Ser criativa mas coerente
        3. Ter entre 10 a 30 palavras
        
        Retorne APENAS as 3 sugestões, uma por linha, sem numeração ou formatação adicional.
      `;

      const response = await geminiService.generateText(prompt);
      const suggestionList = response.split('\n').filter(s => s.trim().length > 0).slice(0, 3);
      
      setSuggestions(suggestionList);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentText, getContext, activeStory]);

  // Debounced suggestion generation
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      generateSuggestions();
    }, 2000); // Wait 2 seconds after user stops typing

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [currentText, cursorPosition]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch(e.key) {
      case 'Tab':
        e.preventDefault();
        onSuggestionAccept(suggestions[selectedIndex]);
        setShowSuggestions(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedIndex]);

  return (
    <>
      {/* Inline suggestion indicator */}
      {isLoading && (
        <div className="inline-flex items-center gap-1 ml-2 text-blue-400 text-sm animate-pulse">
          <SparklesIcon className="w-4 h-4" />
          <span>Pensando...</span>
        </div>
      )}

      {/* Suggestion box */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 p-2 bg-brand-surface/95 backdrop-blur-sm rounded-lg border border-brand-secondary/50 shadow-xl max-w-md">
          <div className="flex items-center gap-2 mb-2 text-xs text-brand-text-secondary">
            <LightBulbIcon className="w-4 h-4 text-yellow-400" />
            <span>Sugestões de IA (Tab para aceitar)</span>
          </div>
          
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-2 rounded cursor-pointer transition-all text-sm ${
                  index === selectedIndex
                    ? 'bg-blue-600/20 border border-blue-600/50'
                    : 'bg-brand-secondary/20 hover:bg-brand-secondary/30'
                }`}
                onClick={() => {
                  onSuggestionAccept(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <span className="text-brand-text-primary">{suggestion}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-2 pt-2 border-t border-brand-secondary/30 text-xs text-brand-text-secondary">
            ↑↓ Navegar • Tab Aceitar • Esc Fechar
          </div>
        </div>
      )}

      {/* Floating action button for manual trigger */}
      <button
        onClick={generateSuggestions}
        className="fixed bottom-20 right-6 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
        title="Gerar sugestões de IA"
      >
        <SparklesIcon className="w-6 h-6" />
      </button>
    </>
  );
};

export default AIContextualSuggestions;