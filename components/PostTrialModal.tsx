
import React from 'react';
import Modal from './common/Modal';
import { SparklesIcon, LockClosedIcon } from './Icons';

interface PostTrialModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const lostFeatures = [
    'Livros ilimitados',
    'Análise de Continuidade da Trama',
    'Análise de repetição de texto',
    'Exportação em PDF e DOCX',
    'Salvamento automático e histórico de versões'
];

const PostTrialModal: React.FC<PostTrialModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Seu teste do plano Amador terminou" className="max-w-xl">
      <div className="p-8 text-center">
        <LockClosedIcon className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
        <h2 className="text-3xl font-bold font-serif text-brand-text-primary mb-2">
          Seu teste do plano Amador terminou
        </h2>
        <p className="text-brand-text-secondary mb-6">
          Você foi revertido para o plano Gratuito. Recupere o acesso às ferramentas poderosas que você estava usando:
        </p>
        
        <div className="text-left bg-brand-background p-4 rounded-lg border border-brand-secondary mb-6">
            <ul className="space-y-2">
                {lostFeatures.map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-brand-text-secondary">
                        <SparklesIcon className="w-4 h-4 text-brand-primary flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div className="bg-brand-primary/10 p-4 rounded-lg border border-brand-primary">
            <h3 className="font-bold text-brand-primary">OFERTA POR TEMPO LIMITADO</h3>
            <p className="text-brand-text-primary">
              Faça upgrade nas próximas 24 horas e ganhe <span className="font-bold">20% de desconto</span> no seu primeiro mês!
            </p>
        </div>

        <div className="mt-6">
          <button 
            onClick={onUpgrade} 
            className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105"
          >
            Fazer Upgrade Agora e Resgatar Desconto
          </button>
          <button onClick={onClose} className="mt-3 text-sm text-brand-text-secondary hover:text-white">
            Continuar com o plano Gratuito
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PostTrialModal;
