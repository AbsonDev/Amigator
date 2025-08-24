
import React from 'react';
import type { Story } from '../types';

interface CharacterEditorProps {
    story: Story;
}

const CharacterCard: React.FC<{ character: Story['characters'][0] }> = ({ character }) => {
    return (
        <div className="bg-brand-surface rounded-lg border border-brand-secondary overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-2xl hover:border-brand-primary">
            <img src={character.avatarUrl} alt={character.name} className="w-full h-48 object-cover"/>
            <div className="p-4">
                <span className="inline-block bg-brand-primary/20 text-brand-primary text-xs font-semibold px-2 py-1 rounded-full mb-2">{character.role}</span>
                <h3 className="text-xl font-bold text-brand-text-primary">{character.name}</h3>
                <p className="text-sm text-brand-text-secondary mt-1 font-serif h-20 overflow-y-auto">
                    {character.description}
                </p>
            </div>
        </div>
    );
};


const CharacterEditor: React.FC<CharacterEditorProps> = ({ story }) => {
  // A modal would be used here to edit character details.
  // For simplicity, we are just displaying them.
  return (
    <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl font-bold font-serif text-brand-text-primary mb-6">Elenco de Personagens</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {story.characters.map(character => (
                <CharacterCard key={character.id} character={character} />
            ))}
        </div>
    </div>
  );
}

export default CharacterEditor;