
import React, { useState, useRef } from 'react';
import { SparklesIcon, LightbulbIcon } from './Icons';
import type { Author } from '../types';
import { generateStoryIdeas } from '../services/geminiService';
import useClickSpark from '../hooks/useClickSpark';

interface StorySetupProps {
  author: Author;
  onStoryCreate: (genre: string, theme: string, prompt: string) => void;
}

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary mx-auto"></div>;

const suggestedGenres = ['Fantasia', 'Ficção Científica', 'Mistério', 'Romance', 'Suspense', 'Aventura', 'Terror'];

export const StorySetup: React.FC<StorySetupProps> = ({ author, onStoryCreate }) => {
    const [genre, setGenre] = useState('Fantasia');
    const [theme, setTheme] = useState('');
    const [prompt, setPrompt] = useState('');
    const [themes, setThemes] = useState<string[]>([]);
    const [startingPoints, setStartingPoints] = useState<string[]>([]);
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
    const sparkButtonRef = useRef<HTMLButtonElement>(null);
    useClickSpark(sparkButtonRef);

    const handleGenerateIdeas = async () => {
        if (!genre) return;
        setIsLoadingIdeas(true);
        try {
            const ideas = await generateStoryIdeas(genre);
            setThemes(ideas.themes);
            setStartingPoints(ideas.startingPoints);
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setIsLoadingIdeas(false);
        }
    };

    const handleCreate = () => {
        if (!genre || !theme || !prompt) {
            alert("Por favor, preencha todos os campos para criar sua história.");
            return;
        }
        onStoryCreate(genre, theme, prompt);
    };

    return (
        <div className="min-h-screen bg-brand-background text-brand-text-primary flex items-center justify-center p-4 aurora-background">
            <div className="w-full max-w-4xl bg-brand-surface p-8 rounded-xl border border-brand-secondary shadow-2xl animate-fadeInUp space-y-8">
                <div>
                    <h1 className="text-4xl font-bold font-serif text-center">Vamos Começar uma Nova História</h1>
                    <p className="text-brand-text-secondary text-center mt-2">Defina os pilares da sua narrativa e deixe a IA tecer o começo.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Core Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="genre" className="block text-sm font-medium text-brand-text-secondary mb-2">1. Escolha um Gênero</label>
                            <select
                                id="genre"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                className="w-full px-4 py-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            >
                                {suggestedGenres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-brand-text-secondary mb-2">2. Defina o Tema Central</label>
                            <input
                                id="theme"
                                type="text"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                placeholder="Ex: A luta contra a tirania, amor proibido, a busca por redenção"
                                className="w-full px-4 py-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-brand-text-secondary mb-2">3. Dê uma Ideia Inicial</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                placeholder="Ex: Um jovem ferreiro descobre uma espada antiga que fala com ele, revelando um segredo que pode derrubar o império."
                                className="w-full px-4 py-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Column: Idea Generator */}
                    <div className="bg-brand-background/50 p-6 rounded-lg border border-brand-secondary">
                        <h3 className="font-bold text-lg flex items-center gap-2"><LightbulbIcon className="w-6 h-6 text-yellow-400" /> Precisa de inspiração?</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 mb-4">Gere temas e pontos de partida com base no gênero que você escolheu.</p>
                        <button onClick={handleGenerateIdeas} disabled={isLoadingIdeas || !genre} className="w-full flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all disabled:opacity-50">
                            {isLoadingIdeas ? <LoadingSpinnerSmall /> : <SparklesIcon className="w-5 h-5" />} Gerar Ideias
                        </button>
                        {(themes.length > 0 || startingPoints.length > 0) && (
                            <div className="mt-4 space-y-3 text-sm animate-fadeInUp">
                                <div>
                                    <h4 className="font-semibold text-brand-text-primary mb-1">Temas Sugeridos:</h4>
                                    <ul className="list-disc list-inside text-brand-text-secondary space-y-1">
                                        {themes.map((t, i) => <li key={i} className="cursor-pointer hover:text-brand-primary" onClick={() => setTheme(t)}>{t}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-brand-text-primary mb-1">Pontos de Partida Sugeridos:</h4>
                                    <ul className="list-disc list-inside text-brand-text-secondary space-y-1">
                                        {startingPoints.map((p, i) => <li key={i} className="cursor-pointer hover:text-brand-primary" onClick={() => setPrompt(p)}>{p}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        ref={sparkButtonRef}
                        onClick={handleCreate}
                        className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                        <SparklesIcon className="w-6 h-6" />
                        Criar História com IA
                    </button>
                </div>
            </div>
        </div>
    );
};
