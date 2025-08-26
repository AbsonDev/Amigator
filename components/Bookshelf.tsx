import React, { useState, useRef, useMemo } from 'react';
import type { Story } from '../types';
import { BookOpenIcon, SparklesIcon, UploadIcon, TrashIcon } from './Icons';
import mammoth from 'mammoth';
import ConfirmationModal from './common/ConfirmationModal';
import { useAuthor } from '../context/AuthorContext';
import UpgradeModal from './UpgradeModal';

interface BookshelfProps {
    stories: Story[];
    onSelectStory: (storyId: string) => void;
    onStartNewStory: () => void;
    onImportStory: (textContent: string) => void;
    onDeleteStory: (storyId: string) => void;
}

const StoryCard: React.FC<{ story: Story; onSelect: () => void; onDelete: () => void; authorName: string }> = ({ story, onSelect, onDelete, authorName }) => {
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
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }} 
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-brand-background/60 text-white hover:bg-red-600/80 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                title="Excluir história"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
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
                <p className="mt-3 font-semibold text-brand-text-primary group-hover:text-brand-primary transition-colors">{story.title}</p>
            </button>
        </div>
    );
};

const Bookshelf: React.FC<BookshelfProps> = ({ stories, onStartNewStory, onSelectStory, onImportStory, onDeleteStory }) => {
    const { author } = useAuthor();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const subscriptionTier = author?.subscription.tier;
    const storyLimit = useMemo(() => {
        switch (subscriptionTier) {
            case 'Hobby': return 5;
            case 'Amador': return Infinity;
            case 'Profissional': return Infinity;
            default: return 1; // Free
        }
    }, [subscriptionTier]);

    const canCreateNewStory = stories.length < storyLimit;

    const handleCreateClick = () => {
        if (canCreateNewStory) {
            onStartNewStory();
        } else {
            setIsUpgradeModalOpen(true);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileContent(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = "";

        try {
            let textContent = '';
            if (file.type === "text/plain") {
                textContent = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = (e) => reject(e);
                    reader.readAsText(file);
                });
            } else if (file.name.endsWith('.docx')) {
                const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
                    reader.onerror = (e) => reject(e);
                    reader.readAsArrayBuffer(file);
                });
                const result = await mammoth.extractRawText({ arrayBuffer });
                textContent = result.value;
            } else {
                alert("Por favor, selecione um arquivo .txt ou .docx");
                return;
            }
            setFileContent(textContent);
            setFileName(file.name);
        } catch (error) {
            console.error("Error processing file:", error);
            alert("Ocorreu um erro ao processar o arquivo. Tente novamente.");
        }
    };
    
    const handleImportClick = () => {
        if (fileContent) {
            if (canCreateNewStory) {
                onImportStory(fileContent);
                handleCloseModal();
            } else {
                handleCloseModal();
                setIsUpgradeModalOpen(true);
            }
        }
    };
    
    const handleCloseModal = () => {
        setIsImportModalOpen(false);
        setFileContent(null);
        setFileName('');
    };

    const handleTriggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <div className="min-h-screen bg-brand-background text-brand-text-primary p-4 sm:p-6 md:p-8">
                <header className="flex flex-wrap justify-between items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold font-serif">Estante de {author?.name}</h1>
                        <p className="text-brand-text-secondary mt-1">Seus projetos literários em um só lugar.</p>
                    </div>
                    <div className="flex gap-2">
                         <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
                        >
                            <UploadIcon className="w-5 h-5" />
                            Importar Livro
                        </button>
                        <button
                            onClick={handleCreateClick}
                            className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                            title={!canCreateNewStory ? "Atualize seu plano para criar mais livros" : ""}
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Criar Novo Livro
                        </button>
                    </div>
                </header>

                {stories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {stories.map(story => (
                            <StoryCard 
                                key={story.id} 
                                story={story} 
                                onSelect={() => onSelectStory(story.id)}
                                onDelete={() => setStoryToDelete(story)}
                                authorName={author?.name || ''}
                            />
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
                      onDeleteStory(storyToDelete.id);
                      setStoryToDelete(null);
                  }}
                  onCancel={() => setStoryToDelete(null)}
              />
            )}

            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
                    <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Importar Manuscrito</h2>
                        <p className="text-brand-text-secondary mb-4">Envie seu livro como um arquivo de texto (.txt) ou Word (.docx). A IA analisará o conteúdo e o estruturará em capítulos automaticamente.</p>
                        
                        <div 
                            className="border-2 border-dashed border-brand-secondary rounded-lg p-8 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-secondary/20 transition-colors"
                            onClick={handleTriggerFileInput}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".txt,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="hidden"
                            />
                            <UploadIcon className="w-10 h-10 mx-auto text-brand-text-secondary mb-2" />
                            {fileName ? (
                                <p className="font-semibold text-brand-primary">{fileName}</p>
                            ) : (
                                <p className="text-brand-text-secondary">Clique ou arraste para enviar um arquivo .txt ou .docx</p>
                            )}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button onClick={handleCloseModal} className="w-full bg-brand-secondary text-brand-text-primary font-bold py-2 rounded-lg hover:bg-opacity-80">Cancelar</button>
                            <button 
                                onClick={handleImportClick} 
                                disabled={!fileContent} 
                                className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                            >
                                Importar e Analisar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isUpgradeModalOpen && <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />}
        </>
    );
};

export default Bookshelf;