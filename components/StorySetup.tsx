
import React, { useState } from 'react';
import { SparklesIcon, LightbulbIcon } from './Icons';
import type { Author } from '../types';
import { generateStoryIdeas } from '../services/geminiService';

interface StorySetupProps {
  author: Author;
  onStoryCreate: (genre: string, theme: string, prompt: string) => void;
}

const IdeaButton: React.FC<{ onClick: () => void, children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-3 bg-brand-surface rounded-lg border border-brand-secondary hover:border-brand-primary hover:bg-brand-primary/10 transition-all text-sm font-serif"
    >
        {children}
    </button>
);

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary mx-auto"></div>;

const suggestedGenres = ['Fantasia', 'Ficção Científica', 'Mistério', 'Romance', 'Suspense', 'Aventura', 'Terror', 'Comédia'];

const StorySetup: React.FC<StorySetupProps> = ({ author, onStoryCreate }) => {
  const [genres, setGenres] = useState<string[]>(['Fantasia']);
  const [genreInput, setGenreInput] = useState('');
  const [theme, setTheme] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [ideas, setIdeas] = useState<{ themes: string[]; startingPoints: string[] } | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const handleAddGenre = (genreToAdd: string) => {
    const formattedGenre = genreToAdd.trim();
    if (formattedGenre && !genres.some(g => g.toLowerCase() === formattedGenre.toLowerCase())) {
        setGenres([...genres, formattedGenre]);
    }
  };
  
  const handleGenreInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        handleAddGenre(genreInput);
        setGenreInput('');
    }
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setGenres(genres.filter(g => g !== genreToRemove));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim() && userPrompt.trim() && genres.length > 0) {
      onStoryCreate(genres.join(', '), theme, userPrompt);
    }
  };
  
  const handleGenerateIdeas = async () => {
    if (genres.length === 0) {
        alert("Por favor, adicione pelo menos um gênero para gerar ideias.");
        return;
    }
    setIsGeneratingIdeas(true);
    setIdeas(null);
    try {
        const generatedIdeas = await generateStoryIdeas(genres.join(', '));
        setIdeas(generatedIdeas);
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setIsGeneratingIdeas(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-background text-brand-text-primary p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif">Olá, {author.name}!</h1>
          <p className="text-brand-text-secondary mt-2">Vamos criar o rascunho da sua próxima obra-prima. Defina os parâmetros abaixo.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            {/* Form Column */}
            <div className="md:col-span-3 bg-brand-surface p-8 rounded-xl border border-brand-secondary">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-brand-text-secondary mb-2">Gênero Literário</label>
                         <div className="flex flex-wrap items-center gap-2 p-2 bg-brand-background border border-brand-secondary rounded-lg focus-within:ring-2 focus-within:ring-brand-primary">
                            {genres.map((g, index) => (
                                <div key={index} className="flex items-center gap-1.5 bg-brand-primary text-white text-sm font-semibold px-2 py-1 rounded-md">
                                    <span>{g}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveGenre(g)}
                                        className="font-bold text-lg leading-none hover:text-red-300"
                                        aria-label={`Remover ${g}`}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <input
                                id="genre"
                                type="text"
                                value={genreInput}
                                onChange={(e) => setGenreInput(e.target.value)}
                                onKeyDown={handleGenreInputKeyDown}
                                placeholder="Adicionar gênero..."
                                className="flex-grow bg-transparent outline-none p-1 text-brand-text-primary"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {suggestedGenres.filter(sg => !genres.includes(sg)).map(sg => (
                                <button
                                    key={sg}
                                    type="button"
                                    onClick={() => { handleAddGenre(sg); setIdeas(null); }}
                                    className="text-xs text-brand-text-secondary bg-brand-secondary/50 px-2 py-1 rounded-md hover:bg-brand-primary hover:text-white transition-colors"
                                >
                                    + {sg}
                                </button>
                            ))}
                        </div>
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
                        disabled={!theme.trim() || !userPrompt.trim() || genres.length === 0}
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Gerar Rascunho com IA
                    </button>
                </form>
            </div>
            {/* Inspiration Column */}
            <div className="md:col-span-2 bg-brand-background/50 p-6 rounded-xl border border-brand-secondary/50">
                <div className="flex items-center gap-3 mb-4">
                    <LightbulbIcon className="w-6 h-6 text-yellow-400"/>
                    <h3 className="text-lg font-bold">Painel de Inspiração</h3>
                </div>
                <p className="text-sm text-brand-text-secondary mb-4">
                    Sem ideias? Selecione um gênero e clique abaixo para que a IA sugira alguns pontos de partida.
                </p>
                <button
                    onClick={handleGenerateIdeas}
                    disabled={isGeneratingIdeas || genres.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-brand-secondary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-brand-primary transition-colors disabled:opacity-50"
                >
                    {isGeneratingIdeas ? 'Gerando...' : 'Gerar Ideias'}
                </button>
                
                {isGeneratingIdeas && <div className="mt-6"><LoadingSpinnerSmall /></div>}

                {ideas && (
                    <div className="mt-6 space-y-6">
                        <div>
                            <h4 className="font-semibold text-brand-text-primary mb-2">Temas Sugeridos</h4>
                            <div className="space-y-2">
                                {ideas.themes.map((idea, i) => (
                                    <IdeaButton key={i} onClick={() => setTheme(idea)}>{idea}</IdeaButton>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-brand-text-primary mb-2">Pontos de Partida</h4>
                             <div className="space-y-2">
                                {ideas.startingPoints.map((idea, i) => (
                                     <IdeaButton key={i} onClick={() => setUserPrompt(idea)}>{idea}</IdeaButton>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StorySetup;
