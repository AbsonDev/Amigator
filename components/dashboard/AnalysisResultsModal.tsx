import React, { useMemo } from 'react';
import { useStory } from '../../context/StoryContext';
import Modal from '../common/Modal';

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>;

interface AnalysisResultsModalProps {
  type: 'script' | 'repetition';
  isAnalyzing: boolean;
  onClose: () => void;
}

const AnalysisResultsModal: React.FC<AnalysisResultsModalProps> = ({ type, isAnalyzing, onClose }) => {
    const { activeStory, updateActiveStory } = useStory();
    if (!activeStory) return null;
    
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

    const title = type === 'script' ? 'Análise de Continuidade do Roteiro' : 'Análise de Repetição';

    return (
        <Modal isOpen={true} onClose={onClose} title={title} className="max-w-3xl max-h-[90vh]">
            <div className="p-6 flex flex-col h-full">
                {isAnalyzing ? (
                    <div className="text-center p-8 flex-grow flex flex-col justify-center items-center">
                        <LoadingSpinnerSmall />
                        <p className="mt-4 text-brand-text-secondary">A IA está lendo sua história...</p>
                    </div>
                ) : (
                    <>
                        <h2 id="modal-title" className="text-2xl font-bold font-serif text-brand-text-primary mb-4 flex-shrink-0">{title}</h2>
                        <div className="flex-grow overflow-y-auto pr-2">
                            {type === 'script' && (
                                <>
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
                             {type === 'repetition' && (
                                <>
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
                        </div>
                        <button onClick={onClose} className="mt-6 w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 flex-shrink-0">Fechar</button>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default AnalysisResultsModal;
