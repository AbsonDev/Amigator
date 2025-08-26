
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

const CheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
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
                
                {/* Pricing Section */}
                <section className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold font-serif">Planos e Preços</h2>
                            <p className="mt-3 text-brand-text-secondary max-w-2xl mx-auto">
                                Escolha o plano perfeito para sua jornada de escrita. Cancele a qualquer momento.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                            {/* Hobby Plan */}
                            <div className="bg-brand-surface p-8 rounded-lg border border-brand-secondary h-full flex flex-col">
                                <h3 className="text-2xl font-bold font-serif text-brand-text-primary">Hobby</h3>
                                <p className="text-4xl font-bold my-4">R$19<span className="text-lg font-normal text-brand-text-secondary">/mês</span></p>
                                <p className="text-brand-text-secondary mb-6 h-16">Para o escritor que está começando e quer explorar mais fundo.</p>
                                <ul className="space-y-3 text-brand-text-secondary flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="text-green-500 w-5 h-5 flex-shrink-0" /> Até 5 livros</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-green-500 w-5 h-5 flex-shrink-0" /> Geração de avatares com mais estilos</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-green-500 w-5 h-5 flex-shrink-0" /> Central de Ideias</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-green-500 w-5 h-5 flex-shrink-0" /> Exportação em TXT</li>
                                </ul>
                                <button onClick={onStart} className="mt-8 w-full bg-brand-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors">
                                    Começar Teste Gratuito
                                </button>
                            </div>
                            
                            {/* Amador Plan */}
                            <div className="bg-brand-primary/10 p-8 rounded-lg border-2 border-brand-primary relative h-full flex flex-col transform lg:scale-110">
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">RECOMENDADO</div>
                                <h3 className="text-2xl font-bold font-serif text-brand-primary">Amador</h3>
                                <p className="text-4xl font-bold my-4">R$29<span className="text-lg font-normal text-brand-text-secondary">/mês</span></p>
                                <p className="text-brand-text-secondary mb-6 h-16">As ferramentas essenciais para levar sua escrita ao próximo nível.</p>
                                <ul className="space-y-3 text-brand-text-primary flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="text-brand-primary w-5 h-5 flex-shrink-0" /> Livros ilimitados</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-brand-primary w-5 h-5 flex-shrink-0" /> Análise de Continuidade da Trama</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-brand-primary w-5 h-5 flex-shrink-0" /> Análise de repetição de texto</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-brand-primary w-5 h-5 flex-shrink-0" /> Exportação em PDF e DOCX</li>
                                </ul>
                                <button onClick={onStart} className="mt-8 w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105">
                                    Começar Teste Gratuito
                                </button>
                            </div>

                             {/* Profissional Plan */}
                            <div className="bg-brand-surface p-8 rounded-lg border border-brand-secondary h-full flex flex-col">
                                <h3 className="text-2xl font-bold font-serif text-brand-text-primary">Profissional</h3>
                                <p className="text-4xl font-bold my-4">R$49<span className="text-lg font-normal text-brand-text-secondary">/mês</span></p>
                                <p className="text-brand-text-secondary mb-6 h-16">O arsenal completo para o autor dedicado e focado na publicação.</p>
                                <ul className="space-y-3 text-brand-text-secondary flex-grow">
                                    <li className="flex items-center gap-3"><CheckIcon className="text-green-500 w-5 h-5 flex-shrink-0" /> Tudo do plano Amador</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-green-500 w-5 h-5 flex-shrink-0" /> Salvamento automático e versões</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-green-500 w-5 h-5 flex-shrink-0" /> Ferramentas de colaboração</li>
                                    <li className="flex items-center gap-3"><CheckIcon className="text-green-500 w-5 h-5 flex-shrink-0" /> Suporte prioritário</li>
                                </ul>
                                <button onClick={onStart} className="mt-8 w-full bg-brand-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors">
                                    Começar Teste Gratuito
                                </button>
                            </div>
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