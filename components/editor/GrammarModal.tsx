import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { checkGrammar } from '../../services/geminiService';
import type { GrammarSuggestion } from '../../types';

interface GrammarModalProps {
  textToCheck: string;
  onClose: () => void;
  onAcceptSuggestion: (suggestion: GrammarSuggestion) => void;
}

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>;

const GrammarModal: React.FC<GrammarModalProps> = ({ textToCheck, onClose, onAcceptSuggestion }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<GrammarSuggestion[]>([]);

  useEffect(() => {
    const fetchGrammar = async () => {
      setIsLoading(true);
      try {
        const results = await checkGrammar(textToCheck);
        setSuggestions(results);
      } catch (e) {
        alert((e as Error).message);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrammar();
  }, [textToCheck, onClose]);
  
  const handleAccept = (suggestion: GrammarSuggestion) => {
    onAcceptSuggestion(suggestion);
    setSuggestions(prev => prev.filter(s => s.originalText !== suggestion.originalText));
  };
  
  const handleIgnore = (suggestion: GrammarSuggestion) => {
    setSuggestions(prev => prev.filter(s => s.originalText !== suggestion.originalText));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Revisão Gramatical e de Estilo" className="max-w-3xl max-h-[90vh]">
        <div className="p-6 flex flex-col h-full">
            <h2 id="modal-title" className="text-2xl font-bold font-serif text-brand-text-primary mb-4 flex-shrink-0">Revisão Gramatical e de Estilo</h2>
            <div className="flex-grow overflow-y-auto pr-2">
              {isLoading && <div className="text-center p-8"><LoadingSpinnerSmall /> <p className="mt-2">Analisando gramática...</p></div>}
              {!isLoading && suggestions.length === 0 && (
                <div className="text-center p-8">
                  <p className="text-lg font-semibold text-brand-text-primary">Nenhuma sugestão encontrada!</p>
                  <p className="text-brand-text-secondary mt-2">O texto parece gramaticalmente correto.</p>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="space-y-4">
                  {suggestions.map((s, i) => (
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
                        <button onClick={() => handleIgnore(s)} className="text-xs font-semibold text-brand-text-secondary hover:text-white transition-colors px-3 py-1">Ignorar</button>
                        <button onClick={() => handleAccept(s)} className="text-xs font-semibold bg-brand-primary text-white px-3 py-1.5 rounded-md hover:bg-opacity-80 transition-colors">Aceitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} className="mt-6 w-full bg-brand-secondary text-white font-bold py-2 rounded-lg hover:bg-opacity-80 flex-shrink-0">Fechar</button>
        </div>
    </Modal>
  );
};

export default GrammarModal;
