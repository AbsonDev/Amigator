import React, { useState, useEffect } from 'react';
import type { PlotCard } from '../../types';
import { useStory } from '../../context/StoryContext';
import Modal from '../common/Modal';

interface EditPlotCardModalProps {
    card?: PlotCard;
    onSave: (cardData: Omit<PlotCard, 'id' | 'position'>, id?: string) => void;
    onClose: () => void;
}

const EditPlotCardModal: React.FC<EditPlotCardModalProps> = ({ card, onSave, onClose }) => {
    const { activeStory } = useStory();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [chapterId, setChapterId] = useState<string | undefined>(undefined);
    const [characterIds, setCharacterIds] = useState<string[]>([]);

    useEffect(() => {
        if (card) {
            setTitle(card.title);
            setDescription(card.description);
            setChapterId(card.chapterId);
            setCharacterIds(card.characterIds || []);
        }
    }, [card]);

    const handleSave = () => {
        if (!title.trim()) {
            alert("O título é obrigatório.");
            return;
        }
        onSave({ title, description, chapterId, characterIds }, card?.id);
    };

    const handleCharacterToggle = (charId: string) => {
        setCharacterIds(prev =>
            prev.includes(charId) ? prev.filter(id => id !== charId) : [...prev, charId]
        );
    };

    if (!activeStory) return null;
    
    const modalTitle = card ? 'Editar Cartão da Trama' : 'Adicionar Novo Cartão da Trama';

    return (
        <Modal isOpen={true} onClose={onClose} title={modalTitle} className="max-w-xl">
            <div className="p-6">
                <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">{modalTitle}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-brand-text-secondary mb-1">Título do Cartão</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                            placeholder="Ex: O Encontro na Floresta"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-text-secondary mb-1">Descrição</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                            placeholder="Descreva o que acontece nesta cena ou ponto da trama."
                        />
                    </div>
                    <div>
                        <label htmlFor="chapterId" className="block text-sm font-medium text-brand-text-secondary mb-1">Capítulo Associado (Opcional)</label>
                        <select
                            id="chapterId"
                            value={chapterId || ''}
                            onChange={(e) => setChapterId(e.target.value || undefined)}
                            className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                        >
                            <option value="">Nenhum</option>
                            {activeStory.chapters.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">Personagens Envolvidos (Opcional)</label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto bg-brand-background p-2 rounded-lg border border-brand-secondary">
                            {activeStory.characters.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handleCharacterToggle(c.id)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        characterIds.includes(c.id) ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-text-primary'
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="w-full bg-brand-secondary text-brand-text-primary font-bold py-2 rounded-lg hover:bg-opacity-80 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                        Salvar Cartão
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditPlotCardModal;