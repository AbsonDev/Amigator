
import React, { useState } from 'react';
import { SparklesIcon } from './Icons';
import type { Author } from '../types';

interface StorySetupProps {
  author: Author;
  onStoryCreate: (genre: string, theme: string, prompt: string) => void;
}

const StorySetup: React.FC<StorySetupProps> = ({ author, onStoryCreate }) => {
  const [genre, setGenre] = useState('Fantasia');
  const [theme, setTheme] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim() && userPrompt.trim()) {
      onStoryCreate(genre, theme, userPrompt);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background text-brand-text-primary p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif">Olá, {author.name}!</h1>
          <p className="text-brand-text-secondary mt-2">Vamos criar o rascunho da sua próxima obra-prima. Defina os parâmetros abaixo.</p>
        </div>
        <div className="bg-brand-surface p-8 rounded-xl border border-brand-secondary">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-brand-text-secondary mb-2">Gênero Literário</label>
              <select
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
              >
                <option>Fantasia</option>
                <option>Ficção Científica</option>
                <option>Mistério</option>
                <option>Romance</option>
                <option>Suspense</option>
                <option>Aventura</option>
              </select>
            </div>
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-brand-text-secondary mb-2">Tema Principal</label>
              <input
                id="theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Uma busca por um artefato perdido, a ascensão e queda de um império"
                className="w-full px-4 py-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="userPrompt" className="block text-sm font-medium text-brand-text-secondary mb-2">Detalhes da História</label>
              <textarea
                id="userPrompt"
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Descreva a ideia central da sua história, um personagem chave, ou uma cena de abertura. Quanto mais detalhes, melhor o resultado."
                className="w-full px-4 py-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={!theme.trim() || !userPrompt.trim()}
            >
              <SparklesIcon className="w-5 h-5" />
              Gerar Rascunho com IA
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StorySetup;
