
import React from 'react';
import { SparklesIcon, LightbulbIcon, GlobeAltIcon, ClipboardIcon, PencilIcon } from './Icons';

interface LandingPageProps {
    onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-brand-surface/50 p-6 rounded-lg border border-brand-secondary text-center transform transition-transform hover:-translate-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-lg text-brand-text-primary mb-2">{title}</h3>
        <p className="text-sm text-brand-text-secondary">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="bg-brand-background text-brand-text-primary font-sans">
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <PencilIcon className="w-8 h-8 text-brand-primary" />
                    <span className="font-bold text-xl">Escritor IA</span>
                </div>
                <button
                    onClick={onStart}
                    className="bg-brand-secondary text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-primary transition-colors text-sm"
                >
                    Começar
                </button>
            </header>

            <main>
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center text-center p-4 pt-20">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight">
                        Sua Próxima Grande História Começa <span className="text-brand-primary">Aqui.</span>
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-brand-text-secondary max-w-3xl">
                        Uma suíte de escrita completa para autores, com um assistente de escrita com{' '}
                        <span className="inline-block overflow-hidden border-r-2 border-brand-primary whitespace-nowrap animate-[typing_3.5s_steps(40,end),blink-caret_.75s_step-end_infinite] text-brand-text-primary font-semibold">
                            Inteligência Artificial.
                        </span>
                    </p>
                    <button
                        onClick={onStart}
                        className="mt-8 bg-brand-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                        Comece a Escrever Gratuitamente
                    </button>
                </section>

                {/* Features Section */}
                <section className="py-20 px-4 bg-brand-surface/30">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold font-serif">Ferramentas Poderosas para Autores</h2>
                            <p className="mt-3 text-brand-text-secondary max-w-2xl mx-auto">
                                Desde a primeira faísca de inspiração até o manuscrito final, temos tudo o que você precisa.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard 
                                icon={<SparklesIcon className="w-6 h-6 text-white"/>} 
                                title="Geração de Histórias"
                                description="Comece com um rascunho completo, incluindo título, sinopse, personagens e capítulos, gerado por IA."
                            />
                             <FeatureCard 
                                icon={<ClipboardIcon className="w-6 h-6 text-white"/>} 
                                title="Assistente de Escrita"
                                description="Receba ajuda para continuar cenas, reescrever trechos e obter feedback crítico como um leitor beta."
                            />
                             <FeatureCard 
                                icon={<LightbulbIcon className="w-6 h-6 text-white"/>} 
                                title="Análise de Trama"
                                description="Identifique furos de roteiro, inconsistências e repetições com a ajuda de um editor de IA proativo."
                            />
                             <FeatureCard 
                                icon={<GlobeAltIcon className="w-6 h-6 text-white"/>} 
                                title="Worldbuilding"
                                description="Crie e gerencie uma enciclopédia para seu mundo, com a IA sugerindo novas entradas com base na sua escrita."
                            />
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-20 px-4 text-center">
                    <h2 className="text-4xl font-bold font-serif">Pronto para Desbloquear sua Criatividade?</h2>
                    <p className="mt-3 text-brand-text-secondary">Dê vida às suas ideias hoje mesmo.</p>
                     <button
                        onClick={onStart}
                        className="mt-8 bg-brand-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                        Comece sua Jornada
                    </button>
                </section>
            </main>

            <footer className="text-center py-6 border-t border-brand-secondary">
                <p className="text-brand-text-secondary text-sm">&copy; {new Date().getFullYear()} Simulador de Escritor IA. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
