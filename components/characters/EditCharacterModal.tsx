import React, { useState, useEffect } from 'react';
import type { Story, Character, Relationship } from '../../types';
import { useStory } from '../../context/StoryContext';
import { SparklesIcon, LinkIcon } from '../Icons';
import { generateCharacterAvatar, suggestCharacterRelationships } from '../../services/geminiService';
import Modal from '../common/Modal';

type ArtStyle = "Arte Digital" | "Fotorrealista" | "Anime/Mangá" | "Pintura a Óleo" | "Fantasia Sombria";

interface EditCharacterModalProps {
  character: Character;
  onClose: () => void;
  onSave: (updatedCharacter: Character) => void;
}

const EditCharacterModal: React.FC<EditCharacterModalProps> = ({ character, onClose, onSave }) => {
    const { activeStory } = useStory();
    const [editedChar, setEditedChar] = useState(character);
    const [artStyle, setArtStyle] = useState<ArtStyle>("Arte Digital");
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isSuggestingRels, setIsSuggestingRels] = useState(false);
    
    const [newRelCharacterId, setNewRelCharacterId] = useState('');
    const [newRelType, setNewRelType] = useState('Aliado');
    const [newRelDescription, setNewRelDescription] = useState('');

    useEffect(() => {
        setEditedChar(character);
    }, [character]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedChar(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateAvatar = async () => {
        if (!activeStory) return;
        setIsGeneratingAvatar(true);
        const result = await generateCharacterAvatar(editedChar.appearance, activeStory.genre, artStyle);
        if (result.success) {
            setEditedChar(prev => ({ ...prev, avatarUrl: result.url }));
        } else {
            setEditedChar(prev => ({ ...prev, avatarUrl: result.url })); // Also sets fallback URL
            if(result.error) {
               alert(result.error);
            }
        }
        setIsGeneratingAvatar(false);
    };
    
    const handleAddRelationship = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newRelCharacterId || !newRelType.trim() || !newRelDescription.trim()) {
            alert("Por favor, preencha todos os campos do relacionamento.");
            return;
        }
        const newRelationship: Relationship = {
            characterId: newRelCharacterId,
            type: newRelType,
            description: newRelDescription,
        };
        setEditedChar(prev => ({
            ...prev,
            relationships: [...prev.relationships, newRelationship]
        }));
        setNewRelCharacterId('');
        setNewRelType('Aliado');
        setNewRelDescription('');
    };

    const handleSuggestRelationships = async () => {
        if (!activeStory) return;
        setIsSuggestingRels(true);
        try {
            const suggested = await suggestCharacterRelationships(activeStory, editedChar.id);
            const existingRelIds = new Set(editedChar.relationships.map(r => r.characterId));
            const newSuggestions = suggested.filter(s => !existingRelIds.has(s.characterId));
            if(newSuggestions.length > 0) {
              setEditedChar(prev => ({
                ...prev,
                relationships: [...prev.relationships, ...newSuggestions]
              }));
            } else {
              alert("A IA não encontrou novos relacionamentos claros no texto.");
            }
        } catch(e) {
            alert((e as Error).message);
        } finally {
            setIsSuggestingRels(false);
        }
    };

    if (!activeStory) return null;
    const otherCharacters = activeStory.characters.filter(c => c.id !== character.id);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Estúdio de Personagem: ${character.name}`} className="max-w-6xl max-h-[90vh]">
            <header className="p-4 border-b border-brand-secondary flex-shrink-0">
                <h2 id="modal-title" className="text-2xl font-bold font-serif text-brand-text-primary">Estúdio de Personagem: {character.name}</h2>
                <p className="text-sm text-brand-text-secondary">Refine a aparência, arco narrativo, relacionamentos e mais.</p>
            </header>
            <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
                <div className="lg:col-span-1 flex flex-col items-center">
                     <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-brand-secondary mb-4">
                        <img src={editedChar.avatarUrl} alt={editedChar.name} className="w-full h-full object-cover"/>
                        {isGeneratingAvatar && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                    <div className="w-full max-w-xs">
                       <label htmlFor="artStyle" className="block text-sm font-medium text-brand-text-secondary mb-1">Estilo de Arte</label>
                        <select
                            id="artStyle"
                            value={artStyle}
                            onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                            className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                        >
                            <option>Arte Digital</option>
                            <option>Fotorrealista</option>
                            <option>Anime/Mangá</option>
                            <option>Pintura a Óleo</option>
                            <option>Fantasia Sombria</option>
                        </select>
                    </div>
                    <button onClick={handleGenerateAvatar} disabled={isGeneratingAvatar} className="mt-4 w-full max-w-xs flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                        {isGeneratingAvatar ? 'Gerando...' : 'Gerar Novo Avatar'} <SparklesIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-1">Nome</label>
                        <input type="text" name="name" id="name" value={editedChar.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none" />
                    </div>
                     <div>
                        <label htmlFor="appearance" className="block text-sm font-medium text-brand-text-secondary mb-1">Aparência Física</label>
                        <textarea name="appearance" id="appearance" value={editedChar.appearance} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none font-serif" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-text-secondary mb-1">Descrição (Personalidade e Motivações)</label>
                        <textarea name="description" id="description" value={editedChar.description} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none font-serif" />
                    </div>
                     <div>
                        <label htmlFor="role" className="block text-sm font-medium text-brand-text-secondary mb-1">Papel na História</label>
                        <input type="text" name="role" id="role" value={editedChar.role} onChange={handleInputChange} className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none" />
                    </div>
                     <div>
                        <label htmlFor="narrativeArc" className="block text-sm font-medium text-brand-text-secondary mb-1">Arco Narrativo</label>
                        <textarea name="narrativeArc" id="narrativeArc" value={editedChar.narrativeArc} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none font-serif" placeholder="Descreva a jornada do personagem: como ele começa, se transforma e termina a história." />
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-4 bg-brand-background/50 p-4 rounded-lg border border-brand-secondary">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-brand-text-primary">Relacionamentos</h3>
                        <button onClick={handleSuggestRelationships} disabled={isSuggestingRels} className="flex items-center gap-1 text-xs bg-brand-secondary p-2 rounded-md hover:bg-brand-primary">
                            {isSuggestingRels ? 'Analisando...' : 'Sugerir com IA'} <SparklesIcon className="w-4 h-4"/>
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {editedChar.relationships.map((rel, index) => (
                          <div key={index} className="bg-brand-surface p-2 rounded-md">
                              <p className="text-sm font-semibold">{otherCharacters.find(c=>c.id === rel.characterId)?.name} - <span className="font-normal italic">{rel.type}</span></p>
                              <p className="text-xs text-brand-text-secondary">{rel.description}</p>
                          </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddRelationship} className="border-t border-brand-secondary pt-3 space-y-2">
                         <select value={newRelCharacterId} onChange={(e) => setNewRelCharacterId(e.target.value)} className="w-full px-3 py-2 text-sm bg-brand-surface border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none">
                            <option value="">Selecione um personagem...</option>
                            {otherCharacters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="text" value={newRelType} onChange={(e) => setNewRelType(e.target.value)} placeholder="Tipo de Relação (ex: Aliado)" className="w-full px-3 py-2 text-sm bg-brand-surface border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none" />
                        <input type="text" value={newRelDescription} onChange={(e) => setNewRelDescription(e.target.value)} placeholder="Descrição do relacionamento" className="w-full px-3 py-2 text-sm bg-brand-surface border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none" />
                        <button type="submit" className="w-full text-sm bg-brand-secondary p-2 rounded-md hover:bg-brand-primary flex items-center justify-center gap-2"><LinkIcon className="w-4 h-4" /> Adicionar Relação</button>
                    </form>
                </div>
            </div>
            <footer className="p-4 border-t border-brand-secondary flex-shrink-0 flex justify-end gap-2">
                <button onClick={onClose} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80">Cancelar</button>
                <button onClick={() => onSave(editedChar)} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">Salvar Alterações</button>
            </footer>
        </Modal>
    );
};

export default EditCharacterModal;