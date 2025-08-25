
import React, { useState, useMemo } from 'react';
import { RefreshIcon, WandSparklesIcon } from './Icons';
import { useStory } from '../context/StoryContext';
import { analyzeScriptContinuity, analyzeRepetitions } from '../services/geminiService';
import IdeaHub from './IdeaHub';

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>;

const AuthorTools: React.FC = () => {
    const { activeStory, updateActiveStory } = useStory();
    const [activeAnalysis, setActiveAnalysis] = useState<'script' | 'repetition' | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isIdeaHubOpen, setIsIdeaHubOpen] = useState(false);

    if (!activeStory) return null;

    const handleAnalyzeScript = async () => {
        setIsAnalyzing(true);
        setActiveAnalysis('script');
        try {
            const results = await analyzeScriptContinuity(activeStory);
            updateActiveStory(story => ({
                ...story,
                analysis: {
                    ...story.analysis,
                    scriptIssues: { ...story.analysis.scriptIssues, results, lastAnalyzed: new Date().toISOString() }
                },
                actionLog: [...story.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'agent', action: 'Executou uma análise de continuidade da trama.'}]
            }));
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzeRepetitions = async () => {
        setIsAnalyzing(true);
        setActiveAnalysis('repetition');
        try {
            const results = await analyzeRepetitions(activeStory);
            updateActiveStory(story => ({
                ...story,
                analysis: {
                    ...story.analysis,
                    repetitions: { ...story.analysis.repetitions, results, lastAnalyzed: new Date().toISOString() }
                },
                actionLog: [...story.actionLog, {id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'agent', action: 'Executou uma análise de repetições.'}]
            }));
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleIgnoreScriptIssue = (description: string) => {
        updateActiveStory(story => ({
            ...story,
            analysis: {
                ...story.analysis,
                scriptIssues: {
                    ...story.analysis.scriptIssues,
                    ignored: [...new Set([...story.analysis.scriptIssues.ignored, description])]
                }
            }
        }));
    };

    const handleIgnoreRepetition = (text: string) => {
        updateActiveStory(story => ({
            ...story,
            analysis: {
                ...story.analysis,
                repetitions: {
                    ...story.analysis.repetitions,
                    ignored: [...new Set([...story.analysis.repetitions.ignored, text])]
                }
            }
        }));
    };

    const scriptIssues = useMemo(() => activeStory.analysis?.scriptIssues.results.filter(issue => !activeStory.analysis.scriptIssues.ignored.includes(issue.description)) || [], [activeStory.analysis?.scriptIssues]);
    const repetitionIssues = useMemo(() => activeStory.analysis?.repetitions.results.filter(issue => !activeStory.analysis.repetitions.ignored.includes(issue.text)) || [], [activeStory.analysis?.repetitions]);

    return (
        <>
            <div className="mt-10">
                <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Ferramentas do Autor</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-brand-surface border border-brand-secondary rounded-lg p-6 flex flex-col">
                        <h3 className="font-bold text-brand-text-primary">Continuidade da Trama</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 flex-grow">Verifica furos de roteiro e inconsistências.</p>
                        {scriptIssues.length > 0 && <p className="text-yellow-400 font-bold my-2">{scriptIssues.length} problemas encontrados</p>}
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setActiveAnalysis('script')} disabled={isAnalyzing} className="flex-1 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all">Ver Detalhes</button>
                            <button onClick={handleAnalyzeScript} disabled={isAnalyzing} className="bg-brand-primary p-2 rounded-lg hover:bg-opacity-90 transition-all"><RefreshIcon className={`w-5 h-5 ${isAnalyzing && activeAnalysis === 'script' ? 'animate-spin' : ''}`} /></button>
                        </div>
                    </div>
                    <div className="bg-brand-surface border border-brand-secondary rounded-lg p-6 flex flex-col">
                        <h3 className="font-bold text-brand-text-primary">Análise de Repetição</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 flex-grow">Encontra palavras e frases repetitivas.</p>
                        {repetitionIssues.length > 0 && <p className="text-yellow-400 font-bold my-2">{repetitionIssues.length} repetições encontradas</p>}
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setActiveAnalysis('repetition')} disabled={isAnalyzing} className="flex-1 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all">Ver Detalhes</button>
                            <button onClick={handleAnalyzeRepetitions} disabled={isAnalyzing} className="bg-brand-primary p-2 rounded-lg hover:bg-opacity-90 transition-all"><RefreshIcon className={`w-5 h-5 ${isAnalyzing && activeAnalysis === 'repetition' ? 'animate-spin' : ''}`} /></button>
                        </div>
                    </div>
                    <div className="bg-brand-surface border border-brand-secondary rounded-lg p-6 flex flex-col">
                        <h3 className="font-bold text-brand-text-primary">Central de Ideias</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 flex-grow">Gere reviravoltas, nomes e diálogos para superar o bloqueio criativo.</p>
                        <button onClick={() => setIsIdeaHubOpen(true)} className="mt-4 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-center gap-2">
                            <WandSparklesIcon className="w-5 h-5" />
                            Abrir Central
                        </button>
                    </div>
                </div>
            </div>
            
            {isIdeaHubOpen && <IdeaHub story={activeStory} onClose={() => setIsIdeaHubOpen(false)} />}

            {activeAnalysis && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setActiveAnalysis(null)}>
                    <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                        {isAnalyzing && <div className="text-center p-8"><LoadingSpinnerSmall /> <p className="mt-4 text-brand-text-secondary">A IA está lendo sua história...</p></div>}
                        
                        {activeAnalysis === 'script' && !isAnalyzing && (
                            <>
                                <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Análise de Continuidade do Roteiro</h2>
                                {scriptIssues.length > 0 ? (
                                    <div className="space-y-4">
                                        {scriptIssues.map((issue, index) => (
                                            <div key={index} className="bg-brand-background p-4 rounded-lg border border-brand-secondary">
                                                <p className="font-semibold text-brand-text-primary">{issue.description}</p>
                                                <p className="text-sm text-brand-text-secondary mt-2"><strong className="text-brand-text-primary">Sugestão:</strong> {issue.suggestion}</p>
                                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-brand-text-secondary">Capítulos:</span>
                                                    {issue.involvedChapters.map(chap => <span key={chap} className="text-xs bg-brand-secondary px-2 py-1 rounded-full">{chap}</span>)}
                                                </div>
                                                <div className="text-right mt-2">
                                                    <button onClick={() => handleIgnoreScriptIssue(issue.description)} className="text-xs font-semibold text-brand-text-secondary hover:text-white transition-colors px-3 py-1">Ignorar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8">
                                        <p className="text-lg font-semibold text-brand-text-primary">Nenhum furo de roteiro encontrado!</p>
                                        <p className="text-brand-text-secondary mt-2">Sua história parece consistente. Bom trabalho!</p>
                                    </div>
                                )}
                            </>
                        )}

                        {activeAnalysis === 'repetition' && !isAnalyzing && (
                             <>
                                <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Análise de Repetição</h2>
                                {repetitionIssues.length > 0 ? (
                                    <div className="space-y-4">
                                        {repetitionIssues.map((issue, index) => (
                                            <div key={index} className="bg-brand-background p-4 rounded-lg border border-brand-secondary">
                                                <p className="font-semibold text-brand-text-primary">Texto repetido: "<span className="italic text-brand-primary">{issue.text}</span>" (encontrado {issue.count} vezes)</p>
                                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-brand-text-secondary">Capítulos:</span>
                                                    {issue.locations.map(loc => <span key={loc} className="text-xs bg-brand-secondary px-2 py-1 rounded-full">{loc}</span>)}
                                                </div>
                                                 <div className="text-right mt-2">
                                                    <button onClick={() => handleIgnoreRepetition(issue.text)} className="text-xs font-semibold text-brand-text-secondary hover:text-white transition-colors px-3 py-1">Ignorar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8">
                                        <p className="text-lg font-semibold text-brand-text-primary">Nenhuma repetição significativa encontrada!</p>
                                        <p className="text-brand-text-secondary mt-2">Sua prosa parece variada e estilisticamente sólida.</p>
                                    </div>
                                )}
                            </>
                        )}
                        <button onClick={() => setActiveAnalysis(null)} className="mt-6 w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90">Fechar</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AuthorTools;
