
import React, { useState, useMemo } from 'react';
import { RefreshIcon, WandSparklesIcon, LockClosedIcon } from '../Icons';
import { useStory } from '../../context/StoryContext';
import { analyzeScriptContinuity, analyzeRepetitions } from '../../services/geminiService';
import IdeaHub from '../IdeaHub';
import AnalysisResultsModal from './AnalysisResultsModal';
import { useAuthor } from '../../context/AuthorContext';

interface AuthorToolsProps {
  openUpgradeModal: () => void;
}

const AuthorTools: React.FC<AuthorToolsProps> = ({ openUpgradeModal }) => {
    const { author } = useAuthor();
    const { activeStory, updateActiveStory } = useStory();
    const [activeAnalysis, setActiveAnalysis] = useState<'script' | 'repetition' | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isIdeaHubOpen, setIsIdeaHubOpen] = useState(false);

    if (!activeStory || !author) return null;
    
    const isPro = author.subscription.tier === 'Pro';

    const handleFeatureClick = (featureAction: () => void) => {
        if (isPro) {
            featureAction();
        } else {
            openUpgradeModal();
        }
    };

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
    
    const scriptIssues = useMemo(() => activeStory.analysis?.scriptIssues.results.filter(issue => !activeStory.analysis.scriptIssues.ignored.includes(issue.description)) || [], [activeStory.analysis?.scriptIssues]);
    const repetitionIssues = useMemo(() => activeStory.analysis?.repetitions.results.filter(issue => !activeStory.analysis.repetitions.ignored.includes(issue.text)) || [], [activeStory.analysis?.repetitions]);

    return (
        <>
            <div className="mt-10">
                <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Ferramentas do Autor</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-brand-surface border border-brand-secondary rounded-lg p-6 flex flex-col relative">
                        {!isPro && <span className="absolute top-2 right-2 text-xs bg-yellow-500 text-black font-bold px-2 py-1 rounded">PRO</span>}
                        <h3 className="font-bold text-brand-text-primary flex items-center gap-2">Continuidade da Trama {!isPro && <LockClosedIcon className="w-4 h-4 text-yellow-400" />}</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 flex-grow">Verifica furos de roteiro e inconsistências.</p>
                        {scriptIssues.length > 0 && isPro && <p className="text-yellow-400 font-bold my-2">{scriptIssues.length} problemas encontrados</p>}
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => handleFeatureClick(() => setActiveAnalysis('script'))} className="flex-1 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all">Ver Detalhes</button>
                            <button onClick={() => handleFeatureClick(handleAnalyzeScript)} disabled={isAnalyzing && activeAnalysis === 'script'} className="bg-brand-primary p-2 rounded-lg hover:bg-opacity-90 transition-all"><RefreshIcon className={`w-5 h-5 ${isAnalyzing && activeAnalysis === 'script' ? 'animate-spin' : ''}`} /></button>
                        </div>
                    </div>
                    <div className="bg-brand-surface border border-brand-secondary rounded-lg p-6 flex flex-col relative">
                         {!isPro && <span className="absolute top-2 right-2 text-xs bg-yellow-500 text-black font-bold px-2 py-1 rounded">PRO</span>}
                        <h3 className="font-bold text-brand-text-primary flex items-center gap-2">Análise de Repetição {!isPro && <LockClosedIcon className="w-4 h-4 text-yellow-400" />}</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 flex-grow">Encontra palavras e frases repetitivas.</p>
                        {repetitionIssues.length > 0 && isPro && <p className="text-yellow-400 font-bold my-2">{repetitionIssues.length} repetições encontradas</p>}
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => handleFeatureClick(() => setActiveAnalysis('repetition'))} className="flex-1 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all">Ver Detalhes</button>
                            <button onClick={() => handleFeatureClick(handleAnalyzeRepetitions)} disabled={isAnalyzing && activeAnalysis === 'repetition'} className="bg-brand-primary p-2 rounded-lg hover:bg-opacity-90 transition-all"><RefreshIcon className={`w-5 h-5 ${isAnalyzing && activeAnalysis === 'repetition' ? 'animate-spin' : ''}`} /></button>
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
                <AnalysisResultsModal
                    type={activeAnalysis}
                    isAnalyzing={isAnalyzing}
                    onClose={() => setActiveAnalysis(null)}
                />
            )}
        </>
    );
};

export default AuthorTools;