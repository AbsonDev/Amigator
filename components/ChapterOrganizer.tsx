import React, { useState } from 'react';
import type { Chapter, BetaReadingRequest } from '../types';
import { useStory } from '../context/StoryContext';
import { useAuthor } from '../context/AuthorContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { PencilIcon, BookOpenIcon, ChatBubbleLeftRightIcon } from './Icons';
import EditableField from './common/EditableField';
import Modal from './common/Modal';

const feedbackOptions = ["Ritmo", "Diálogo", "Clareza da Trama", "Consistência dos Personagens", "Impressão Geral"];

const SubmitForReviewModal: React.FC<{ chapter: Chapter, onClose: () => void }> = ({ chapter, onClose }) => {
    const { activeStory } = useStory();
    const { author, setAuthor } = useAuthor();
    const [requests, setRequests] = useLocalStorage<BetaReadingRequest[]>('beta-reading-requests', []);
    const [feedbackSought, setFeedbackSought] = useState<string[]>([]);
    
    if (!activeStory || !author) return null;

    const handleToggleFeedback = (option: string) => {
        setFeedbackSought(prev => 
            prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
        );
    };

    const handleSubmit = () => {
        if (feedbackSought.length === 0) {
            alert("Por favor, selecione pelo menos um tipo de feedback que você procura.");
            return;
        }
        if (author.feedbackCredits < 1) {
            alert("Você não tem créditos de feedback suficientes. Revise o capítulo de outro autor para ganhar mais.");
            return;
        }
        const alreadySubmitted = requests.some(req => req.chapterId === chapter.id && req.status !== 'completed');
        if (alreadySubmitted) {
            alert("Este capítulo já foi submetido para revisão.");
            return;
        }
        
        const wordCount = (chapter.content.match(/\S+/g) || []).length;

        const newRequest: BetaReadingRequest = {
            id: `beta-${Date.now()}`,
            authorId: author.id,
            authorName: author.name,
            storyId: activeStory.id,
            chapterId: chapter.id,
            storyGenre: activeStory.genre,
            chapterTitle: chapter.title,
            wordCount: wordCount,
            feedbackSought: feedbackSought,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            feedback: [],
        };

        setRequests(prev => [...prev, newRequest]);
        setAuthor(prev => prev ? ({ ...prev, feedbackCredits: prev.feedbackCredits - 1 }) : null);
        alert("Capítulo submetido para revisão com sucesso!");
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Submeter para Leitura Beta">
            <div className="p-6">
                 <h2 id="modal-title" className="text-2xl font-bold font-serif text-brand-text-primary mb-2">Submeter "{chapter.title}"</h2>
                 <p className="text-brand-text-secondary mb-4">Selecione as áreas em que você gostaria de receber feedback. A submissão custará 1 crédito de feedback. Você tem {author.feedbackCredits} crédito(s).</p>

                <div className="space-y-2">
                    <h3 className="font-semibold text-brand-text-primary">Que tipo de feedback você procura?</h3>
                    <div className="flex flex-wrap gap-2">
                        {feedbackOptions.map(option => (
                            <button key={option} onClick={() => handleToggleFeedback(option)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${feedbackSought.includes(option) ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-text-primary'}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="w-full bg-brand-secondary text-brand-text-primary font-bold py-2 rounded-lg hover:bg-opacity-80 transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} disabled={author.feedbackCredits < 1} className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50">
                        Submeter (Custo: 1 Crédito)
                    </button>
                </div>
            </div>
        </Modal>
    );
};


interface ChapterOrganizerProps {
    onEditChapter: (chapter: Chapter) => void;
}

const ChapterOrganizer: React.FC<ChapterOrganizerProps> = ({ onEditChapter }) => {
  const { activeStory, updateActiveStory } = useStory();
  const { author } = useAuthor();
  const [reviewChapter, setReviewChapter] = useState<Chapter | null>(null);

  if (!activeStory || !author) return null;
  
  const isProTier = ['Amador', 'Profissional'].includes(author.subscription.tier);

  const handleUpdateChapter = (chapterId: string, field: 'title' | 'summary', value: string) => {
    updateActiveStory(story => ({
        ...story,
        chapters: story.chapters.map(c =>
            c.id === chapterId ? { ...c, [field]: value } : c
        )
    }));
  };

  return (
    <>
    <div className="p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Estrutura de Capítulos</h1>
            {/* Future "Add Chapter" button can go here */}
        </div>
        {activeStory.chapters.length > 0 ? (
            <div className="space-y-4">
                {activeStory.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="bg-brand-surface p-4 rounded-lg border border-brand-secondary flex flex-col sm:flex-row justify-between sm:items-center transition-all hover:border-brand-primary/50 hover:shadow-lg gap-4">
                        <div className="flex items-start sm:items-center gap-4 flex-grow">
                            <span className="text-lg font-bold text-brand-primary self-start mt-1">
                               {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-grow">
                                <EditableField
                                    as="h3"
                                    initialValue={chapter.title}
                                    onSave={(newTitle) => handleUpdateChapter(chapter.id, 'title', newTitle)}
                                    className="font-semibold text-brand-text-primary"
                                    inputClassName="w-full text-lg"
                                />
                                <EditableField
                                    as="p"
                                    initialValue={chapter.summary}
                                    onSave={(newSummary) => handleUpdateChapter(chapter.id, 'summary', newSummary)}
                                    className="text-sm text-brand-text-secondary font-serif italic"
                                    inputClassName="w-full text-sm"
                                    multiline
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            {isProTier && (
                                <button
                                    onClick={() => setReviewChapter(chapter)}
                                    className="flex items-center gap-2 bg-brand-secondary text-brand-text-primary font-semibold py-2 px-3 rounded-lg hover:bg-teal-500 hover:text-white transition-colors"
                                    title="Submeter para Leitura Beta"
                                >
                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => onEditChapter(chapter)}
                                className="flex items-center gap-2 bg-brand-secondary text-brand-text-primary font-semibold py-2 px-3 rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
                            >
                               <PencilIcon className="w-4 h-4"/>
                               Abrir Editor
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 border-2 border-dashed border-brand-secondary rounded-lg">
                <BookOpenIcon className="w-16 h-16 mx-auto text-brand-secondary" />
                <h2 className="mt-4 text-xl font-semibold">Nenhum capítulo encontrado.</h2>
                <p className="mt-2 text-brand-text-secondary">Seus capítulos aparecerão aqui quando forem criados.</p>
            </div>
        )}
    </div>
    {reviewChapter && <SubmitForReviewModal chapter={reviewChapter} onClose={() => setReviewChapter(null)} />}
    </>
  );
}

export default ChapterOrganizer;