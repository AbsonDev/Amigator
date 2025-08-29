import React from 'react';
import type { Author, Story } from '../../types';
import Modal from '../common/Modal';
import { BookOpenIcon } from '../Icons';

interface PublicProfileModalProps {
    author: Author;
    stories: Story[];
    onClose: () => void;
}

const ProfileStoryCard: React.FC<{ story: Story }> = ({ story }) => {
    const coverStyle = story.coverUrl
        ? { backgroundImage: `url(${story.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: '#3c3c3c' };

    return (
        <div className="group relative w-full aspect-[3/4] rounded-md shadow-md overflow-hidden">
            <div style={coverStyle} className="absolute inset-0 bg-brand-secondary"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                 <h3 className="text-white text-sm font-bold leading-tight [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">{story.title}</h3>
            </div>
        </div>
    );
};

const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ author, stories, onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title={`Perfil de ${author.name}`} className="max-w-4xl max-h-[90vh]">
            <div className="flex flex-col h-full">
                <header className="p-6 border-b border-brand-secondary flex-shrink-0">
                    <h2 id="modal-title" className="text-3xl font-bold font-serif text-brand-text-primary">{author.name}</h2>
                    <p className="mt-2 text-brand-text-secondary font-serif italic">{author.bio || 'Este autor ainda não escreveu uma biografia.'}</p>
                </header>

                <main className="p-6 flex-grow overflow-y-auto">
                    <h3 className="text-xl font-bold font-serif mb-4">Obras Publicadas</h3>
                    {stories.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {stories.map(story => (
                                <ProfileStoryCard key={story.id} story={story} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-brand-secondary rounded-lg">
                            <BookOpenIcon className="w-12 h-12 mx-auto text-brand-secondary" />
                            <p className="mt-2 text-brand-text-secondary">Este autor ainda não publicou nenhuma obra.</p>
                        </div>
                    )}
                </main>

                 <footer className="p-4 border-t border-brand-secondary flex-shrink-0">
                    <button onClick={onClose} className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90">
                        Fechar Perfil
                    </button>
                </footer>
            </div>
        </Modal>
    );
};

export default PublicProfileModal;