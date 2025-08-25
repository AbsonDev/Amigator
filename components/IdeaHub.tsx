
import React, { useState } from 'react';
import type { Story } from '../types';
import { generateInspiration } from '../services/geminiService';
import { LightbulbIcon, SparklesIcon, UsersIcon, ChatBubbleLeftRightIcon } from './Icons';

interface IdeaHubProps {
  story: Story;
  onClose: () => void;
}

type IdeaType = 'what-if' | 'plot-twist' | 'name' | 'dialogue';

const ideaConfig = {
    'what-if': { icon: <LightbulbIcon className="w-6 h-6" />, title: 'Cenários "E se...?"', description: 'Gere cenários hipotéticos para desafiar sua trama.', contextLabel: 'Forneça um breve resumo da sua história atual.' },
    'plot-twist': { icon: <SparklesIcon className="w-6 h-6" />, title: 'Gerador de Reviravoltas', description: 'Crie reviravoltas inesperadas para surpreender seus leitores.', contextLabel: 'Descreva o último evento importante da sua história.' },
    'name': { icon: <UsersIcon className="w-6 h-6" />, title: 'Gerador de Nomes', description: 'Encontre nomes para personagens, lugares e muito mais.', contextLabel: 'Descreva o gênero e o tom da sua história (ex: Fantasia Sombria, Ficção Científica Cômica).'},
    'dialogue': { icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />, title: 'Gerador de Diálogos', description: 'Esboce diálogos para dar vida a uma cena.', contextLabel: 'Descreva a cena e os personagens envolvidos (ex: "Dois guardas entediados em uma noite fria").' },
};

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>;

const IdeaHub: React.FC<IdeaHubProps> = ({ story, onClose }) => {
    const [activeIdea, setActiveIdea] = useState<IdeaType>('what-if');
    const [context, setContext] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!context.trim()) {
            alert("Por favor, forneça o contexto.");
            return;
        }
        setIsLoading(true);
        setResult('');
        try {
            const inspiration = await generateInspiration(activeIdea, context);
            setResult(inspiration);
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const currentConfig = ideaConfig[activeIdea];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-brand-secondary">
                    <h2 className="text-2xl font-bold font-serif text-brand-text-primary">Central de Ideias</h2>
                    <p className="text-sm text-brand-text-secondary">Sua fonte de inspiração para superar o bloqueio criativo.</p>
                </header>
                <div className="flex flex-grow overflow-hidden">
                    <aside className="w-1/3 p-4 border-r border-brand-secondary overflow-y-auto">
                        <nav className="flex flex-col gap-2">
                           {Object.entries(ideaConfig).map(([key, config]) => (
                                <button key={key} onClick={() => { setActiveIdea(key as IdeaType); setContext(''); setResult(''); }} className={`p-3 rounded-lg text-left transition-colors ${activeIdea === key ? 'bg-brand-primary text-white' : 'hover:bg-brand-secondary/50'}`}>
                                    <div className="flex items-center gap-3">
                                        {config.icon}
                                        <p className="font-semibold">{config.title}</p>
                                    </div>
                                    <p className="text-xs opacity-80 mt-1 pl-9">{config.description}</p>
                                </button>
                           ))}
                        </nav>
                    </aside>
                    <main className="w-2/3 p-6 flex flex-col">
                        <h3 className="text-xl font-bold text-brand-text-primary">{currentConfig.title}</h3>
                        <p className="text-brand-text-secondary mt-1 mb-4">{currentConfig.contextLabel}</p>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            rows={4}
                            placeholder="Forneça o contexto aqui..."
                            className="w-full p-2 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                        <button onClick={handleGenerate} disabled={isLoading} className="mt-4 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                           {isLoading ? 'Gerando...' : 'Gerar Ideia'}
                        </button>
                        <div className="mt-6 flex-grow bg-brand-background rounded-lg border border-brand-secondary p-4 overflow-y-auto">
                            {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinnerSmall /></div>}
                            {result && <p className="text-brand-text-secondary whitespace-pre-wrap font-serif">{result}</p>}
                            {!result && !isLoading && <p className="text-center text-brand-text-secondary/50">Sua inspiração aparecerá aqui...</p>}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default IdeaHub;
