import React, { useState } from 'react';
import Modal from '../common/Modal';
import { modifyText } from '../../services/geminiService';

interface ModifyTextModalProps {
  selectedText: string;
  fullContext: string;
  onClose: () => void;
  onReplaceText: (newText: string) => void;
}

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>;

const ModifyTextModal: React.FC<ModifyTextModalProps> = ({ selectedText, fullContext, onClose, onReplaceText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modifiedText, setModifiedText] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');

  const handleModify = async (instruction: string) => {
    if (!instruction.trim()) {
      alert("Por favor, forneça uma instrução.");
      return;
    }
    setIsLoading(true);
    setModifiedText('');
    try {
      const result = await modifyText(selectedText, fullContext, instruction);
      setModifiedText(result);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} title="Modificar Texto Selecionado" className="max-w-3xl">
      <div className="p-6 font-sans">
        <h2 id="modal-title" className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Modificar Texto Selecionado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-brand-background p-3 rounded-lg border border-brand-secondary">
                <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">Original</h3>
                <p className="text-sm font-serif max-h-48 overflow-y-auto p-1">{selectedText}</p>
            </div>
             <div className="bg-brand-background p-3 rounded-lg border border-brand-secondary flex flex-col">
                <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">Sugestão da IA</h3>
                {isLoading ? <div className="flex-grow flex justify-center items-center h-full"><LoadingSpinnerSmall/></div> : 
                <p className="text-sm font-serif max-h-48 overflow-y-auto flex-grow p-1">{modifiedText || "Aguardando comando..."}</p>}
            </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 my-4">
          <span className="text-sm text-brand-text-secondary">Ações rápidas:</span>
          <button onClick={() => handleModify('Reescreva o seguinte trecho para melhorar a clareza e o fluxo.')} disabled={isLoading} className="text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors">Reescrever</button>
          <button onClick={() => handleModify('Expanda o seguinte trecho, adicionando mais detalhes descritivos.')} disabled={isLoading} className="text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors">Expandir</button>
          <button onClick={() => handleModify('Encurte o seguinte trecho, tornando-o mais conciso.')} disabled={isLoading} className="text-sm bg-brand-secondary px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-colors">Encurtar</button>
        </div>
        <div className="flex items-center gap-2">
            <input 
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Ou dê uma instrução específica (ex: 'Deixe mais sombrio')"
                className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary outline-none"
            />
            <button onClick={() => handleModify(customInstruction)} disabled={isLoading || !customInstruction} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50">Gerar</button>
        </div>
        <div className="flex gap-2 mt-4">
            <button onClick={onClose} className="w-full bg-brand-secondary text-brand-text-primary font-bold py-2 rounded-lg hover:bg-opacity-80">Cancelar</button>
            <button onClick={() => onReplaceText(modifiedText)} disabled={!modifiedText || isLoading} className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50">Substituir Texto</button>
        </div>
      </div>
    </Modal>
  );
};

export default ModifyTextModal;