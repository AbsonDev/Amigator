import React, { useState, useEffect } from 'react';
import { SparklesIcon, LightbulbIcon, GlobeAltIcon, ClipboardIcon, PencilIcon, BookOpenIcon, UsersIcon, ArrowDownTrayIcon } from './Icons';

interface LandingPageProps {
    onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay?: number }> = 
    ({ icon, title, description, delay = 0 }) => (
    <div 
        className="group relative bg-gradient-to-br from-brand-surface/80 to-brand-surface/40 p-8 rounded-2xl border border-brand-secondary/30 backdrop-blur-sm transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:border-brand-primary/50"
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-primary/0 to-brand-primary/0 group-hover:from-brand-primary/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
        
        <div className="relative z-10">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center mb-5 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                {icon}
            </div>
            <h3 className="font-bold text-xl text-brand-text-primary mb-3 group-hover:text-brand-primary transition-colors">{title}</h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed">{description}</p>
        </div>
    </div>
);

const StatCard: React.FC<{ number: string; label: string }> = ({ number, label }) => (
    <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
            {number}
        </div>
        <div className="text-brand-text-secondary mt-2">{label}</div>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    const [scrollY, setScrollY] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="bg-brand-background text-brand-text-primary font-sans overflow-x-hidden">
            {/* Animated background gradient */}
            <div className="fixed inset-0 opacity-30">
                <div 
                    className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-purple-600/20"
                    style={{
                        transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(138,79,255,0.1)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(138,79,255,0.05)_0%,transparent_70%)]" />
            </div>

            {/* Floating particles */}
            <div className="fixed inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-brand-primary/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                        }}
                    />
                ))}
            </div>

            {/* Header with glassmorphism */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-background/70 border-b border-brand-secondary/20">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative">
                            <PencilIcon className="w-10 h-10 text-brand-primary transform transition-transform group-hover:rotate-12" />
                            <div className="absolute inset-0 bg-brand-primary/20 blur-xl group-hover:bg-brand-primary/30 transition-all"></div>
                        </div>
                        <div>
                            <span className="font-bold text-2xl bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                                Escritor IA
                            </span>
                            <div className="text-xs text-brand-text-secondary">Powered by Gemini AI</div>
                        </div>
                    </div>
                    <button
                        onClick={onStart}
                        className="relative px-6 py-3 font-bold text-white rounded-xl bg-gradient-to-r from-brand-primary to-purple-600 hover:from-brand-primary/90 hover:to-purple-600/90 transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-primary/25"
                    >
                        <span className="relative z-10">Começar Agora</span>
                    </button>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section with parallax */}
                <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 relative">
                    {/* Animated background shapes */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div 
                            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-primary/20 to-purple-600/20 rounded-full blur-3xl"
                            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
                        />
                        <div 
                            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-600/20 to-brand-primary/20 rounded-full blur-3xl"
                            style={{ transform: `translateY(${scrollY * -0.2}px)` }}
                        />
                    </div>

                    <div className="relative">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-surface/80 backdrop-blur-sm rounded-full border border-brand-primary/30 mb-8 animate-bounce">
                            <SparklesIcon className="w-4 h-4 text-brand-primary" />
                            <span className="text-sm font-medium text-brand-text-primary">100% Gratuito • Sem Cartão de Crédito</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif leading-tight mb-6">
                            <span className="block mb-2">Transforme Ideias em</span>
                            <span className="relative">
                                <span className="bg-gradient-to-r from-brand-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-300%">
                                    Histórias Incríveis
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10">
                                    <path d="M0,5 Q150,0 300,5" stroke="url(#gradient)" strokeWidth="2" fill="none" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8a4fff" />
                                            <stop offset="50%" stopColor="#a855f7" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </span>
                        </h1>
                        
                        <p className="mt-8 text-xl md:text-2xl text-brand-text-secondary max-w-3xl mx-auto leading-relaxed">
                            Escreva seu próximo best-seller com o poder da{' '}
                            <span className="font-semibold text-brand-primary">Inteligência Artificial</span>.
                            De rascunhos a manuscritos completos em minutos.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={onStart}
                                className="group relative px-8 py-4 bg-gradient-to-r from-brand-primary to-purple-600 text-white font-bold rounded-2xl text-lg hover:shadow-2xl hover:shadow-brand-primary/30 transform transition-all hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Começar a Escrever
                                    <PencilIcon className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
                                </span>
                            </button>
                            <button className="px-8 py-4 bg-brand-surface/80 backdrop-blur-sm text-brand-text-primary font-bold rounded-2xl text-lg border border-brand-secondary/50 hover:border-brand-primary/50 transform transition-all hover:scale-105">
                                Ver Demonstração
                            </button>
                        </div>

                        {/* Social proof */}
                        <div className="mt-12 flex items-center justify-center gap-8 text-brand-text-secondary">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 border-2 border-brand-background" />
                                    ))}
                                </div>
                                <span className="text-sm">+1000 escritores ativos</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-500">★</span>
                                ))}
                                <span className="text-sm ml-1">4.9/5</span>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 animate-bounce">
                        <div className="w-6 h-10 border-2 border-brand-primary/50 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-brand-primary rounded-full mt-2 animate-pulse"></div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <StatCard number="50K+" label="Histórias Criadas" />
                            <StatCard number="1M+" label="Palavras Escritas" />
                            <StatCard number="100+" label="Gêneros Suportados" />
                            <StatCard number="24/7" label="IA Disponível" />
                        </div>
                    </div>
                </section>

                {/* Features Section with cards */}
                <section className="py-20 px-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-surface/10 to-transparent"></div>
                    
                    <div className="max-w-7xl mx-auto relative">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-semibold mb-4">
                                RECURSOS PODEROSOS
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
                                Tudo que Você Precisa para{' '}
                                <span className="bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                                    Escrever
                                </span>
                            </h2>
                            <p className="text-xl text-brand-text-secondary max-w-3xl mx-auto">
                                Ferramentas profissionais de escrita potencializadas por IA de última geração
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FeatureCard 
                                icon={<SparklesIcon className="w-7 h-7 text-white"/>} 
                                title="Geração Instantânea"
                                description="Crie histórias completas com personagens, enredo e capítulos em segundos com nossa IA avançada."
                                delay={0}
                            />
                            <FeatureCard 
                                icon={<ClipboardIcon className="w-7 h-7 text-white"/>} 
                                title="Editor Inteligente"
                                description="Continue cenas, reescreva parágrafos e receba sugestões contextuais em tempo real."
                                delay={100}
                            />
                            <FeatureCard 
                                icon={<LightbulbIcon className="w-7 h-7 text-white"/>} 
                                title="Análise Profunda"
                                description="Detecte inconsistências, furos de roteiro e repetições automaticamente."
                                delay={200}
                            />
                            <FeatureCard 
                                icon={<GlobeAltIcon className="w-7 h-7 text-white"/>} 
                                title="Worldbuilding"
                                description="Construa universos ricos e detalhados com mapas de personagens e lugares."
                                delay={300}
                            />
                            <FeatureCard 
                                icon={<BookOpenIcon className="w-7 h-7 text-white"/>} 
                                title="Biblioteca Pessoal"
                                description="Organize todas suas histórias, rascunhos e ideias em um só lugar seguro."
                                delay={400}
                            />
                            <FeatureCard 
                                icon={<UsersIcon className="w-7 h-7 text-white"/>} 
                                title="Beta Readers IA"
                                description="Receba feedback detalhado sobre ritmo, diálogos e desenvolvimento de personagens."
                                delay={500}
                            />
                            <FeatureCard 
                                icon={<ArrowDownTrayIcon className="w-7 h-7 text-white"/>} 
                                title="Exportação Flexível"
                                description="Exporte para PDF, DOCX ou TXT. Pronto para publicação ou envio para editoras."
                                delay={600}
                            />
                            <FeatureCard 
                                icon={<PencilIcon className="w-7 h-7 text-white"/>} 
                                title="Escrita Assistida"
                                description="Supere bloqueios criativos com sugestões e inspirações personalizadas."
                                delay={700}
                            />
                        </div>
                    </div>
                </section>

                {/* How it works section */}
                <section className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-semibold mb-4">
                                COMO FUNCIONA
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
                                Três Passos Simples
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { number: "01", title: "Defina seu Gênero", desc: "Escolha entre fantasia, ficção científica, romance, mistério e muito mais." },
                                { number: "02", title: "Descreva sua Ideia", desc: "Conte sua visão em poucas palavras e deixe a IA fazer a mágica." },
                                { number: "03", title: "Edite e Publique", desc: "Refine com ferramentas profissionais e exporte seu manuscrito finalizado." }
                            ].map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="text-6xl font-bold text-brand-primary/20 absolute -top-4 -left-4">{step.number}</div>
                                    <div className="relative bg-brand-surface/50 backdrop-blur-sm p-8 rounded-2xl border border-brand-secondary/30">
                                        <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                        <p className="text-brand-text-secondary">{step.desc}</p>
                                    </div>
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                            <svg width="30" height="30" viewBox="0 0 30 30">
                                                <path d="M10,15 L20,15" stroke="#8a4fff" strokeWidth="2" />
                                                <path d="M15,10 L20,15 L15,20" stroke="#8a4fff" strokeWidth="2" fill="none" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-20 px-4 bg-gradient-to-b from-transparent via-brand-surface/20 to-transparent">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
                                Escritores Amam o Escritor IA
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { name: "Maria Silva", role: "Autora de Fantasia", text: "Transformou completamente meu processo criativo. Escrevi meu primeiro livro em apenas 2 meses!" },
                                { name: "João Santos", role: "Escritor de Ficção Científica", text: "A IA entende perfeitamente o tom e estilo que quero. É como ter um co-autor genial." },
                                { name: "Ana Costa", role: "Romancista", text: "As ferramentas de análise me ajudaram a eliminar inconsistências que nem percebia existir." }
                            ].map((testimonial, i) => (
                                <div key={i} className="bg-brand-surface/50 backdrop-blur-sm p-6 rounded-2xl border border-brand-secondary/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-purple-600"></div>
                                        <div>
                                            <div className="font-bold">{testimonial.name}</div>
                                            <div className="text-sm text-brand-text-secondary">{testimonial.role}</div>
                                        </div>
                                    </div>
                                    <p className="text-brand-text-secondary italic">"{testimonial.text}"</p>
                                    <div className="flex gap-1 mt-4">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-500">★</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-32 px-4 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-purple-600/5 to-brand-primary/5"></div>
                    
                    <div className="relative max-w-4xl mx-auto">
                        <h2 className="text-5xl md:text-6xl font-bold font-serif mb-6">
                            Pronto para Escrever sua{' '}
                            <span className="bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                                Obra-Prima?
                            </span>
                        </h2>
                        <p className="text-xl text-brand-text-secondary mb-10">
                            Junte-se a milhares de escritores que já descobriram o poder da escrita assistida por IA.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={onStart}
                                className="group relative px-10 py-5 bg-gradient-to-r from-brand-primary to-purple-600 text-white font-bold rounded-2xl text-xl hover:shadow-2xl hover:shadow-brand-primary/30 transform transition-all hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <SparklesIcon className="w-6 h-6" />
                                    Começar Gratuitamente
                                    <span className="text-sm opacity-75">(Sem cartão)</span>
                                </span>
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-brand-text-secondary">
                            <span className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Setup em 30 segundos
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Sem limites de uso
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Cancele quando quiser
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="relative z-10 border-t border-brand-secondary/20 bg-brand-surface/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <PencilIcon className="w-8 h-8 text-brand-primary" />
                                <span className="font-bold text-xl">Escritor IA</span>
                            </div>
                            <p className="text-sm text-brand-text-secondary">
                                Transformando ideias em histórias incríveis com o poder da inteligência artificial.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm text-brand-text-secondary">
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Recursos</li>
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Preços</li>
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Demonstração</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Empresa</h4>
                            <ul className="space-y-2 text-sm text-brand-text-secondary">
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Sobre</li>
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Blog</li>
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Contato</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-brand-text-secondary">
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Privacidade</li>
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Termos</li>
                                <li className="hover:text-brand-primary cursor-pointer transition-colors">Cookies</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-brand-secondary/20 pt-8 text-center">
                        <p className="text-brand-text-secondary text-sm">
                            &copy; {new Date().getFullYear()} Simulador de Escritor IA. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;