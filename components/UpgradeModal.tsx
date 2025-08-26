import React from 'react';
import { useAuthor } from '../context/AuthorContext';
import Modal from './common/Modal';
import { SparklesIcon } from './Icons';
import type { Author } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

const plans = [
  {
    name: 'Hobby',
    price: '19',
    tier: 'Hobby' as const,
    description: 'Para o escritor que está começando e quer explorar mais fundo.',
    features: [
      'Até 5 livros',
      'Geração de avatares com mais estilos',
      'Central de Ideias',
      'Exportação em TXT',
    ],
  },
  {
    name: 'Amador',
    price: '29',
    tier: 'Amador' as const,
    description: 'As ferramentas essenciais para levar sua escrita ao próximo nível.',
    features: [
      'Livros ilimitados',
      'Análise de Continuidade da Trama',
      'Análise de repetição de texto',
      'Exportação em PDF e DOCX',
    ],
    recommended: true,
  },
  {
    name: 'Profissional',
    price: '49',
    tier: 'Profissional' as const,
    description: 'O arsenal completo para o autor dedicado e focado na publicação.',
    features: [
      'Tudo do plano Amador',
      'Salvamento automático e histórico de versões',
      'Ferramentas de colaboração (Em Breve)',
      'Suporte prioritário',
    ],
  },
];


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
        <Modal isOpen={isOpen} onClose={onClose} title="Desbloqueie Todo o Potencial" className="max-w-4xl">
            <div className="p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mb-4 ring-4 ring-brand-primary/30">
                        <SparklesIcon className="w-10 h-10 text-brand-primary"/>
                    </div>
                    <h2 id="modal-title" className="text-3xl font-bold font-serif text-brand-text-primary mb-2">
                        Desbloqueie Todo o Potencial
                    </h2>
                    <p className="text-brand-text-secondary max-w-lg mx-auto">
                        Comece seu teste gratuito de 7 dias para remover todos os limites e obter acesso a ferramentas exclusivas de IA.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`bg-brand-surface p-6 rounded-lg border h-full flex flex-col relative ${plan.recommended ? 'border-brand-primary scale-105' : 'border-brand-secondary'}`}>
                            {plan.recommended && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">RECOMENDADO</div>
                            )}
                            <h3 className={`text-2xl font-bold font-serif ${plan.recommended ? 'text-brand-primary' : 'text-brand-text-primary'}`}>{plan.name}</h3>
                            <p className="my-4">
                                <span className="text-4xl font-bold">R${plan.price}</span>
                                <span className="text-brand-text-secondary">/mês</span>
                            </p>
                            <p className="text-sm text-brand-text-secondary mb-6 flex-grow">{plan.description}</p>
                            <ul className="space-y-3 text-brand-text-primary text-sm mb-8">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <CheckIcon className={`${plan.recommended ? 'text-brand-primary' : 'text-green-500'} w-5 h-5 flex-shrink-0 mt-0.5`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={() => handleUpgrade(plan.tier)} 
                                className={`w-full mt-auto font-bold py-3 rounded-lg transition-colors ${plan.recommended ? 'bg-brand-primary text-white hover:bg-opacity-90' : 'bg-brand-secondary text-white hover:bg-brand-primary'}`}
                            >
                                Começar Teste Gratuito
                            </button>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <p className="text-xs text-brand-text-secondary">Nenhum cartão de crédito necessário. Cancele a qualquer momento.</p>
                    <button onClick={onClose} className="mt-3 text-sm text-brand-text-secondary hover:text-white">
                        Talvez mais tarde
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UpgradeModal;