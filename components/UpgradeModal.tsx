import React from 'react';
import { useAuthor } from '../context/AuthorContext';
import Modal from './common/Modal';
import { SparklesIcon } from './Icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        <span>{children}</span>
    </li>
);


const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const { author, setAuthor } = useAuthor();
    
    const handleUpgrade = () => {
        if (author) {
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7);

            setAuthor({
                ...author,
                subscription: { 
                    tier: 'Pro',
                    trialEnds: trialEndDate.toISOString() 
                }
            });
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Atualize para o Plano Pro" className="max-w-2xl">
            <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mb-4 ring-4 ring-brand-primary/30">
                    <SparklesIcon className="w-10 h-10 text-brand-primary"/>
                </div>
                <h2 id="modal-title" className="text-3xl font-bold font-serif text-brand-text-primary mb-2">
                    Desbloqueie Todo o Potencial
                </h2>
                <p className="text-brand-text-secondary max-w-md mx-auto">
                    Comece seu teste gratuito de 7 dias para remover todos os limites e obter acesso a ferramentas exclusivas de IA.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 text-left">
                    <div className="bg-brand-background p-4 rounded-lg border border-brand-secondary">
                        <h3 className="font-bold text-lg text-center mb-3">Plano Gratuito</h3>
                        <ul className="space-y-2 text-sm text-brand-text-secondary">
                            <ProFeature>1 Livro</ProFeature>
                            <ProFeature>Criação básica de histórias</ProFeature>
                            <ProFeature>Assistente de escrita limitado</ProFeature>
                        </ul>
                    </div>
                     <div className="bg-brand-primary/10 p-4 rounded-lg border border-brand-primary">
                        <h3 className="font-bold text-lg text-center text-brand-primary mb-3">Plano Pro</h3>
                        <ul className="space-y-2 text-sm text-brand-text-primary">
                            <ProFeature>Livros ilimitados</ProFeature>
                            <ProFeature>Análise avançada de trama</ProFeature>
                            <ProFeature>Análise de repetição de texto</ProFeature>
                            <ProFeature>Salvamento automático e histórico de versões</ProFeature>
                            <ProFeature>Exportação em PDF e DOCX</ProFeature>
                            <ProFeature>Geração de avatares com mais estilos</ProFeature>
                        </ul>
                    </div>
                </div>

                <button 
                    onClick={handleUpgrade} 
                    className="w-full max-w-md mx-auto bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105"
                >
                    Comece seu Teste Gratuito de 7 Dias
                </button>
                <p className="text-xs text-brand-text-secondary mt-3">Nenhum cartão de crédito necessário. Cancele a qualquer momento.</p>

                 <button onClick={onClose} className="mt-3 text-sm text-brand-text-secondary hover:text-white">
                    Talvez mais tarde
                </button>
            </div>
        </Modal>
    );
};

export default UpgradeModal;