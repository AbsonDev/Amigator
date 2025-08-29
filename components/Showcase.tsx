import React, { useState, useMemo } from 'react';
import { useAuthor } from '../context/AuthorContext';
import { useStory } from '../context/StoryContext';
import type { Story, Author } from '../types';
import StoryPreviewModal from './showcase/StoryPreviewModal';
import PublicProfileModal from './showcase/PublicProfileModal';
import { BookOpenIcon, SparklesIcon } from './Icons';

const StoryCoverCard: React.FC<{ story: Story, author: Author, onSelect: () => void }> = ({ story, author, onSelect }) => {
    const coverStyle = story.coverUrl
        ? { backgroundImage: `url(${story.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: '#3c3c3c' };

    const fontClass = story.coverTypography?.fontFamily === 'serif' ? 'font-serif' : 'font-sans';
    const colorClass = story.coverTypography?.color === 'light' 
        ? 'text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]' 
        : 'text-brand-background [text-shadow:_1px_1px_2px_rgb(255_255_255_/_50%)]';
    
    return (
        <button onClick={onSelect} className="group relative w-full aspect-[3/4] rounded-lg shadow-lg overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-2xl">
            <div style={coverStyle} className="absolute inset-0 flex flex-col justify-end p-4 bg-brand-secondary">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                 <div className="relative z-10">
                    <h3 className={`text-xl font-bold leading-tight ${fontClass} ${colorClass}`}>{story.title}</h3>
                    <p className={`text-sm mt-1 ${fontClass} ${colorClass} opacity-80`}>{author.name}</p>
                 </div>
            </div>
        </button>
    );
};

const Showcase: React.FC = () => {
    const { users } = useAuthor();
    const { stories } = useStory();
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [viewingAuthor, setViewingAuthor] = useState<Author | null>(null);

    const publicAuthors = useMemo(() => {
        const authorMap = new Map<string, Author>();
        users.filter(u => u.isProfilePublic).forEach(u => authorMap.set(u.id, u));
        return authorMap;
    }, [users]);

    const publicStories = useMemo(() => {
        return stories.filter(s => s.isPublished && publicAuthors.has(s.authorId));
    }, [stories, publicAuthors]);
    
    const featuredStories = useMemo(() => {
        return [...publicStories].sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [publicStories]);
    
    const handleViewAuthorProfile = (authorId: string) => {
        const author = publicAuthors.get(authorId);
        if (author) {
            setSelectedStory(null);
            setViewingAuthor(author);
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6 md:p-8">
                <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Vitrine da Comunidade</h1>
                <p className="text-brand-text-secondary mb-8">Descubra novas histórias e autores da nossa comunidade de escritores.</p>

                {publicStories.length > 0 ? (
                    <>
                        {/* Featured Works */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold font-serif flex items-center gap-2 mb-4">
                                <SparklesIcon className="w-6 h-6 text-yellow-400" />
                                Obras em Destaque
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {featuredStories.map(story => {
                                    const author = publicAuthors.get(story.authorId);
                                    if (!author) return null;
                                    return (
                                        <StoryCoverCard 
                                            key={story.id} 
                                            story={story} 
                                            author={author}
                                            onSelect={() => setSelectedStory(story)}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* All Works Gallery */}
                        <div>
                            <h2 className="text-2xl font-bold font-serif mb-4">Todas as Obras Publicadas</h2>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                                {publicStories.map(story => {
                                    const author = publicAuthors.get(story.authorId);
                                    if (!author) return null;
                                    return (
                                        <StoryCoverCard 
                                            key={story.id} 
                                            story={story} 
                                            author={author}
                                            onSelect={() => setSelectedStory(story)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg">
                        <BookOpenIcon className="w-16 h-16 mx-auto text-brand-secondary" />
                        <h2 className="mt-4 text-xl font-semibold text-brand-text-primary">A vitrine está vazia.</h2>
                        <p className="mt-2 text-brand-text-secondary">Quando os autores publicarem suas obras, elas aparecerão aqui.</p>
                    </div>
                )}
            </div>
            
            {selectedStory && (
                <StoryPreviewModal
                    story={selectedStory}
                    author={publicAuthors.get(selectedStory.authorId)!}
                    onClose={() => setSelectedStory(null)}
                    onViewProfile={() => handleViewAuthorProfile(selectedStory.authorId)}
                />
            )}
            
            {viewingAuthor && (
                <PublicProfileModal
                    author={viewingAuthor}
                    stories={publicStories.filter(s => s.authorId === viewingAuthor.id)}
                    onClose={() => setViewingAuthor(null)}
                />
            )}
        </>
    );
};

export default Showcase;