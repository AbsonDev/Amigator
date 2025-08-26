import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Chapter, Version, StoryContent, WorldEntry, Character } from '../types';
import { 
    SparklesIcon, ClipboardIcon, TextSelectIcon, GrammarIcon, WandSparklesIcon,
    BoldIcon, ItalicIcon, UnderlineIcon, ListBulletIcon, ListOrderedIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon
} from './Icons';
import { useStory } from '../context/StoryContext';
import { continueWriting, formatTextWithAI } from '../../services/geminiService';
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

// --- World-Building Popover Component ---
type WorldEntity = {
    id: string;
    name: string;
    description: string;
    category: string;
};

interface WorldEntityPopoverProps {
    entity: WorldEntity;
    position: { top: number; left: number };
}

const WorldEntityPopover: React.FC<WorldEntityPopoverProps> = ({ entity, position }) => (
    <div 
        className="fixed z-20 bg-brand-surface p-4 rounded-lg border border-brand-secondary shadow-xl w-full max-w-sm text-sm transition-opacity duration-200"
        style={{ top: position.top, left: position.left, transform: 'translateY(10px)' }}
    >
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-brand-text-primary">{entity.name}</h4>
            <span className="text-xs bg-brand-primary/20 text-brand-primary font-semibold px-2 py-0.5 rounded-full">{entity.category}</span>
        </div>
        <p className="text-brand-text-secondary font-serif text-xs max-h-40 overflow-y-auto">{entity.description}</p>
    </div>
);

// --- Formatting Toolbar Component ---
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

  // World-Building state
  const [popover, setPopover] = useState<{ visible: boolean; position: { top: number; left: number }; entity: WorldEntity | null }>({ visible: false, position: { top: 0, left: 0 }, entity: null });

  const worldEntities = useMemo<WorldEntity[]>(() => {
    if (!activeStory) return [];
    const fromWorld = activeStory.world.map(w => ({ ...w, description: w.description }));
    const fromChars = activeStory.characters.map(c => ({
        id: c.id,
        name: c.name,
        category: 'Personagem',
        description: `Papel: ${c.role}. Aparência: ${c.appearance}. ${c.description}`
    }));
    return [...fromWorld, ...fromChars].filter(e => e.name.trim().length > 2); // Filter out short/empty names
  }, [activeStory?.world, activeStory?.characters]);

  // This effect prevents React from re-rendering the contentEditable div on every state change,
  // which fixes the selection bugs.
  useEffect(() => {
    if (editorRef.current) {
        editorRef.current.innerHTML = chapter.content;
        setWordCount(stripHtml(chapter.content).split(/\s+/).filter(Boolean).length);
    }
  }, [chapter.id]);

  const debouncedAutosave = useMemo(
    () => debounce((currentContent: string) => {
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
  
  const highlightTerms = useCallback(debounce(() => {
    if (!editorRef.current || worldEntities.length === 0) return;
    
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const entityNames = worldEntities.map(e => escapeRegExp(e.name)).sort((a,b) => b.length - a.length); // Sort to match longest names first
    const regex = new RegExp(`\\b(${entityNames.join('|')})\\b`, 'gi');
    const entityMap = new Map(worldEntities.map(e => [e.name.toLowerCase(), e]));

    const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent;
            if (textContent && regex.test(textContent)) {
                if (node.parentElement?.closest('.world-entry-highlight')) return;

                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                textContent.replace(regex, (match, ...args) => {
                    const offset = args[args.length - 2];
                    if (offset > lastIndex) {
                        fragment.appendChild(document.createTextNode(textContent.substring(lastIndex, offset)));
                    }
                    const entity = entityMap.get(match.toLowerCase());
                    if (entity) {
                        const span = document.createElement('span');
                        span.className = 'world-entry-highlight';
                        span.dataset.entryId = entity.id;
                        span.textContent = match;
                        fragment.appendChild(span);
                    }
                    lastIndex = offset + match.length;
                    return match;
                });
                if (lastIndex < textContent.length) {
                    fragment.appendChild(document.createTextNode(textContent.substring(lastIndex)));
                }

                if (fragment.childNodes.length > 0) {
                    node.parentElement?.replaceChild(fragment, node);
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(walk);
        }
    };
    
    const unwrapHighlights = (container: HTMLElement) => {
        container.querySelectorAll('span.world-entry-highlight').forEach(span => {
            const parent = span.parentNode;
            if (parent) {
                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span);
                }
                parent.removeChild(span);
                parent.normalize(); // Merges adjacent text nodes
            }
        });
    };
    
    unwrapHighlights(editorRef.current);
    walk(editorRef.current);
  }, 500), [worldEntities]);


  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      const text = stripHtml(currentContent);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      debouncedAutosave(currentContent);
      highlightTerms();
    }
  }, [debouncedAutosave, highlightTerms]);

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
      const editorDiv = editorRef.current;
      
      const handleMouseOver = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const highlight = target.closest<HTMLElement>('.world-entry-highlight');
          if (highlight?.dataset.entryId) {
              const entity = worldEntities.find(we => we.id === highlight.dataset.entryId);
              if (entity) {
                  const rect = highlight.getBoundingClientRect();
                  setPopover({ visible: true, entity, position: { top: rect.bottom, left: rect.left } });
              }
          }
      };

      const handleMouseOut = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const highlight = target.closest<HTMLElement>('.world-entry-highlight');
          if (highlight) {
              setPopover(p => ({ ...p, visible: false }));
          }
      };

      editorDiv?.addEventListener('mouseover', handleMouseOver);
      editorDiv?.addEventListener('mouseout', handleMouseOut);
      
      highlightTerms();

      return () => {
          document.removeEventListener('selectionchange', handleSelectionChange);
          editorDiv?.removeEventListener('mouseover', handleMouseOver);
          editorDiv?.removeEventListener('mouseout', handleMouseOut);
          debouncedAutosave.cancel();
          highlightTerms.cancel();
      };
  }, [handleSelectionChange, debouncedAutosave, highlightTerms, worldEntities]);

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
      
      {popover.visible && popover.entity && <WorldEntityPopover entity={popover.entity} position={popover.position} />}

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