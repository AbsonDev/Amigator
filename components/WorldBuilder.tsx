import React, { useState } from 'react';
import type { Story, WorldEntry, WorldEntryCategory } from '../types';
import { analyzeTextForWorldEntries } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface WorldBuilderProps {
  story: Story;
  setStory: (updatedStory: Story) => void;
  logAction: (actor: 'user' | 'agent', action: string) => void;
}

const categoryStyles: Record<WorldEntryCategory, string> = {
    'Personagem': 'bg-blue-500/20 text-blue-300',
    'Lugar': 'bg-green-500/20 text-green-300',
    'Item': 'bg-yellow-500/20 text-yellow-300',
    'Organização': 'bg-purple-500/20 text-purple-300',
    'Evento': 'bg-red-500/20 text-red-300',
};

const WorldBuilder: React.FC<WorldBuilderProps> = ({ story, setStory, logAction }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Omit<WorldEntry, 'id'>[]>([]);
  const [newEntry, setNewEntry] = useState<Omit<WorldEntry, 'id'>>({
    name: '',
    category: 'Lugar',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = () => {
    if (!newEntry.name.trim() || !newEntry.description.trim()) {
        alert('Nome e descrição são obrigatórios.');
        return;
    }
    const entryToAdd: WorldEntry = { ...newEntry, id: `world-${Date.now()}` };
    const updatedStory = { ...story, world: [...story.world, entryToAdd] };
    setStory(updatedStory);
    logAction('user', `Adicionou o verbete '${entryToAdd.name}' ao Mundo.`);
    setNewEntry({ name: '', category: 'Lugar', description: '' });
    setIsAdding(false);
  };
  
  const handleSuggestEntries = async () => {
    setIsAnalyzing(true);
    setSuggestions([]);
    logAction('agent', 'Analisou o texto para sugerir verbetes do mundo.');
    try {
        const fullText = story.chapters.map(c => c.content).join('\n\n');
        const results = await analyzeTextForWorldEntries(fullText);
        // Filter out entries that already exist
        const existingNames = new Set(story.world.map(e => e.name.toLowerCase()));
        const newSuggestions = results.filter(s => !existingNames.has(s.name.toLowerCase()));
        setSuggestions(newSuggestions);
    } catch(e) {
        alert((e as Error).message);
    } finally {
        setIsAnalyzing(false);
    }
  };
  
  const handleAddSuggestion = (suggestion: Omit<WorldEntry, 'id'>) => {
    const entryToAdd: WorldEntry = { ...suggestion, id: `world-${Date.now()}` };
    const updatedStory = { ...story, world: [...story.world, entryToAdd] };
    setStory(updatedStory);
    logAction('user', `Adicionou o verbete sugerido '${entryToAdd.name}' ao Mundo.`);
    setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Mundo da História</h1>
        <div className="flex gap-2">
            <button onClick={handleSuggestEntries} disabled={isAnalyzing} className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all">
                {isAnalyzing ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <SparklesIcon className="w-5 h-5" />}
                Sugerir Entradas com IA
            </button>
            <button onClick={() => setIsAdding(prev => !prev)} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                {isAdding ? 'Cancelar' : 'Adicionar Verbete'}
            </button>
        </div>
      </div>
      
      {isAdding && (
          <div className="bg-brand-surface p-4 rounded-lg border border-brand-secondary mb-6 space-y-4">
              <input type="text" name="name" value={newEntry.name} onChange={handleInputChange} placeholder="Nome do Verbete" className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none" />
              <select name="category" value={newEntry.category} onChange={handleInputChange} className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none">
                  {Object.keys(categoryStyles).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <textarea name="description" value={newEntry.description} onChange={handleInputChange} placeholder="Descrição..." rows={3} className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none" />
              <button onClick={handleAddEntry} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700">Salvar Verbete</button>
          </div>
      )}

      {isAnalyzing && <p className="text-center text-brand-text-secondary py-4">IA está lendo sua história para encontrar verbetes...</p>}
      
      {suggestions.length > 0 && (
          <div className="mb-8">
              <h2 className="text-xl font-bold font-serif mb-4">Sugestões da IA</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((s, i) => (
                    <div key={i} className="bg-brand-surface p-3 rounded-lg border border-brand-secondary">
                        <p className="font-bold">{s.name} <span className={`text-xs px-2 py-0.5 rounded-full ${categoryStyles[s.category]}`}>{s.category}</span></p>
                        <p className="text-sm text-brand-text-secondary">{s.description}</p>
                        <div className="text-right mt-2">
                            <button onClick={() => handleAddSuggestion(s)} className="text-xs bg-brand-primary text-white px-3 py-1 rounded-md hover:bg-opacity-80">Adicionar</button>
                        </div>
                    </div>
                ))}
              </div>
          </div>
      )}

      {story.world.length > 0 ? (
        <div className="space-y-4">
          {story.world.map(entry => (
            <div key={entry.id} className="bg-brand-surface p-4 rounded-lg border border-brand-secondary">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-brand-text-primary text-lg">{entry.name}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryStyles[entry.category]}`}>{entry.category}</span>
              </div>
              <p className="text-sm text-brand-text-secondary mt-1 font-serif">{entry.description}</p>
            </div>
          ))}
        </div>
      ) : (
          !isAnalyzing && suggestions.length === 0 && <p className="text-center text-brand-text-secondary py-10">Sua enciclopédia do mundo está vazia.</p>
      )}

    </div>
  );
};

export default WorldBuilder;