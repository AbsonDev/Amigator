
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Chapter, BetaReaderFeedback, GrammarSuggestion, Story, Version, StoryContent } from '../types';
import { SparklesIcon, ClipboardIcon, TextSelectIcon, GrammarIcon } from './Icons';
import { useStory } from '../context/StoryContext';
import { continueWriting } from '../services/geminiService';
import FeedbackModal from './editor/FeedbackModal';
import ModifyTextModal from './editor/ModifyTextModal';
import GrammarModal from './editor/GrammarModal';


interface ChapterEditorProps {
  chapter: Chapter;
  onBack: () => void;
}

const LoadingButtonSpinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>;

const ChapterEditor: React.FC<ChapterEditorProps> = ({ chapter, onBack }) => {
  const { activeStory, updateActiveStory } = useStory();
  const [content, setContent] = useState(chapter.content);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<[number, number]>([0, 0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimeoutRef = useRef<number | null>(null);

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<'characters' | 'world'>('characters');

  // Loading states
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  
  // Modal states
  const [activeModal, setActiveModal] = useState<'feedback' | 'modify' | 'grammar' | null>(null);

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeStory?.autosaveEnabled) return;
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = window.setTimeout(() => {
      const currentChapterState = { ...chapter, content };
      updateActiveStory(prevStory => {
          const storyWithCurrentChapter = {
              ...prevStory,
              chapters: prevStory.chapters.map(c => c.id === currentChapterState.id ? currentChapterState : c)
          };
          const storyStateSnapshot: StoryContent = {
            title: storyWithCurrentChapter.title,
            genre: storyWithCurrentChapter.genre,
            synopsis: storyWithCurrentChapter.synopsis,
            chapters: storyWithCurrentChapter.chapters,
            world: storyWithCurrentChapter.world,
            characters: storyWithCurrentChapter.characters.map(char => ({...char, avatarUrl: ''}))
          };
          const newVersion: Version = {
              id: `ver-${Date.now()}`,
              name: `Autosave - ${new Date().toLocaleString()}`,
              createdAt: new Date().toISOString(),
              storyState: storyStateSnapshot
          };
          const allVersions = [...prevStory.versions, newVersion];
          const manualVersions = allVersions.filter(v => !v.name.startsWith('Autosave'));
          const autoVersions = allVersions.filter(v => v.name.startsWith('Autosave')).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const limitedAutoVersions = autoVersions.slice(0, 20);

          return {
              ...storyWithCurrentChapter,
              versions: [...manualVersions, ...limitedAutoVersions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
              actionLog: [...prevStory.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'agent', action: `Versão salva automaticamente.`}]
          };
      });
    }, 5000);

  }, [content, activeStory?.autosaveEnabled, chapter, updateActiveStory]);


  const handleSave = () => {
    const updatedChapter = { ...chapter, content };
    updateActiveStory(prevStory => {
        return {
            ...prevStory,
            chapters: prevStory.chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c),
            actionLog: [...prevStory.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: `Salvou o capítulo '${updatedChapter.title}'.`}]
        };
    });
    alert('Capítulo salvo com sucesso!');
  };

  const wordCount = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);

  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const { selectionStart, selectionEnd } = textarea;
      if (selectionStart !== selectionEnd) {
        setSelectedText(textarea.value.substring(selectionStart, selectionEnd));
        setSelectionRange([selectionStart, selectionEnd]);
      } else {
        setSelectedText('');
      }
    }
  };

  const handleContinueWriting = async () => {
    setIsLoadingContinue(true);
    try {
      const continuation = await continueWriting(content);
      setContent(prev => prev.trim() + '\n\n' + continuation.trim());
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoadingContinue(false);
    }
  };

  return (
    <>
      <div className="relative p-4 sm:p-6 md:p-8 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                  <h1 className="text-3xl font-bold font-serif text-brand-text-primary">{chapter.title}</h1>
                  <p className="text-brand-text-secondary">{chapter.summary}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                   <button onClick={onBack} className="bg-brand-secondary text-brand-text-primary font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors">Voltar</button>
                  <button onClick={handleSave} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">Salvar Capítulo</button>
              </div>
          </div>

          <div className="bg-brand-surface border border-brand-secondary rounded-t-lg p-2 flex items-center gap-2 flex-wrap">
              <button onClick={handleContinueWriting} disabled={isLoadingContinue} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoadingContinue ? <LoadingButtonSpinner /> : <SparklesIcon className="w-4 h-4" />} Continuar Escrita
              </button>
              <button onClick={() => setActiveModal('feedback')} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ClipboardIcon className="w-4 h-4" /> Análise Crítica
              </button>
              <button onClick={() => setActiveModal('modify')} disabled={!selectedText} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <TextSelectIcon className="w-4 h-4" /> Modificar Seleção
              </button>
              <button onClick={() => setActiveModal('grammar')} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <GrammarIcon className="w-4 h-4" /> Verificar Gramática
              </button>
              <div className="flex-grow"></div>
               <button onClick={() => setIsPanelOpen(p => !p)} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors">
                  {isPanelOpen ? 'Fechar Painel' : 'Painel de Contexto'}
              </button>
          </div>

          <div className="flex-grow flex flex-row overflow-hidden">
              <div className="flex-grow flex flex-col h-full">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onSelect={handleSelectionChange}
                    className="w-full h-full flex-grow bg-brand-surface border-x border-b border-brand-secondary rounded-bl-lg p-4 font-serif text-lg leading-relaxed text-brand-text-primary resize-none focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="Comece a escrever..."
                />
                <div className="text-right text-sm text-brand-text-secondary mt-2 pr-2">
                    Contagem de palavras: {wordCount}
                </div>
              </div>

              {/* Context Panel */}
              <div className={`transition-all duration-300 ease-in-out flex-shrink-0 bg-brand-surface border-b border-r border-brand-secondary rounded-br-lg ${isPanelOpen ? 'w-80 p-4' : 'w-0 p-0'} overflow-hidden`}>
                  <div className="flex border-b border-brand-secondary mb-2">
                    <button onClick={() => setPanelTab('characters')} className={`px-3 py-1 text-sm font-semibold ${panelTab === 'characters' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary'}`}>Personagens</button>
                    <button onClick={() => setPanelTab('world')} className={`px-3 py-1 text-sm font-semibold ${panelTab === 'world' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary'}`}>Mundo</button>
                  </div>
                  <div className="overflow-y-auto h-full">
                    {panelTab === 'characters' && activeStory?.characters.map(c => (
                        <div key={c.id} className="mb-3">
                            <p className="font-bold text-sm text-brand-text-primary">{c.name}</p>
                            <p className="text-xs text-brand-text-secondary line-clamp-2">{c.description}</p>
                        </div>
                    ))}
                     {panelTab === 'world' && activeStory?.world.map(w => (
                        <div key={w.id} className="mb-3">
                            <p className="font-bold text-sm text-brand-text-primary">{w.name}</p>
                            <p className="text-xs text-brand-text-secondary line-clamp-2">{w.description}</p>
                        </div>
                    ))}
                  </div>
              </div>
          </div>
      </div>
      
      {activeModal === 'feedback' && (
        <FeedbackModal 
          chapterContent={content}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'modify' && selectedText && (
        <ModifyTextModal
          onClose={() => setActiveModal(null)}
          selectedText={selectedText}
          fullContext={content}
          selectionRange={selectionRange}
          onReplaceText={(newText) => {
            const newContent = content.substring(0, selectionRange[0]) + newText + content.substring(selectionRange[1]);
            setContent(newContent);
            setSelectedText('');
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'grammar' && (
        <GrammarModal
          onClose={() => setActiveModal(null)}
          textToCheck={content}
          onAcceptSuggestion={(suggestion) => {
             setContent(prev => prev.replace(suggestion.originalText, suggestion.suggestedText));
          }}
        />
      )}
    </>
  );
};

export default ChapterEditor;
