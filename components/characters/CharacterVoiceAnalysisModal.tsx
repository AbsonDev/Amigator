import React, { useMemo } from 'react';
import type { Character, CharacterVoiceDeviation } from '../../types';
import { useStory } from '../../context/StoryContext';
import Modal from '../common/Modal';

interface CharacterVoiceAnalysisModalProps {
  character: Character;
  onClose: () => void;
}

const CharacterVoiceAnalysisModal: React.FC<CharacterVoiceAnalysisModalProps> = ({ character, onClose }) => {
    const { activeStory, updateActiveStory } = useStory();
    if (!activeStory) return null;
    
    const analysis = useMemo(() => activeStory.analysis.characterVoices[character.id] || { results: [], ignored: [], lastAnalyzed: null }, [activeStory.analysis.characterVoices, character.id]);

    const deviations = useMemo(() => analysis.results.filter(
        d => !analysis.ignored.includes(d.dialogueSnippet)
    ), [analysis.results, analysis.ignored]);
    
    const handleIgnore = (deviation: CharacterVoiceDeviation) => {
        updateActiveStory(story => {
            const charVoiceAnalysis = story.analysis.characterVoices[character.id] || { results: [], ignored: [], lastAnalyzed: null };
            return {
                ...story,
                analysis: {
                    ...story.analysis,
                    characterVoices: {
                        ...story.analysis.characterVoices,
                        [character.id]: {
                            ...charVoiceAnalysis,
                            ignored: [...new Set([...charVoiceAnalysis.ignored, deviation.dialogueSnippet])]
                        }
                    }
                }
            };
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Análise de Voz: ${character.name}`} className="max-w-3xl max-h-[90vh]">
            <div className="p-6 flex flex-col h-full">
                <header className="flex-shrink-0 mb-4">
                    <h2 id="modal-title" className="text-2xl font-bold font-serif text-brand-text-primary">Análise de Voz: {character.name}</h2>
                    <p className="text-sm text-brand-text-secondary">
                        A IA encontrou {deviations.length} falas que podem ser inconsistentes com a voz estabelecida do personagem.
                        {analysis.lastAnalyzed && ` (Analisado em: ${new Date(analysis.lastAnalyzed).toLocaleString()})`}
                    </p>
                </header>

                <div className="flex-grow overflow-y-auto pr-2">
                    {deviations.length > 0 ? (
                        <div className="space-y-4">
                            {deviations.map((d, index) => (
                                <div key={index} className="bg-brand-background p-4 rounded-lg border border-brand-secondary">
                                    <blockquote className="border-l-4 border-brand-primary pl-3 italic text-brand-text-primary font-serif">
                                        "{d.dialogueSnippet}"
                                    </blockquote>
                                    <p className="text-sm text-brand-text-secondary mt-2"><strong className="text-brand-text-primary">Explicação da IA:</strong> {d.explanation}</p>
                                    <div className="mt-2 flex justify-between items-center">
                                         <span className="text-xs bg-brand-secondary px-2 py-1 rounded-full">{d.chapterTitle}</span>
                                        <button onClick={() => handleIgnore(d)} className="text-xs font-semibold text-brand-text-secondary hover:text-white transition-colors px-3 py-1">Ignorar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-lg font-semibold text-brand-text-primary">Nenhuma inconsistência encontrada!</p>
                            <p className="text-brand-text-secondary mt-2">A voz de {character.name} parece consistente em toda a história.</p>
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 flex-shrink-0">Fechar</button>
            </div>
        </Modal>
    );
};

export default CharacterVoiceAnalysisModal;
