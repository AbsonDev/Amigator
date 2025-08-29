

import React from 'react';
import { useAuthor } from '../context/AuthorContext';
import Modal from './common/Modal';
import { SparklesIcon } from './Icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);


const plansForDisplay = [
  { tier: 'Free' as const, name: 'Gratuito', price: '0' },
  { tier: 'Hobby' as const, name: 'Hobby', price: '19' },
  { tier: 'Amador' as const, name: 'Amador', price: '29', recommended: true },
  { tier: 'Profissional' as const, name: 'Profissional', price: '49' },
];

const allFeatures = [
    'Número de livros',
    'Exportação de arquivos',
    'Análises com IA',
    'Análise de Continuidade da Trama',
    'Histórico de versões & Autosave',
    'Suporte prioritário'
];

const featureMap: Record<string, any> = {
    'Número de livros': { Free: '1 livro', Hobby: 'Até 5 livros', Amador: 'Ilimitado', Profissional: 'Ilimitado' },
    'Exportação de arquivos': { Free: 'TXT', Hobby: 'TXT', Amador: 'TXT, PDF, DOCX', Profissional: 'TXT, PDF, DOCX' },
    'Análises com IA': { Free: 'Uso limitado', Hobby: 'Uso limitado', Amador: 'Uso ilimitado', Profissional: 'Uso ilimitado' },
    'Análise de Continuidade da Trama': { Free: false, Hobby: false, Amador: true, Profissional: true },
    'Histórico de versões & Autosave': { Free: false, Hobby: false, Amador: false, Profissional: true },
    'Suporte prioritário': { Free: false, Hobby: false, Amador: false, Profissional: true },
};


const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const { author, setAuthor } = useAuthor();
    
    const handleUpgrade = (tier: 'Hobby' | 'Amador' | 'Profissional') => {
        if (author) {
             const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7);

            setAuthor({
                ...author,
                subscription: { 
                    tier: tier,
                    trialEnds: trialEndDate.toISOString() 
                }
            });
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Desbloqueie Todo o Potencial" className="max-w-7xl max-h-[90vh]">
            <div className="p-4 md:p-8 overflow-y-auto">
                <div className="text-center mb-10">
                    <h2 id="modal-title" className="text-3xl md:text-4xl font-bold font-serif text-brand-text-primary mb-2">
                        Encontre o plano perfeito para você
                    </h2>
                    <p className="text-brand-text-secondary max-w-2xl mx-auto">
                        Comece seu teste gratuito de 7 dias em qualquer plano pago. Sem necessidade de cartão de crédito.
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 md:-mx-8 md:px-8">
                    <div className="grid grid-cols-5 gap-4 min-w-[1000px] pt-4">
                        {/* Feature Headers */}
                        <div className="pt-24 pb-4 min-w-[240px]">
                            {allFeatures.map(feature => (
                                <div key={feature} className="h-16 flex items-center">
                                    <p className="font-semibold text-sm text-brand-text-primary whitespace-nowrap">{feature}</p>
                                </div>
                            ))}
                        </div>

                        {/* Plan Columns */}
                        {plansForDisplay.map(plan => (
                            <div key={plan.name} className={`text-center p-4 md:p-6 rounded-lg border flex flex-col relative min-w-[180px] ${plan.recommended ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-secondary'}`}>
                                {plan.recommended && (
                                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">MAIS POPULAR</div>
                                )}
                                 <h3 className={`text-2xl font-bold font-serif ${plan.recommended ? 'text-brand-primary' : 'text-brand-text-primary'}`}>{plan.name}</h3>
                                 <p className="my-2"><span className="text-4xl font-bold">{plan.price === '0' ? 'Grátis' : `R$${plan.price}`}</span>{plan.price !== '0' && <span className="text-brand-text-secondary">/mês</span>}</p>
                                 
                                 {plan.tier !== 'Free' ? (
                                    <button onClick={() => handleUpgrade(plan.tier)} className={`w-full mb-4 font-bold py-2 rounded-lg transition-colors whitespace-nowrap ${plan.recommended ? 'bg-brand-primary text-white hover:bg-opacity-90' : 'bg-brand-secondary text-white hover:bg-brand-primary'}`}>Começar Teste</button>
                                 ) : (
                                    <div className="w-full mb-4 py-2 rounded-lg border border-dashed border-brand-secondary text-sm font-bold text-brand-text-secondary whitespace-nowrap">Seu Plano Atual</div>
                                 )}

                                 {allFeatures.map(featureName => (
                                     <div key={featureName} className="h-16 flex items-center justify-center border-t border-brand-secondary/50">
                                         {typeof featureMap[featureName][plan.tier] === 'boolean' ? (
                                             featureMap[featureName][plan.tier] ? <CheckIcon className="w-6 h-6 text-green-400"/> : <span className="text-brand-text-secondary text-2xl">-</span>
                                         ) : (
                                             <p className="text-sm font-semibold text-brand-text-secondary">{featureMap[featureName][plan.tier]}</p>
                                         )}
                                     </div>
                                 ))}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Social Proof Section */}
                <div className="mt-12 pt-8 border-t border-brand-secondary">
                     <h3 className="text-center text-2xl font-bold font-serif mb-6">Amado por Autores Independentes</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-4">
                            <p className="italic text-brand-text-secondary">"A análise de continuidade é um salva-vidas. A IA encontrou um furo de roteiro que eu nunca teria visto!"</p>
                            <p className="font-semibold text-brand-text-primary mt-3">- J. Valerius, Autor de Fantasia</p>
                        </div>
                         <div className="text-center p-4">
                            <p className="italic text-brand-text-secondary">"Finalmente consegui terminar meu primeiro rascunho. A ferramenta de 'continuar escrita' me salvou do bloqueio criativo várias vezes."</p>
                            <p className="font-semibold text-brand-text-primary mt-3">- Clara Menezes, Escritora de Ficção Científica</p>
                        </div>
                         <div className="text-center p-4">
                            <p className="italic text-brand-text-secondary">"Passar da ideia para o enredo visual com os cartões de trama acelerou meu processo de escrita em semanas."</p>
                            <p className="font-semibold text-brand-text-primary mt-3">- R. D. Gomes, Autor de Mistério</p>
                        </div>
                     </div>
                </div>

            </div>
        </Modal>
    );
};

export default UpgradeModal;