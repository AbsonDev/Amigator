import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Chapter, Version, StoryContent } from '../types';
import { 
    SparklesIcon, ClipboardIcon, TextSelectIcon, GrammarIcon, WandSparklesIcon,
    BoldIcon, ItalicIcon, UnderlineIcon, ListBulletIcon, ListOrderedIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon
} from './Icons';
import { useStory } from '../context/StoryContext';
import { continueWriting, formatTextWithAI } from '../services/geminiService';
import FeedbackModal from './editor/FeedbackModal';
import ModifyTextModal from './editor/ModifyTextModal';
import GrammarModal from './editor/GrammarModal';
import debounce from 'lodash.debounce';

interface ChapterEditorProps {
  chapter: Chapter;
  onBack: () => void;
}

const LoadingButtonSpinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>;

// Helper to strip HTML tags for plain text operations
const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const FormattingToolbar: React.FC<{ onMagicFormat: () => void, isFormatting: boolean }> = ({ onMagicFormat, isFormatting }) => {
    const applyStyle = (command: string) => {
        document.execCommand(command, false);
    };

    const FormatButton = ({ command, children, title }: { command: string, children: React.ReactNode, title: string }) => (
        <button 
            onMouseDown={e => { e.preventDefault(); applyStyle(command); }} 
            title={title}
            className="p-2 rounded-md hover:bg-brand-primary/20"
        >
            {children}
        </button>
    );

    return (
        <div className="bg-brand-surface border-b border-brand-secondary p-2 flex items-center gap-1 flex-wrap sticky top-0 z-10 flex-shrink-0">
            <button onClick={onMagicFormat} disabled={isFormatting} className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {isFormatting ? <LoadingButtonSpinner /> : <WandSparklesIcon className="w-4 h-4" />} Formatação Mágica
            </button>
            <div className="h-5 w-px bg-brand-secondary mx-2"></div>
            <FormatButton command="bold" title="Negrito"><BoldIcon /></FormatButton>
            <FormatButton command="italic" title="Itálico"><ItalicIcon /></FormatButton>
            <FormatButton command="underline" title="Sublinhado"><UnderlineIcon /></FormatButton>
            <div className="h-5 w-px bg-brand-secondary mx-2"></div>
            <FormatButton command="insertUnorderedList" title="Lista com Marcadores"><ListBulletIcon /></FormatButton>
            <FormatButton command="insertOrderedList" title="Lista Numerada"><ListOrderedIcon /></FormatButton>
            <div className="h-5 w-px bg-brand-secondary mx-2"></div>
            <FormatButton command="justifyLeft" title="Alinhar à Esquerda"><AlignLeftIcon /></FormatButton>
            <FormatButton command="justifyCenter" title="Centralizar"><AlignCenterIcon /></FormatButton>
            <FormatButton command="justifyRight" title="Alinhar à Direita"><AlignRightIcon /></FormatButton>
        </div>
    );
};


const ChapterEditor: React.FC<ChapterEditorProps> = ({ chapter, onBack }) => {
  const { activeStory, updateActiveStory } = useStory();
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [wordCount, setWordCount] = useState(() => stripHtml(chapter.content).split(/\s+/).filter(Boolean).length);

  // Loading states
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  
  // Modal states
  const [activeModal, setActiveModal] = useState<'feedback' | 'modify' | 'grammar' | null>(null);

  // This effect prevents React from re-rendering the contentEditable div on every state change,
  // which fixes the selection bugs.
  useEffect(() => {
    if (editorRef.current) {
        // Set the initial content.
        editorRef.current.innerHTML = chapter.content;
        
        // Update word count initially.
        setWordCount(stripHtml(chapter.content).split(/\s+/).filter(Boolean).length);
    }
  }, [chapter.id]); // Only run when the chapter itself changes.

  const debouncedAutosave = useMemo(
    () =>
      debounce((currentContent: string) => {
        if (!activeStory?.autosaveEnabled) return;
        
        const currentChapterState = { ...chapter, content: currentContent };
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
      }, 5000),
    [activeStory?.autosaveEnabled, chapter.id, updateActiveStory]
  );
  
  useEffect(() => {
    return () => debouncedAutosave.cancel();
  }, [debouncedAutosave]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      const text = stripHtml(currentContent);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      debouncedAutosave(currentContent);
    }
  }, [debouncedAutosave]);

  const handleSave = () => {
    if (!editorRef.current) return;
    const currentContent = editorRef.current.innerHTML;
    const updatedChapter = { ...chapter, content: currentContent };
    updateActiveStory(prevStory => {
        return {
            ...prevStory,
            chapters: prevStory.chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c),
            actionLog: [...prevStory.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: `Salvou o capítulo '${updatedChapter.title}'.`}]
        };
    });
    alert('Capítulo salvo com sucesso!');
  };

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
        setSelectedText(selection.toString());
    } else {
        setSelectedText('');
    }
  }, []);

  useEffect(() => {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
          document.removeEventListener('selectionchange', handleSelectionChange);
      };
  }, [handleSelectionChange]);

  const handleContinueWriting = async () => {
    if (!editorRef.current) return;
    setIsLoadingContinue(true);
    try {
      const currentContent = editorRef.current.innerHTML;
      const continuation = await continueWriting(currentContent);
      editorRef.current.innerHTML += `<p>${continuation.trim()}</p>`;
      handleInput();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoadingContinue(false);
    }
  };

  const handleMagicFormat = async () => {
    if (!editorRef.current) return;
    setIsFormatting(true);
    try {
        const plainText = stripHtml(editorRef.current.innerHTML);
        const formattedHtml = await formatTextWithAI(plainText);
        editorRef.current.innerHTML = formattedHtml;
        handleInput();
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setIsFormatting(false);
    }
  };
  
  const getCurrentContent = () => editorRef.current ? editorRef.current.innerHTML : '';

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
          </div>
          
          <div className="flex-grow flex flex-col bg-brand-background border-x border-b border-brand-secondary rounded-b-lg overflow-hidden">
             <FormattingToolbar onMagicFormat={handleMagicFormat} isFormatting={isFormatting} />
             <div className="flex-grow p-8 overflow-y-auto">
                <div
                    ref={editorRef}
                    onInput={handleInput}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="w-full max-w-4xl mx-auto font-serif text-lg leading-relaxed text-brand-text-primary bg-brand-surface p-8 rounded-md border border-brand-secondary outline-none focus:ring-2 focus:ring-brand-primary"
                    aria-label="Editor de Capítulo"
                ></div>
             </div>
             <div className="flex-shrink-0 text-right p-2 border-t border-brand-secondary bg-brand-surface text-sm text-brand-text-secondary">
                Contagem de palavras: {wordCount}
             </div>
          </div>
      </div>
      
      {activeModal === 'feedback' && <FeedbackModal chapterContent={getCurrentContent()} onClose={() => setActiveModal(null)} />}
      
      {activeModal === 'modify' && selectedText && (
        <ModifyTextModal 
          selectedText={selectedText} 
          fullContext={getCurrentContent()} 
          onClose={() => setActiveModal(null)} 
          onReplaceText={(newText) => {
            if (editorRef.current) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(newText));
                    handleInput(); // To update word count and trigger autosave
                }
            }
            setActiveModal(null);
          }} 
        />
      )}

      {activeModal === 'grammar' && (
        <GrammarModal
          textToCheck={stripHtml(getCurrentContent())}
          onClose={() => setActiveModal(null)}
          onAcceptSuggestion={(suggestion) => {
            if (editorRef.current) {
              const content = editorRef.current.innerHTML;
              // This is a simple implementation. A more robust solution would use Range/Selection APIs.
              editorRef.current.innerHTML = content.replace(suggestion.originalText, suggestion.suggestedText);
              handleInput();
            }
          }}
        />
      )}
    </>
  );
};

export default ChapterEditor;
