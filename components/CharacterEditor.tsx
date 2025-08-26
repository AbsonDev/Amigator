import React, { useState } from 'react';
import type { Character } from '../types';
import { useStory } from '../context/StoryContext';
import EditCharacterModal from './characters/EditCharacterModal';

const CharacterCard: React.FC<{ character: Character; onEdit: () => void; }> = ({ character, onEdit }) => {
    return (
        <button onClick={onEdit} className="text-left bg-brand-surface rounded-lg border border-brand-secondary overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-2xl hover:border-brand-primary group">
            <div className="relative w-full h-48">
                <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover"/>
            </div>
            <div className="p-4">
                <span className="inline-block bg-brand-primary/20 text-brand-primary text-xs font-semibold px-2 py-1 rounded-full mb-2">{character.role}</span>
                <h3 className="text-xl font-bold text-brand-text-primary">{character.name}</h3>
                <p className="text-sm text-brand-text-secondary mt-1 font-serif h-12 overflow-y-auto">
                    {character.appearance}
                </p>
            </div>
        </button>
    );
};

const CharacterEditor: React.FC = () => {
    const { activeStory, updateActiveStory } = useStory();
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

    const handleSaveCharacter = (updatedCharacter: Character) => {
        updateActiveStory(story => ({
            ...story,
            characters: story.characters.map(c => 
                c.id === updatedCharacter.id ? updatedCharacter : c
            )
        }));
        setEditingCharacter(null);
    };
  
    if (!activeStory) return null;

    return (
        <>
            <div className="p-4 sm:p-6 md:p-8">
                <h1 className="text-3xl font-bold font-serif text-brand-text-primary mb-6">Elenco de Personagens</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {activeStory.characters.map(character => (
                        <CharacterCard 
                            key={character.id} 
                            character={character}
                            onEdit={() => setEditingCharacter(character)}
                        />
                    ))}
                </div>
            </div>
            {editingCharacter && (
                <EditCharacterModal 
                    character={editingCharacter}
                    onClose={() => setEditingCharacter(null)}
                    onSave={handleSaveCharacter}
                />
            )}
        </>
    );
}

export default CharacterEditor;
