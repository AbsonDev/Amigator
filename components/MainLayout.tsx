import React, { useState, useMemo, useRef } from 'react';
import { MainAppView, BetaReadingRequest, BetaFeedback, Story } from '../types';
import { BookOpenIcon, UsersIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon, UserCircleIcon, JournalBookmarkIcon, ArrowLeftOnRectangleIcon, SparklesIcon, UploadIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './Icons';
import Bookshelf from './Bookshelf';
import Showcase from './Showcase';
import Forum from './Forum';
import Resources from './Resources';
import AuthorSettings from './AuthorSettings';
import UpgradeModal from './UpgradeModal';
import mammoth from 'mammoth';
import useClickSpark from '../hooks/useClickSpark';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuthor } from '../context/AuthorContext';
import { useStory } from '../context/StoryContext';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isCollapsed: boolean; isActive: boolean; onClick: () => void; }> = ({ icon, label, isCollapsed, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full text-left p-3 rounded-md transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-brand-secondary hover:text-brand-text-primary'}`}
    >
        <span className="flex-shrink-0">{icon}</span>
        {!isCollapsed && <span className="font-semibold">{label}</span>}
    </button>
);

const BetaReaderHub: React.FC = () => {
    const { author, setAuthor } = useAuthor();
    const { stories } = useStory();
    const [requests, setRequests] = useLocalStorage<BetaReadingRequest[]>('beta-reading-requests', []);
    const [activeTab, setActiveTab] = useState<'review' | 'my_reviews' | 'my_submissions'>('review');
    const [reviewingRequest, setReviewingRequest] = useState<BetaReadingRequest | null>(null);

    // Feedback form state
    const [strengths, setStrengths] = useState('');
    const [improvements, setImprovements] = useState('');
    const [specificNotes, setSpecificNotes] = useState('');

    if (!author) return null;

    const handleClaim = (requestId: string) => {
        setRequests(prev => prev.map(req => 
            req.id === requestId 
            ? { ...req, status: 'claimed', claimedBy: { id: author.id, name: author.name } }
            : req
        ));
    };

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewingRequest || (!strengths.trim() && !improvements.trim() && !specificNotes.trim())) {
            alert("Por favor, preencha pelo menos um campo de feedback.");
            return;
        }

        const newFeedback: BetaFeedback = {
            id: `fb-${Date.now()}`,
            reviewerId: author.id,
            reviewerName: author.name,
            strengths,
            improvements,
            specificNotes,
            submittedAt: new Date().toISOString(),
        };

        setRequests(prev => prev.map(req => 
            req.id === reviewingRequest.id 
            ? { ...req, status: 'completed', feedback: [...req.feedback, newFeedback] }
            : req
        ));

        // Award credit to reviewer
        setAuthor(prev => prev ? ({ ...prev, feedbackCredits: prev.feedbackCredits + 1 }) : null);

        // Reset state
        setReviewingRequest(null);
        setStrengths('');
        setImprovements('');
        setSpecificNotes('');
        alert("Feedback enviado com sucesso! Você ganhou 1 crédito de feedback.");
    };

    const availableToReview = requests.filter(req => req.status === 'pending' && req.authorId !== author.id);
    const myActiveReviews = requests.filter(req => req.status === 'claimed' && req.claimedBy?.id === author.id);
    const mySubmissions = requests.filter(req => req.authorId === author.id);

    if (reviewingRequest) {
        const story = stories.find(s => s.id === reviewingRequest.storyId);
        const chapter = story?.chapters.find(c => c.id === reviewingRequest.chapterId);
        if (!story || !chapter) {
            return <div className="p-8 text-center text-red-500">Erro: Não foi possível carregar o capítulo para revisão.</div>;
        }

        return (
            <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                 <div>
                    <button onClick={() => setReviewingRequest(null)} className="mb-4 text-sm font-semibold text-brand-primary hover:underline">
                        &larr; Voltar para a lista de revisões
                    </button>
                    <h2 className="text-2xl font-bold font-serif">{chapter.title}</h2>
                    <p className="text-brand-text-secondary">de {reviewingRequest.authorName}</p>
                    <div className="mt-4 p-4 bg-brand-background border border-brand-secondary rounded-lg h-[60vh] overflow-y-auto font-serif" dangerouslySetInnerHTML={{ __html: chapter.content }}></div>
                </div>
                <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-4">
                     <div>
                        <h3 className="text-xl font-bold font-serif mb-2">Seu Feedback</h3>
                        <p className="text-sm text-brand-text-secondary mb-2">O autor procura feedback sobre: <span className="font-semibold text-brand-primary">{reviewingRequest.feedbackSought.join(', ')}</span></p>
                    </div>
                    <div className="flex-grow flex flex-col gap-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Pontos Fortes</label>
                            <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={5} className="w-full p-2 bg-brand-background border border-brand-secondary rounded-lg"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Pontos a Melhorar</label>
                            <textarea value={improvements} onChange={e => setImprovements(e.target.value)} rows={5} className="w-full p-2 bg-brand-background border border-brand-secondary rounded-lg"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Notas Específicas (com base no que o autor pediu)</label>
                            <textarea value={specificNotes} onChange={e => setSpecificNotes(e.target.value)} rows={5} className="w-full p-2 bg-brand-background border border-brand-secondary rounded-lg"></textarea>
                        </div>
                    </div>
                    <button type="submit" className="bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90">Enviar Feedback & Ganhar 1 Crédito</button>
                </form>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Círculos de Leitura Beta</h1>
                    <p className="text-brand-text-secondary">Ajude outros autores e ganhe créditos para ter seus próprios capítulos revisados.</p>
                </div>
                <div className="bg-brand-surface p-2 rounded-lg border border-brand-secondary font-bold text-brand-primary">
                    Créditos: {author.feedbackCredits}
                </div>
            </div>
            
             <div className="flex border-b border-brand-secondary mb-6">
                <button onClick={() => setActiveTab('review')} className={`px-4 py-2 font-semibold ${activeTab === 'review' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary'}`}>Para Revisar</button>
                <button onClick={() => setActiveTab('my_reviews')} className={`px-4 py-2 font-semibold ${activeTab === 'my_reviews' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary'}`}>Minhas Revisões</button>
                <button onClick={() => setActiveTab('my_submissions')} className={`px-4 py-2 font-semibold ${activeTab === 'my_submissions' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary'}`}>Meus Envios</button>
            </div>

            {activeTab === 'review' && (
                availableToReview.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableToReview.map(req => (
                        <div key={req.id} className="bg-brand-surface p-4 rounded-lg border border-brand-secondary flex flex-col">
                            <h3 className="font-bold">{req.chapterTitle}</h3>
                            <p className="text-sm text-brand-text-secondary">de {req.authorName}</p>
                            <div className="text-xs my-2"><span className="font-semibold bg-brand-secondary/50 px-2 py-1 rounded-full">{req.storyGenre}</span> <span className="ml-2">{req.wordCount.toLocaleString('pt-BR')} palavras</span></div>
                            <p className="text-xs text-brand-text-secondary flex-grow">Feedback procurado: {req.feedbackSought.join(', ')}</p>
                            <button onClick={() => handleClaim(req.id)} className="mt-4 w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90">Reivindicar para Ler</button>
                        </div>
                    ))}
                </div>) : <p className="text-center text-brand-text-secondary py-10">Nenhum capítulo disponível para revisão no momento.</p>
            )}

             {activeTab === 'my_reviews' && (
                myActiveReviews.length > 0 ? (
                <div className="space-y-4">
                    {myActiveReviews.map(req => (
                        <div key={req.id} className="bg-brand-surface p-4 rounded-lg border border-brand-secondary flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{req.chapterTitle}</h3>
                                <p className="text-sm text-brand-text-secondary">de {req.authorName} ({req.storyGenre})</p>
                            </div>
                            <button onClick={() => setReviewingRequest(req)} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">Continuar Revisão</button>
                        </div>
                    ))}
                </div>) : <p className="text-center text-brand-text-secondary py-10">Você não tem nenhuma revisão ativa.</p>
            )}

            {activeTab === 'my_submissions' && (
                mySubmissions.length > 0 ? (
                 <div className="space-y-4">
                    {mySubmissions.map(req => (
                         <div key={req.id} className="bg-brand-surface p-4 rounded-lg border border-brand-secondary">
                             <div className="flex justify-between items-start">
                                 <div>
                                    <h3 className="font-bold">{req.chapterTitle}</h3>
                                    <p className="text-sm text-brand-text-secondary">Enviado em: {new Date(req.submittedAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : req.status === 'claimed' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {req.status === 'pending' ? 'Aguardando Revisor' : req.status === 'claimed' ? `Em revisão por ${req.claimedBy?.name}` : 'Completo'}
                                </span>
                             </div>
                             {req.status === 'completed' && req.feedback.map(fb => (
                                 <div key={fb.id} className="mt-4 border-t border-brand-secondary pt-4">
                                     <h4 className="font-semibold text-sm">Feedback de {fb.reviewerName}</h4>
                                     <div className="text-sm mt-2 space-y-2 text-brand-text-secondary">
                                        <p><strong>Pontos Fortes:</strong> {fb.strengths}</p>
                                        <p><strong>A Melhorar:</strong> {fb.improvements}</p>
                                        <p><strong>Notas:</strong> {fb.specificNotes}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    ))}
                 </div>) : <p className="text-center text-brand-text-secondary py-10">Você ainda não submeteu nenhum capítulo para revisão.</p>
            )}
        </div>
    );
};


const MainLayout: React.FC = () => {
    const { author, logout } = useAuthor();
    const { stories, startNewStory, importStory } = useStory();
    const [currentView, setCurrentView] = useState<MainAppView>(MainAppView.BOOKSHELF);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Click Spark effects for buttons
    const createNewBookBtnRef = useRef<HTMLButtonElement>(null);
    useClickSpark(createNewBookBtnRef);

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
            startNewStory();
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
                textContent = await file.text();
            } else if (file.name.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
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
                importStory(fileContent);
                handleCloseImportModal();
            } else {
                handleCloseImportModal();
                setIsUpgradeModalOpen(true);
            }
        }
    };
    
    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
        setFileContent(null);
        setFileName('');
    };

    const handleTriggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const renderMainView = () => {
        switch (currentView) {
            case MainAppView.BOOKSHELF:
                return <Bookshelf />;
            case MainAppView.SHOWCASE:
                return <Showcase />;
            case MainAppView.BETA_READER_HUB:
                return <BetaReaderHub />;
            case MainAppView.FORUM:
                return <Forum />;
            case MainAppView.RESOURCES:
                return <Resources />;
            case MainAppView.PROFILE:
                return <AuthorSettings openUpgradeModal={() => setIsUpgradeModalOpen(true)} />;
            default:
                return <Bookshelf />;
        }
    };
    
     const viewTitles: Record<MainAppView, string> = {
        [MainAppView.BOOKSHELF]: `Estante de ${author?.name}`,
        [MainAppView.SHOWCASE]: 'Vitrine da Comunidade',
        [MainAppView.BETA_READER_HUB]: 'Círculos de Leitura',
        [MainAppView.FORUM]: 'Fórum Criativo',
        [MainAppView.RESOURCES]: 'Recursos para Autores',
        [MainAppView.PROFILE]: 'Meu Perfil',
    };

    return (
        <div className="flex h-screen bg-brand-background text-brand-text-primary overflow-hidden">
            <nav className={`bg-brand-surface border-r border-brand-secondary flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="flex items-center justify-between p-4 h-16 border-b border-brand-secondary">
                    {!isSidebarCollapsed && <span className="font-bold text-lg">{author?.name}</span>}
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-md hover:bg-brand-secondary">
                        {isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
                    </button>
                </div>
                <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                    <NavItem icon={<BookOpenIcon />} label="Estante" isCollapsed={isSidebarCollapsed} isActive={currentView === MainAppView.BOOKSHELF} onClick={() => setCurrentView(MainAppView.BOOKSHELF)} />
                    <NavItem icon={<UsersIcon />} label="Vitrine" isCollapsed={isSidebarCollapsed} isActive={currentView === MainAppView.SHOWCASE} onClick={() => setCurrentView(MainAppView.SHOWCASE)} />
                    <NavItem icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} label="Leitura Beta" isCollapsed={isSidebarCollapsed} isActive={currentView === MainAppView.BETA_READER_HUB} onClick={() => setCurrentView(MainAppView.BETA_READER_HUB)} />
                    <NavItem icon={<QuestionMarkCircleIcon className="w-6 h-6" />} label="Fórum" isCollapsed={isSidebarCollapsed} isActive={currentView === MainAppView.FORUM} onClick={() => setCurrentView(MainAppView.FORUM)} />
                    <NavItem icon={<JournalBookmarkIcon />} label="Recursos" isCollapsed={isSidebarCollapsed} isActive={currentView === MainAppView.RESOURCES} onClick={() => setCurrentView(MainAppView.RESOURCES)} />
                    <NavItem icon={<UserCircleIcon />} label="Meu Perfil" isCollapsed={isSidebarCollapsed} isActive={currentView === MainAppView.PROFILE} onClick={() => setCurrentView(MainAppView.PROFILE)} />
                </div>
                <div className="p-2 border-t border-brand-secondary flex-shrink-0">
                    <NavItem icon={<ArrowLeftOnRectangleIcon />} label="Sair" isCollapsed={isSidebarCollapsed} isActive={false} onClick={logout} />
                </div>
            </nav>
            <main className="flex-grow flex flex-col overflow-hidden">
                <header className="flex-shrink-0 h-16 sm:h-24 p-4 sm:p-6 flex flex-wrap justify-between items-center gap-4 border-b border-brand-secondary">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold font-serif">{viewTitles[currentView]}</h1>
                    </div>
                     <div className="flex items-center gap-2">
                         <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
                        >
                            <UploadIcon className="w-5 h-5" />
                            Importar
                        </button>
                        <button
                            onClick={handleCreateClick}
                            ref={createNewBookBtnRef}
                            className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                            title={!canCreateNewStory ? "Atualize seu plano para criar mais livros" : ""}
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Criar Novo
                        </button>
                    </div>
                </header>
                <div className="flex-grow overflow-y-auto">
                    {renderMainView()}
                </div>
            </main>
            
            {/* Modals */}
             {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={handleCloseImportModal}>
                    <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Importar Manuscrito</h2>
                        <p className="text-brand-text-secondary mb-4">Envie seu livro como um arquivo de texto (.txt) ou Word (.docx). A IA analisará o conteúdo e o estruturará.</p>
                        
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
                            <button onClick={handleCloseImportModal} className="w-full bg-brand-secondary text-brand-text-primary font-bold py-2 rounded-lg hover:bg-opacity-80">Cancelar</button>
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
        </div>
    );
};

export default MainLayout;