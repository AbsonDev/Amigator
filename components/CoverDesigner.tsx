import React, { useState, useEffect, useMemo } from 'react';
import { useStory } from '../context/StoryContext';
import { useAuthor } from '../context/AuthorContext';
import { generateBookCover } from '../services/geminiService';
import { SparklesIcon, ArrowDownTrayIcon, PhotoIcon } from './Icons';
import type { CoverTypography } from '../types';

type ArtStyle = "Ilustração" | "Fotorrealista" | "Minimalista" | "Vintage" | "Fantasia Sombria" | "Aquarela";

const CoverDesigner: React.FC = () => {
    const { activeStory, updateActiveStory } = useStory();
    const { author } = useAuthor();
    
    const initialPrompt = useMemo(() => {
        if (!activeStory) return '';
        return `Uma capa de livro para um romance de ${activeStory.genre} intitulado "${activeStory.title}". A história é sobre: ${activeStory.synopsis}`;
    }, [activeStory?.genre, activeStory?.title, activeStory?.synopsis]);

    const [prompt, setPrompt] = useState(initialPrompt);
    const [artStyle, setArtStyle] = useState<ArtStyle>("Ilustração");
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [typography, setTypography] = useState<CoverTypography>({
        fontFamily: 'serif',
        color: 'light',
    });
    
    useEffect(() => {
        if (activeStory) {
            setPrompt(initialPrompt);
            setGeneratedImageUrl(activeStory.coverUrl || null);
            setTypography(activeStory.coverTypography || { fontFamily: 'serif', color: 'light' });
        }
    }, [activeStory?.id]);

    useEffect(() => {
        setPrompt(initialPrompt);
    }, [initialPrompt]);

    if (!activeStory || !author) return null;

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const imageUrl = await generateBookCover(prompt, artStyle);
            setGeneratedImageUrl(imageUrl);
            updateActiveStory(story => ({
                ...story,
                actionLog: [...story.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'agent', action: `Gerou uma nova arte de capa.`}]
            }));
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (generatedImageUrl) {
            updateActiveStory(story => ({
                ...story,
                coverUrl: generatedImageUrl,
                coverTypography: typography,
                actionLog: [...story.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: `Salvou uma nova capa para o livro.`}]
            }));
            alert("Capa salva com sucesso!");
        }
    };

    const handleDownload = () => {
        if (!generatedImageUrl || !author) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = generatedImageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const canvasWidth = 900;
            const canvasHeight = 1200;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // 1. Desenhar imagem de fundo
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

            // 2. Configurar estilos de texto
            const textColor = typography.color === 'light' ? '#FFFFFF' : '#121212';
            const textShadowColor = typography.color === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.shadowColor = textShadowColor;
            ctx.shadowBlur = 10;
            
            // 3. Desenhar Título (com quebra de linha simples)
            const titleFont = typography.fontFamily === 'serif' ? 'Lora, serif' : 'Inter, sans-serif';
            let fontSize = 100;
            ctx.font = `bold ${fontSize}px ${titleFont}`;
            const maxWidth = canvasWidth * 0.85;
            
            const words = activeStory.title.split(' ');
            let line = '';
            const lines = [];
            for (const word of words) {
                const testLine = line + word + ' ';
                if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
                    lines.push(line);
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            
            lines.forEach((l, i) => {
                ctx.fillText(l.trim(), canvasWidth / 2, canvasHeight * 0.2 + (i * fontSize * 1.1));
            });

            // 4. Desenhar Autor
            const authorFont = typography.fontFamily === 'serif' ? 'Lora, serif' : 'Inter, sans-serif';
            ctx.font = `normal 40px ${authorFont}`;
            ctx.fillText(author.name, canvasWidth / 2, canvasHeight * 0.9);

            // 5. Iniciar Download
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${activeStory.title.replace(/\s+/g, '_')}_cover.jpeg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        img.onerror = () => {
            alert("Não foi possível carregar a imagem da capa para download. Tente salvar e recarregar a página.");
        };
    };

    const fontClass = typography.fontFamily === 'serif' ? 'font-serif' : 'font-sans';
    const colorClass = typography.color === 'light' 
        ? 'text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]' 
        : 'text-brand-background [text-shadow:_1px_1px_2px_rgb(255_255_255_/_50%)]';


    return (
        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Controls Column */}
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold font-serif text-brand-text-primary mb-2">Estúdio de Capa</h1>
                <p className="text-brand-text-secondary mb-6">Dê vida à capa do seu livro com o poder da IA.</p>

                <div className="bg-brand-surface p-6 rounded-lg border border-brand-secondary flex-grow flex flex-col">
                    <div className="flex-grow space-y-4">
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-brand-text-secondary mb-2">Prompt da Arte</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                                placeholder="Descreva a cena, os personagens ou os elementos que você quer na capa..."
                            />
                        </div>
                        <div>
                            <label htmlFor="artStyle" className="block text-sm font-medium text-brand-text-secondary mb-2">Estilo de Arte</label>
                            <select
                                id="artStyle"
                                value={artStyle}
                                onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                                className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                            >
                                <option>Ilustração</option>
                                <option>Fotorrealista</option>
                                <option>Minimalista</option>
                                <option>Vintage</option>
                                <option>Fantasia Sombria</option>
                                <option>Aquarela</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-2">Tipografia</label>
                            <div className="flex gap-2">
                                <select
                                    value={typography.fontFamily}
                                    onChange={(e) => setTypography(t => ({...t, fontFamily: e.target.value as 'serif' | 'sans-serif'}))}
                                    className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                                >
                                    <option value="serif">Serifada (Clássica)</option>
                                    <option value="sans-serif">Sem Serifa (Moderna)</option>
                                </select>
                                <select
                                    value={typography.color}
                                    onChange={(e) => setTypography(t => ({...t, color: e.target.value as 'light' | 'dark'}))}
                                    className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                                >
                                    <option value="light">Texto Claro</option>
                                    <option value="dark">Texto Escuro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 mt-4"
                    >
                        {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Gerando Arte...</> : <><SparklesIcon className="w-5 h-5" />Gerar Arte da Capa</>}
                    </button>
                    <div className="flex gap-2 mt-2">
                        <button onClick={handleSave} disabled={!generatedImageUrl || isLoading} className="w-full bg-brand-secondary text-white font-bold py-2 rounded-lg hover:bg-opacity-80 disabled:opacity-50">Salvar Capa</button>
                        <button onClick={handleDownload} disabled={!generatedImageUrl || isLoading} className="w-full bg-brand-secondary text-white font-bold py-2 rounded-lg hover:bg-opacity-80 disabled:opacity-50 flex items-center justify-center gap-2">
                            <ArrowDownTrayIcon className="w-5 h-5" /> Baixar
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Column */}
            <div className="flex items-center justify-center perspective h-full">
                {isLoading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
                        <p className="mt-4 text-brand-text-secondary">A IA está desenhando sua capa...</p>
                    </div>
                ) : generatedImageUrl ? (
                    <div className="group relative w-60 h-80 transform-style-3d transition-transform duration-700 hover:rotate-y-[-30deg]">
                        {/* Front Cover */}
                        <div className="absolute w-full h-full bg-brand-surface backface-hidden flex flex-col justify-between" style={{ transform: 'translateZ(1rem)'}}>
                             <img src={generatedImageUrl} alt="Capa do Livro Gerada" className="absolute inset-0 w-full h-full object-cover -z-10" />
                             <div className="w-full flex-grow flex items-center justify-center p-4">
                                <h2 className={`text-4xl font-bold leading-tight text-center ${fontClass} ${colorClass}`}>{activeStory.title}</h2>
                             </div>
                             <div className="w-full p-4">
                               <p className={`text-lg text-center ${fontClass} ${colorClass}`}>{author.name}</p>
                             </div>
                        </div>
                        {/* Spine */}
                        <div className="absolute w-8 h-full bg-gray-900 left-0 top-0 flex justify-center items-center p-1" style={{ transform: 'rotateY(-90deg) translateX(-1rem) translateZ(1rem)'}}>
                            <span className="text-white font-serif text-sm transform -rotate-90 whitespace-nowrap origin-center">{activeStory.title}</span>
                        </div>
                         {/* Back Cover */}
                        <div className="absolute w-full h-full bg-gray-800 backface-hidden" style={{ transform: 'rotateY(180deg) translateZ(1rem)'}}></div>
                    </div>
                ) : (
                    <div className="w-60 h-80 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg flex flex-col justify-center items-center text-center p-4">
                        <PhotoIcon className="w-12 h-12 text-brand-secondary" />
                        <p className="mt-2 text-sm text-brand-text-secondary">A prévia da sua capa 3D aparecerá aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoverDesigner;