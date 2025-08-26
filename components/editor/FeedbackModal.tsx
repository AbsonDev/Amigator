import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { getBetaReaderFeedback } from '../../services/geminiService';
import type { BetaReaderFeedback } from '../../types';

interface FeedbackModalProps {
  chapterContent: string;
  onClose: () => void;
}

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>;

const FeedbackModal: React.FC<FeedbackModalProps> = ({ chapterContent, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<BetaReaderFeedback | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      try {
        const result = await getBetaReaderFeedback(chapterContent);
        setFeedback(result);
      } catch (error) {
        alert((error as Error).message);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [chapterContent, onClose]);

  return (
    <Modal isOpen={true} onClose={onClose} title="Análise Crítica do Leitor Beta IA" className="max-w-2xl max-h-[90vh]">
        <div className="p-6 flex flex-col h-full">
            <h2 id="modal-title" className="text-2xl font-bold font-serif text-brand-text-primary mb-4 flex-shrink-0">Análise Crítica do Leitor Beta IA</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                {isLoading && <div className="text-center p-8"><LoadingSpinnerSmall /> <p className="mt-2">Analisando seu texto...</p></div>}
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
            </div>
            <button onClick={onClose} className="mt-6 w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 flex-shrink-0">Fechar</button>
        </div>
    </Modal>
  );
};

export default FeedbackModal;
