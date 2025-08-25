import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Chapter, BetaReaderFeedback, GrammarSuggestion, Story, Version, ActionLogEntry } from '../types';
import { continueWriting, modifyText, getBetaReaderFeedback, checkGrammar } from '../services/geminiService';
import { SparklesIcon, ClipboardIcon, TextSelectIcon, GrammarIcon } from './Icons';

interface ChapterEditorProps {
  chapter: Chapter;
  story: Story;
  setStory: (updater: React.SetStateAction<Story>) => void;
  onSave: (updatedChapter: Chapter) => void;
  onBack: () => void;
}

const LoadingButtonSpinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>;
const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>;


const ChapterEditor: React.FC<ChapterEditorProps> = ({ chapter, story, setStory, onSave, onBack }) => {
  const [content, setContent] = useState(chapter.content);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<[number, number]>([0, 0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimeoutRef = useRef<number | null>(null);

  // Loading states
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isLoadingModify, setIsLoadingModify] = useState(false);
  const [isLoadingGrammar, setIsLoadingGrammar] = useState(false);

  // Modal states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
  
  // Data states
  const [feedback, setFeedback] = useState<BetaReaderFeedback | null>(null);
  const [modifiedText, setModifiedText] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarSuggestion[]>([]);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!story.autosaveEnabled) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = window.setTimeout(() => {
      setStory(prevStory => {
          if(!prevStory) return prevStory;
          
          const currentChapterState = { ...chapter, content };
          const storyWithCurrentChapter = {
              ...prevStory,
              chapters: prevStory.chapters.map(c => c.id === currentChapterState.id ? currentChapterState : c)
          };

          const newVersion: Version = {
              id: `ver-${Date.now()}`,
              name: `Autosave - ${new Date().toLocaleString()}`,
              createdAt: new Date().toISOString(),
              storyState: JSON.parse(JSON.stringify(storyWithCurrentChapter)) // Deep clone
          };

          const newLogEntry: ActionLogEntry = {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: 'agent',
              action: `Versão salva automaticamente.`
          };
          
          return {
              ...storyWithCurrentChapter,
              versions: [...prevStory.versions, newVersion].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
              actionLog: [...prevStory.actionLog, newLogEntry]
          };
      });
    }, 5000); // 5 seconds delay

  }, [content, story.autosaveEnabled, chapter, setStory]);


  const handleSave = () => {
    onSave({ ...chapter, content });
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
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsLoadingContinue(false);
    }
  };
  
  const handleGetFeedback = async () => {
    setIsLoadingFeedback(true);
    setIsFeedbackModalOpen(true);
    setFeedback(null);
    try {
      const result = await getBetaReaderFeedback(content);
      setFeedback(result);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
      setIsFeedbackModalOpen(false);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleModifyText = async (instruction: string) => {
    if (!instruction.trim()) {
      alert("Por favor, forneça uma instrução.");
      return;
    }
    setIsLoadingModify(true);
    setModifiedText('');
    try {
      const result = await modifyText(selectedText, content, instruction);
      setModifiedText(result);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsLoadingModify(false);
    }
  }

  const handleOpenModifyModal = () => {
    if (selectedText) {
      setModifiedText('');
      setCustomInstruction('');
      setIsModifyModalOpen(true);
    }
  }
  
  const handleReplaceText = () => {
    const newContent = content.substring(0, selectionRange[0]) + modifiedText + content.substring(selectionRange[1]);
    setContent(newContent);
    setSelectedText('');
    setIsModifyModalOpen(false);
  };

  const handleCheckGrammar = async () => {
    setIsLoadingGrammar(true);
    setIsGrammarModalOpen(true);
    setGrammarSuggestions([]);
    try {
        const results = await checkGrammar(content);
        setGrammarSuggestions(results);
    } catch(e) {
        alert((e as Error).message);
        setIsGrammarModalOpen(false);
    } finally {
        setIsLoadingGrammar(false);
    }
  };

  const handleAcceptSuggestion = (suggestion: GrammarSuggestion) => {
    setContent(prev => prev.replace(suggestion.originalText, suggestion.suggestedText));
    setGrammarSuggestions(prev => prev.filter(s => s.originalText !== suggestion.originalText));
  };
  
  const handleIgnoreSuggestion = (suggestion: GrammarSuggestion) => {
    setGrammarSuggestions(prev => prev.filter(s => s.originalText !== suggestion.originalText));
  };


  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 flex flex-col h-full">
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

          {/* AI Tools */}
          <div className="bg-brand-surface border border-brand-secondary rounded-t-lg p-2 flex items-center gap-2 flex-wrap">
              <button onClick={handleContinueWriting} disabled={isLoadingContinue} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoadingContinue ? <LoadingButtonSpinner /> : <SparklesIcon className="w-4 h-4" />} Continuar Escrita
              </button>
              <button onClick={handleGetFeedback} disabled={isLoadingFeedback} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoadingFeedback ? <LoadingButtonSpinner /> : <ClipboardIcon className="w-4 h-4" />} Análise Crítica
              </button>
              <button onClick={handleOpenModifyModal} disabled={!selectedText} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <TextSelectIcon className="w-4 h-4" /> Modificar Seleção
              </button>
              <button onClick={handleCheckGrammar} disabled={isLoadingGrammar} className="flex items-center gap-2 text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoadingGrammar ? <LoadingButtonSpinner /> : <GrammarIcon className="w-4 h-4" />} Verificar Gramática
              </button>
          </div>

          <div className="flex-grow flex flex-col">
              <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onSelect={handleSelectionChange}
                  className="w-full flex-grow bg-brand-surface border-x border-b border-brand-secondary rounded-b-lg p-4 font-serif text-lg leading-relaxed text-brand-text-primary resize-none focus:ring-2 focus:ring-brand-primary outline-none"
                  placeholder="Comece a escrever..."
              />
              <div className="text-right text-sm text-brand-text-secondary mt-2 pr-2">
                  Contagem de palavras: {wordCount}
              </div>
          </div>
      </div>
      
      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setIsFeedbackModalOpen(false)}>
          <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Análise Crítica do Leitor Beta IA</h2>
            {isLoadingFeedback && <div className="text-center p-8"><LoadingSpinnerSmall /> <p className="mt-2">Analisando seu texto...</p></div>}
            {feedback && (
              <div className="space-y-4 text-brand-text-secondary">
                <div>
                  <h3 className="font-semibold text-brand-text-primary">Impressão Geral</h3>
                  <p className="font-serif italic">{feedback.overallImpression}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-text-primary">Ritmo</h3>
                  <p className="font-serif">{feedback.pacing}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-text-primary">Diálogo</h3>
                  <p className="font-serif">{feedback.dialogue}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-text-primary">Consistência dos Personagens</h3>
                  <p className="font-serif">{feedback.characterConsistency}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-text-primary">Sugestões de Melhoria</h3>
                  <ul className="list-disc list-inside space-y-1 font-serif">
                    {feedback.suggestionsForImprovement.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
            <button onClick={() => setIsFeedbackModalOpen(false)} className="mt-6 w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90">Fechar</button>
          </div>
        </div>
      )}

      {/* Modify Text Modal */}
      {isModifyModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setIsModifyModalOpen(false)}>
          <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-3xl p-6 font-sans" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Modificar Texto Selecionado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-background p-3 rounded-lg border border-brand-secondary">
                    <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">Original</h3>
                    <p className="text-sm font-serif max-h-48 overflow-y-auto p-1">{selectedText}</p>
                </div>
                 <div className="bg-brand-background p-3 rounded-lg border border-brand-secondary flex flex-col">
                    <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">Sugestão da IA</h3>
                    {isLoadingModify ? <div className="flex-grow flex justify-center items-center h-full"><LoadingSpinnerSmall/></div> : 
                    <p className="text-sm font-serif max-h-48 overflow-y-auto flex-grow p-1">{modifiedText || "Aguardando comando..."}</p>}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 my-4">
              <span className="text-sm text-brand-text-secondary">Ações rápidas:</span>
              <button onClick={() => handleModifyText('Reescreva o seguinte trecho para melhorar a clareza e o fluxo.')} disabled={isLoadingModify} className="text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors">Reescrever</button>
              <button onClick={() => handleModifyText('Expanda o seguinte trecho, adicionando mais detalhes descritivos.')} disabled={isLoadingModify} className="text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors">Expandir</button>
              <button onClick={() => handleModifyText('Encurte o seguinte trecho, tornando-o mais conciso.')} disabled={isLoadingModify} className="text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors">Encurtar</button>
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="text"
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    placeholder="Ou dê uma instrução específica (ex: 'Deixe mais sombrio')"
                    className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary outline-none"
                />
                <button onClick={() => handleModifyText(customInstruction)} disabled={isLoadingModify || !customInstruction} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50">Gerar</button>
            </div>
            <div className="flex gap-2 mt-4">
                <button onClick={() => setIsModifyModalOpen(false)} className="w-full bg-brand-secondary text-brand-text-primary font-bold py-2 rounded-lg hover:bg-opacity-80">Cancelar</button>
                <button onClick={handleReplaceText} disabled={!modifiedText || isLoadingModify} className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50">Substituir Texto</button>
            </div>
          </div>
        </div>
      )}

      {/* Grammar Check Modal */}
      {isGrammarModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setIsGrammarModalOpen(false)}>
          <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-3xl max-h-[90vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4 flex-shrink-0">Revisão Gramatical e de Estilo</h2>
            <div className="flex-grow overflow-y-auto pr-2">
              {isLoadingGrammar && <div className="text-center p-8"><LoadingSpinnerSmall /> <p className="mt-2">Analisando gramática...</p></div>}
              {!isLoadingGrammar && grammarSuggestions.length === 0 && (
                <div className="text-center p-8">
                  <p className="text-lg font-semibold text-brand-text-primary">Nenhuma sugestão encontrada!</p>
                  <p className="text-brand-text-secondary mt-2">O texto parece gramaticalmente correto.</p>
                </div>
              )}
              {grammarSuggestions.length > 0 && (
                <div className="space-y-4">
                  {grammarSuggestions.map((s, i) => (
                    <div key={i} className="bg-brand-background p-4 rounded-lg border border-brand-secondary">
                      <p className="text-sm text-brand-text-secondary mb-2">{s.explanation}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm font-serif">
                        <div className="p-2 rounded bg-red-900/30">
                          <p className="line-through text-red-300/80">{s.originalText}</p>
                        </div>
                        <div className="p-2 rounded bg-green-900/30">
                          <p className="text-green-300">{s.suggestedText}</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button onClick={() => handleIgnoreSuggestion(s)} className="text-xs font-semibold text-brand-text-secondary hover:text-white transition-colors px-3 py-1">Ignorar</button>
                        <button onClick={() => handleAcceptSuggestion(s)} className="text-xs font-semibold bg-brand-primary text-white px-3 py-1.5 rounded-md hover:bg-opacity-80 transition-colors">Aceitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setIsGrammarModalOpen(false)} className="mt-6 w-full bg-brand-secondary text-white font-bold py-2 rounded-lg hover:bg-opacity-80 flex-shrink-0">Fechar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChapterEditor;