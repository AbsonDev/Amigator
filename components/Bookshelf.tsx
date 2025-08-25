import React, { useState, useRef } from 'react';
import type { Author, Story } from '../types';
import { BookOpenIcon, SparklesIcon, UploadIcon } from './Icons';
import mammoth from 'mammoth';

interface BookshelfProps {
    author: Author;
    stories: Story[];
    onSelectStory: (storyId: string) => void;
    onStartNewStory: () => void;
    onImportStory: (textContent: string) => void;
}

const StoryCard: React.FC<{ story: Story; onSelect: () => void }> = ({ story, onSelect }) => {
    const pseudoRandomColor = (seed: string) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return "#" + "00000".substring(0, 6 - c.length) + c;
    }
    
    const coverColor = pseudoRandomColor(story.id);

    return (
        <button onClick={onSelect} className="text-left group perspective">
            <div className="relative w-full h-80 rounded-lg shadow-lg transform-style-3d group-hover:rotate-y-10 transition-transform duration-500">
                <div style={{ backgroundColor: coverColor, backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)` }} className="absolute w-full h-full backface-hidden rounded-lg border-2 border-white/20 flex flex-col justify-center items-center p-4 text-center">
                    <BookOpenIcon className="w-12 h-12 text-white opacity-60 mb-4" />
                    <h3 className="text-2xl font-bold font-serif text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">{story.title}</h3>
                    <p className="text-sm text-white/80 mt-2 italic line-clamp-3">{story.synopsis}</p>
                </div>
            </div>
            <p className="mt-3 font-semibold text-brand-text-primary group-hover:text-brand-primary transition-colors">{story.title}</p>
        </button>
    );
};

const Bookshelf: React.FC<BookshelfProps> = ({ author, stories, onStartNewStory, onSelectStory, onImportStory }) => {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileContent(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = "";

        try {
            let textContent = '';
            // Normalize file extension to lowercase for case-insensitive comparison
            const fileName = file.name.toLowerCase();
            
            if (file.type === "text/plain" || fileName.endsWith('.txt')) {
                textContent = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = (e) => reject(e);
                    reader.readAsText(file);
                });
            } else if (fileName.endsWith('.docx')) {
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
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            console.error("Error processing file:", errorMessage, error);
            alert(`Erro ao processar o arquivo: ${errorMessage}. Por favor, verifique se o arquivo está no formato correto e tente novamente.`);
        }
    };
    
    const handleImportClick = () => {
        if (fileContent) {
            onImportStory(fileContent);
            handleCloseModal();
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
                        <h1 className="text-4xl font-bold font-serif">Estante de {author.name}</h1>
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
                            onClick={onStartNewStory}
                            className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Criar Novo Livro
                        </button>
                    </div>
                </header>

                {stories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {stories.map(story => (
                            <StoryCard key={story.id} story={story} onSelect={() => onSelectStory(story.id)} />
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
        </>
    );
};

export default Bookshelf;