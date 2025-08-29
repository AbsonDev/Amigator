import React from 'react';
import type { Author, Story } from '../../types';
import Modal from '../common/Modal';

interface StoryPreviewModalProps {
    story: Story;
    author: Author;
    onClose: () => void;
    onViewProfile: () => void;
}

const StoryPreviewModal: React.FC<StoryPreviewModalProps> = ({ story, author, onClose, onViewProfile }) => {
    const coverStyle = story.coverUrl
        ? { backgroundImage: `url(${story.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: '#3c3c3c' };

    return (
        <Modal isOpen={true} onClose={onClose} title={story.title} className="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 p-4">
                    <div style={coverStyle} className="w-full aspect-[3/4] rounded-lg shadow-lg bg-brand-secondary"></div>
                </div>
                <div className="md:col-span-2 p-6 flex flex-col">
                    <div>
                        <h2 id="modal-title" className="text-3xl font-bold font-serif text-brand-text-primary">{story.title}</h2>
                        <p className="text-lg text-brand-text-secondary mt-1">por <span className="font-semibold">{author.name}</span></p>
                        <span className="inline-block bg-brand-primary/20 text-brand-primary text-xs font-semibold px-2 py-1 rounded-full mt-2">{story.genre}</span>
                    </div>

                    <p className="font-serif italic text-brand-text-secondary my-4 flex-grow max-h-48 overflow-y-auto">
                        {story.synopsis || "Nenhuma sinopse disponível."}
                    </p>

                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                         <button onClick={onClose} className="w-full bg-brand-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors">
                            Fechar
                        </button>
                        <button onClick={onViewProfile} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors">
                            Ver Perfil do Autor
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default StoryPreviewModal;