

import React, { useState } from 'react';
import { SparklesIcon, LightbulbIcon, GlobeAltIcon, ClipboardIcon, PencilIcon, NetworkIcon } from './Icons';
import { generateLandingPageIdea } from '../services/geminiService';

interface LandingPageProps {
    onStart: () => void;
}

const CheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

const QuoteIcon = ({ className = 'w-12 h-12' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className={className}>
      <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
    </svg>
);


const features = [
    { name: 'Geração de Histórias', icon: <SparklesIcon className="w-5 h-5"/>, image: 'https://picsum.photos/seed/feature1/600/400', description: 'Transforme uma simples ideia em um rascunho completo. Nossa IA cria um título, sinopse, personagens e capítulos iniciais para dar o pontapé inicial na sua criatividade.'},
    { name: 'Análise de Trama', icon: <LightbulbIcon className="w-5 h-5"/>, image: 'https://picsum.photos/seed/feature2/600/400', description: 'Aja como um editor experiente. A IA identifica furos de roteiro, inconsistências no enredo e repetições de palavras, ajudando você a polir sua narrativa.'},
    { name: 'Worldbuilding', icon: <GlobeAltIcon className="w-5 h-5"/>, image: 'https://picsum.photos/seed/feature3/600/400', description: 'Construa uma enciclopédia para seu universo. A IA lê sua história e sugere automaticamente entradas para personagens, lugares e itens, mantendo sua lore consistente.'},
    { name: 'Visualizador de Trama', icon: <NetworkIcon className="w-5 h-5"/>, image: 'https://picsum.photos/seed/feature4/600/400', description: 'Organize suas ideias visualmente. Crie cartões para cenas e pontos da trama, conecte-os para visualizar o fluxo da sua história e nunca perca o fio da meada.'},
];


const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    const [ideaPrompt, setIdeaPrompt] = useState('');
    const [generatedIdea, setGeneratedIdea] = useState<{title: string, synopsis: string} | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeFeatureTab, setActiveFeatureTab] = useState(features[0].name);

    const handleGenerateIdea = async () => {
        if (!ideaPrompt.trim()) return;
        setIsGenerating(true);
        setGeneratedIdea(null);
        try {
            const result = await generateLandingPageIdea(ideaPrompt);
            setGeneratedIdea(result);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-brand-background text-brand-text-primary font-sans">
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <PencilIcon className="w-8 h-8 text-brand-primary" />
                    <span className="font-bold text-xl">Escritor IA</span>
                </div>
                <button
                    onClick={onStart}
                    className="bg-brand-secondary text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-primary transition-colors text-sm"
                >
                    Entrar
                </button>
            </header>

            <main>
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center text-center p-4 pt-20 aurora-background">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight">
                        Sua Próxima Grande História Começa <span className="text-brand-primary">Aqui.</span>
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-brand-text-secondary max-w-3xl">
                        Nossa suíte de escrita com IA transforma sua inspiração em um manuscrito polido. Experimente agora:
                    </p>
                    <div className="mt-8 w-full max-w-2xl bg-brand-surface/50 border border-brand-secondary rounded-xl p-6 shadow-2xl">
                        <textarea
                            value={ideaPrompt}
                            onChange={(e) => setIdeaPrompt(e.target.value)}
                            placeholder="Ex: um detetive em um mundo ciberpunk investiga um crime impossível..."
                            className="w-full p-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder:text-brand-text-secondary/60 focus:ring-2 focus:ring-brand-primary outline-none transition"
                            rows={2}
                        />
                        <button
                            onClick={handleGenerateIdea}
                            disabled={isGenerating}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        >
                            {isGenerating ? 'Gerando...' : 'Gerar Ideia com IA'}
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        {isGenerating && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mt-4"></div>}
                        {generatedIdea && (
                            <div className="mt-6 text-left p-4 bg-brand-background rounded-lg border border-brand-primary/50 animate-[fadeIn_0.5s_ease-in-out]">
                                <h3 className="font-bold text-xl font-serif text-brand-primary">{generatedIdea.title}</h3>
                                <p className="mt-2 text-brand-text-secondary">{generatedIdea.synopsis}</p>
                            </div>
                        )}
                    </div>
                     <button
                        onClick={onStart}
                        className="mt-12 bg-transparent border-2 border-brand-primary text-brand-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-primary hover:text-white transition-colors"
                    >
                        Comece a Escrever Gratuitamente
                    </button>
                </section>

                {/* Features Section */}
                <section className="py-20 px-4 bg-brand-surface/30">
                    <div className="max-w-6xl mx-auto">
                         <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold font-serif">Ferramentas Projetadas para Autores</h2>
                            <p className="mt-3 text-brand-text-secondary max-w-2xl mx-auto">
                                Da primeira faísca de inspiração ao manuscrito final, temos tudo o que você precisa.
                            </p>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-8 items-center">
                            <div className="w-full lg:w-1/3 flex flex-col gap-2">
                                {features.map(feature => (
                                    <button 
                                        key={feature.name}
                                        onClick={() => setActiveFeatureTab(feature.name)}
                                        className={`p-4 rounded-lg text-left transition-all ${activeFeatureTab === feature.name ? 'bg-brand-primary/20 scale-105' : 'hover:bg-brand-surface'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-md ${activeFeatureTab === feature.name ? 'bg-brand-primary text-white' : 'bg-brand-secondary/50 text-brand-primary'}`}>{feature.icon}</div>
                                            <h3 className="font-bold text-brand-text-primary">{feature.name}</h3>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="w-full lg:w-2/3">
                                {features.map(feature => (
                                     <div key={feature.name} className={`transition-opacity duration-500 ${activeFeatureTab === feature.name ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                        <div className="group perspective">
                                          <img src={feature.image} alt={feature.name} className="rounded-xl shadow-2xl mb-4 interactive-3d-card" />
                                        </div>
                                        <p className="text-brand-text-secondary">{feature.description}</p>
                                     </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                
                 {/* Testimonials Section */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <QuoteIcon className="text-brand-primary/30 mx-auto" />
                        <p className="mt-4 text-2xl md:text-3xl font-serif italic text-brand-text-primary">
                            "Passar da ideia para o enredo visual com os cartões de trama acelerou meu processo de escrita em semanas. Uma ferramenta indispensável para qualquer escritor sério."
                        </p>
                        <p className="mt-6 font-semibold text-brand-text-secondary">- R. D. Gomes, Autor de Mistério</p>
                    </div>
                </section>
                
                {/* Final CTA */}
                <section className="py-20 px-4 bg-brand-surface/30 text-center">
                    <h2 className="text-4xl font-bold font-serif">Pronto para escrever sua obra-prima?</h2>
                    <p className="mt-3 text-brand-text-secondary max-w-xl mx-auto">Junte-se a milhares de autores que confiam no Escritor IA para dar vida às suas histórias.</p>
                     <button
                        onClick={onStart}
                        className="mt-8 bg-brand-primary text-white font-bold py-4 px-10 rounded-lg text-xl hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                        Começar Agora
                    </button>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;