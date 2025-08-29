import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, GlobeAltIcon, UsersIcon, PencilIcon, NetworkIcon } from './Icons';
import { generateLandingPageIdea } from '../services/geminiService';
import useClickSpark from '../hooks/useClickSpark';

interface LandingPageProps {
    onStart: () => void;
    navigateToBlog: () => void;
}

const QuoteIcon = ({ className = 'w-12 h-12' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className={className}>
      <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
    </svg>
);

const CheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);


const features = [
    { 
        problem: '“Os personagens são apenas nomes em uma página.”',
        solution: {
            name: 'Dê vida a eles',
            icon: <UsersIcon className="w-8 h-8 text-brand-primary"/>,
            description: 'Com personalidades profundas, aparências marcantes e arcos narrativos, nossa IA ajuda a transformar meros conceitos em personagens que respiram.'
        }
    },
    { 
        problem: '“A trama se perde em becos sem saída.”',
        solution: {
            name: 'Encontre o caminho certo',
            icon: <NetworkIcon className="w-8 h-8 text-brand-primary"/>,
            description: 'Visualize sua narrativa, conecte cenas e identifique pontos de virada com o Visualizador de Trama. Nunca mais perca o fio da meada.'
        }
    },
    { 
        problem: '“O universo que você criou parece frágil.”',
        solution: {
            name: 'Construa mundos consistentes',
            icon: <GlobeAltIcon className="w-8 h-8 text-brand-primary"/>,
            description: 'Nossa ferramenta de Worldbuilding ajuda a rastrear sua lore, de itens mágicos a dinastias complexas, garantindo que cada detalhe permaneça coeso.'
        }
    }
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart, navigateToBlog }) => {
    const [ideaPrompt, setIdeaPrompt] = useState('');
    const [generatedIdea, setGeneratedIdea] = useState<{title: string, synopsis: string} | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const loginButtonRef = useRef<HTMLButtonElement>(null);
    const sparkButtonRef = useRef<HTMLButtonElement>(null);
    const firstLineButtonRef = useRef<HTMLButtonElement>(null);
    const prologueButtonRef = useRef<HTMLButtonElement>(null);
    useClickSpark(loginButtonRef);
    useClickSpark(sparkButtonRef);
    useClickSpark(firstLineButtonRef);
    useClickSpark(prologueButtonRef);

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
    
    // Particle and Parallax animation effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const particleCount = window.innerWidth > 768 ? 100 : 50;
        const maxDistance = 120;
        const interactionRadius = 200;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 1,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(138, 79, 255, 0.7)';
                ctx.fill();
            });

            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                    if (dist < maxDistance) {
                        ctx.strokeStyle = `rgba(138, 79, 255, ${1 - dist / maxDistance})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            const { x: mouseX, y: mouseY } = mousePos.current;
            if (mouseX > 0 && mouseY > 0) {
                 for (let i = 0; i < particles.length; i++) {
                    const dist = Math.hypot(particles[i].x - mouseX, particles[i].y - mouseY);
                    if (dist < interactionRadius) {
                        ctx.strokeStyle = `rgba(224, 224, 224, ${0.3 - dist / interactionRadius})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.stroke();
                    }
                 }
            }


            animationFrameId = requestAnimationFrame(animate);
        };
        
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        const handleScroll = () => {
            if (canvas) {
                canvas.style.transform = `translateY(${window.scrollY * 0.5}px)`;
            }
        };

        resizeCanvas();
        createParticles();
        animate();
        
        window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', () => { resizeCanvas(); createParticles(); });
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Scroll animation effect
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.2 });

        const sections = document.querySelectorAll('.reveal-on-scroll');
        sections.forEach((section) => observer.observe(section));

        return () => sections.forEach((section) => observer.unobserve(section));
    }, []);

    return (
        <div className="bg-brand-background text-brand-text-primary font-sans">
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 opacity-70"></canvas>
            <div className="relative z-10">
                <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-brand-background/80 backdrop-blur-md border-b border-brand-secondary/50">
                    <div className="flex items-center gap-2">
                        <PencilIcon className="w-8 h-8 text-brand-primary" />
                        <span className="font-bold text-xl">Escritor IA</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
                        <a href="#features-section" className="text-brand-text-secondary hover:text-brand-primary transition-colors">Ferramentas</a>
                        <a href="#testimonials-section" className="text-brand-text-secondary hover:text-brand-primary transition-colors">Depoimentos</a>
                        <button onClick={navigateToBlog} className="text-brand-text-secondary hover:text-brand-primary transition-colors">Recursos</button>
                    </nav>
                    <button
                        ref={loginButtonRef}
                        onClick={onStart}
                        className="bg-brand-secondary text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-primary transition-colors text-sm"
                    >
                        Entrar
                    </button>
                </header>

                <main>
                    {/* Hero Section: A Página em Branco */}
                    <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-4 pt-20">
                        <div className="relative z-10">
                             <h1 className="text-5xl md:text-7xl font-bold font-serif leading-snug">
                                <span className="inline-block overflow-hidden whitespace-nowrap border-r-4 border-r-brand-primary animate-typing">Sua próxima grande história começa...</span>
                            </h1>
                            <p className="mt-4 text-lg md:text-xl text-brand-text-secondary max-w-3xl mx-auto">
                               Toda grande história começa com uma faísca. E uma página em branco assustadora. Qual é a sua faísca?
                            </p>
                            <div className="mt-8 w-full max-w-2xl mx-auto bg-brand-surface/50 border border-brand-secondary rounded-xl p-6 shadow-2xl backdrop-blur-sm">
                                <textarea
                                    value={ideaPrompt}
                                    onChange={(e) => setIdeaPrompt(e.target.value)}
                                    placeholder="Um detetive em um mundo ciberpunk investiga um crime impossível..."
                                    className="w-full p-3 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder:text-brand-text-secondary/60 focus:ring-2 focus:ring-brand-primary outline-none transition"
                                    rows={2}
                                />
                                <button
                                    ref={sparkButtonRef}
                                    onClick={handleGenerateIdea}
                                    disabled={isGenerating}
                                    className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                >
                                    {isGenerating ? 'Gerando...' : 'Encontrar a Faísca'}
                                    <SparklesIcon className="w-5 h-5" />
                                </button>
                                {generatedIdea && (
                                    <div className="mt-6 text-left p-4 bg-brand-background rounded-lg border border-brand-primary/50 animate-[fadeIn_0.5s_ease-in-out]">
                                        <h3 className="font-bold text-xl font-serif text-brand-primary">{generatedIdea.title}</h3>
                                        <p className="mt-2 text-brand-text-secondary">{generatedIdea.synopsis}</p>
                                    </div>
                                )}
                            </div>
                            <button
                                ref={firstLineButtonRef}
                                onClick={onStart}
                                className="mt-12 bg-transparent border-2 border-brand-primary text-brand-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-primary hover:text-white transition-colors"
                            >
                                Escreva a Primeira Linha
                            </button>
                        </div>
                    </section>

                    {/* Features Section: Domando a Tempestade de Ideias */}
                    <section id="features-section" className="py-24 px-4 bg-brand-surface/80">
                         <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16 reveal-on-scroll">
                                <h2 className="text-4xl md:text-5xl font-bold font-serif">Domando a Tempestade de Ideias</h2>
                                <p className="mt-4 text-lg text-brand-text-secondary">A inspiração chegou. Agora, a batalha começa. Cada escritor enfrenta desafios, mas com as ferramentas certas, o caos se transforma em criação.</p>
                            </div>
                            <div className="relative space-y-16">
                                <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-brand-secondary/50" aria-hidden="true"></div>
                                {features.map((feature, index) => (
                                    <div key={index} className="relative flex items-center" style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
                                        <div className="w-1/2 px-8 reveal-on-scroll">
                                            <p className="text-2xl font-serif italic text-brand-text-secondary">{feature.problem}</p>
                                        </div>
                                        <div className="w-1/2 px-8 reveal-on-scroll">
                                            <div className="bg-brand-surface p-6 rounded-lg border border-brand-secondary shadow-lg">
                                                <div className="flex items-center gap-4 mb-3">
                                                    {feature.solution.icon}
                                                    <h3 className="text-2xl font-bold font-serif text-brand-text-primary">{feature.solution.name}</h3>
                                                </div>
                                                <p className="text-brand-text-secondary">{feature.solution.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Testimonials Section: A Voz da Experiência */}
                    <section id="testimonials-section" className="py-24 px-4 bg-brand-background">
                        <div className="max-w-4xl mx-auto text-center reveal-on-scroll">
                            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">A Voz da Experiência</h2>
                            <p className="text-lg text-brand-text-secondary mb-12">Nenhum escritor é uma ilha. Veja o que outros criadores dizem sobre sua jornada.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="bg-brand-surface p-6 rounded-lg border border-brand-secondary">
                                    <p className="italic text-brand-text-secondary">"A análise de continuidade é um salva-vidas. A IA encontrou um furo de roteiro que eu nunca teria visto!"</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <img src="https://i.pravatar.cc/48?u=jvalerius" alt="J. Valerius" className="w-12 h-12 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-brand-text-primary">J. Valerius</p>
                                            <p className="text-sm text-brand-text-secondary">Autor de Fantasia</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-brand-surface p-6 rounded-lg border border-brand-secondary">
                                    <p className="italic text-brand-text-secondary">"Finalmente consegui terminar meu primeiro rascunho. A ferramenta de 'continuar escrita' me salvou do bloqueio criativo várias vezes."</p>
                                     <div className="flex items-center gap-3 mt-4">
                                        <img src="https://i.pravatar.cc/48?u=clara" alt="Clara Menezes" className="w-12 h-12 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-brand-text-primary">Clara Menezes</p>
                                            <p className="text-sm text-brand-text-secondary">Escritora de Ficção Científica</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Final CTA: A Resolução */}
                    <section className="py-24 px-4 text-center bg-brand-background">
                        <div className="reveal-on-scroll">
                            <h2 className="text-4xl md:text-5xl font-bold font-serif">Sua página em branco espera.</h2>
                            <p className="mt-4 text-lg text-brand-text-secondary max-w-xl mx-auto">Qual será a sua história?</p>
                             <button
                                ref={prologueButtonRef}
                                onClick={onStart}
                                className="mt-8 bg-brand-primary text-white font-bold py-4 px-10 rounded-lg text-xl hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                            >
                                Comece o Seu Prólogo
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default LandingPage;