import React, { useState, useMemo } from 'react';
import type { Story } from '../types';
import { BookOpenIcon, EyeIcon, TrashIcon } from './Icons';
import mammoth from 'mammoth';
import ConfirmationModal from './common/ConfirmationModal';
import { useAuthor } from '../context/AuthorContext';
import { useStory } from '../context/StoryContext';
import UpgradeModal from './UpgradeModal';
import useClickSpark from '../hooks/useClickSpark';

interface StoryCardProps { 
    story: Story; 
    onSelect: () => void; 
    onDelete: () => void; 
    onTogglePublish: () => void;
    canPublish: boolean;
    authorName: string 
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onSelect, onDelete, onTogglePublish, canPublish, authorName }) => {
    const pseudoRandomColor = (seed: string) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return "#" + "00000".substring(0, 6 - c.length) + c;
    }
    
    const coverColor = useMemo(() => pseudoRandomColor(story.id), [story.id]);
    const coverStyle = story.coverUrl
        ? { backgroundImage: `url(${story.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: coverColor, backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)` };

    const fontClass = story.coverTypography?.fontFamily === 'serif' ? 'font-serif' : 'font-sans';
    const colorClass = story.coverTypography?.color === 'light' 
        ? 'text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]' 
        : 'text-brand-background [text-shadow:_1px_1px_2px_rgb(255_255_255_/_50%)]';

    return (
        <div className="relative group perspective">
             <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                    className="p-2 rounded-full bg-brand-background/60 text-white hover:bg-red-600/80 backdrop-blur-sm"
                    title="Excluir história"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
                {canPublish && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); onTogglePublish(); }} 
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${story.isPublished ? 'bg-green-500/80 text-white' : 'bg-brand-background/60 text-white hover:bg-green-500/80'}`}
                        title={story.isPublished ? "Remover da Vitrine" : "Publicar na Vitrine"}
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                )}
             </div>
            <button onClick={onSelect} className="w-full text-left">
                <div className="relative w-full h-80 rounded-lg shadow-lg transform-style-3d group-hover:rotate-y-10 transition-transform duration-500">
                    <div style={coverStyle} className="absolute w-full h-full backface-hidden rounded-lg border-2 border-white/20 flex flex-col justify-between items-center p-4 text-center">
                       {story.coverUrl && story.coverTypography ? (
                            <>
                                <div className="w-full flex-grow flex items-center justify-center p-2">
                                    <h3 className={`text-3xl lg:text-4xl font-bold leading-tight ${fontClass} ${colorClass}`}>{story.title}</h3>
                                </div>
                                <div className="w-full p-2">
                                     <p className={`text-lg ${fontClass} ${colorClass}`}>{authorName}</p>
                                </div>
                            </>
                        ) : (
                             <>
                                <BookOpenIcon className="w-12 h-12 text-white opacity-60 mt-8" />
                                <div className={`mt-auto w-full p-2 bg-black/40 rounded-b-md`}>
                                    <h3 className="text-2xl font-bold font-serif text-white">{story.title}</h3>
                                </div>
                             </>
                        )}
                    </div>
                </div>
                <p className="mt-3 font-semibold text-brand-text-primary group-hover:text-brand-primary transition-colors flex items-center gap-2">
                    {story.isPublished && <EyeIcon className="w-4 h-4 text-green-400" />}
                    {story.title}
                </p>
            </button>
        </div>
    );
};

const Bookshelf: React.FC = () => {
    const { author } = useAuthor();
    const { stories, selectStory, deleteStory, updateStory } = useStory();
    const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

    const subscriptionTier = author?.subscription.tier;
    const canPublish = useMemo(() => ['Hobby', 'Amador', 'Profissional'].includes(subscriptionTier || 'Free'), [subscriptionTier]);

    const handleTogglePublish = (storyId: string, currentStatus: boolean) => {
        updateStory(storyId, (story) => ({ ...story, isPublished: !currentStatus }));
    };

    return (
        <>
            <div className="p-4 sm:p-6 md:p-8">
                {stories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {stories.map((story, index) => (
                            <div
                                key={story.id}
                                className="animate-fadeInUp opacity-0"
                                style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'forwards' }}
                            >
                                <StoryCard 
                                    story={story} 
                                    onSelect={() => selectStory(story.id)}
                                    onDelete={() => setStoryToDelete(story)}
                                    onTogglePublish={() => handleTogglePublish(story.id, story.isPublished)}
                                    canPublish={canPublish}
                                    authorName={author?.name || ''}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-brand-secondary rounded-lg mt-10">
                        <BookOpenIcon className="w-16 h-16 mx-auto text-brand-secondary" />
                        <h2 className="mt-4 text-xl font-semibold text-brand-text-primary">Sua estante está vazia.</h2>
                        <p className="mt-2 text-brand-text-secondary">Clique em "Criar Novo Livro" ou "Importar Livro" para começar.</p>
                    </div>
                )}
            </div>
            
            {storyToDelete && (
              <ConfirmationModal
                  title={`Excluir "${storyToDelete.title}"?`}
                  description="Esta ação é permanente e não pode ser desfeita. Todo o conteúdo da história, incluindo capítulos, personagens e versões, será excluído."
                  confirmText="Sim, Excluir"
                  onConfirm={() => {
                      deleteStory(storyToDelete.id);
                      setStoryToDelete(null);
                  }}
                  onCancel={() => setStoryToDelete(null)}
              />
            )}
        </>
    );
};

export default Bookshelf;