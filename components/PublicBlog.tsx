import React, { useState, useEffect, useRef } from 'react';
import { blogPosts } from '../data/blogPosts';
import type { BlogPost } from '../types';
import { marked } from 'marked';
import { getAIFollowUp, generateShowDontTellAlternatives } from '../services/geminiService';
import { PencilIcon, SearchIcon, SparklesIcon, ClockIcon } from './Icons';

interface PublicBlogLayoutProps {
    onStart: () => void;
    navigateToHome: () => void;
}

const LoadingSpinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>;

const PostCard: React.FC<{ post: BlogPost, onClick: () => void }> = ({ post, onClick }) => (
    <button onClick={onClick} className="group bg-brand-surface rounded-lg border border-brand-secondary overflow-hidden text-left hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 block w-full">
        <div className="relative h-48 overflow-hidden">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        <div className="p-4">
             <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold bg-brand-secondary/50 text-brand-text-secondary px-2 py-1 rounded-full">{post.category}</span>
                <span className="flex items-center gap-1 text-brand-text-secondary"><ClockIcon className="w-4 h-4"/> {post.readTimeMinutes} min de leitura</span>
             </div>
             <h4 className="font-bold text-lg text-brand-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">{post.title}</h4>
        </div>
    </button>
);

const ShowDontTellWidget: React.FC = () => {
    const [tellingSentence, setTellingSentence] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!tellingSentence.trim()) return;
        setIsLoading(true);
        setSuggestions([]);
        try {
            const results = await generateShowDontTellAlternatives(tellingSentence);
            setSuggestions(results);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="my-8 p-6 bg-brand-surface rounded-lg border-2 border-brand-primary/50">
            <h3 className="text-xl font-bold font-serif text-brand-text-primary flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-brand-primary" /> Experimente Agora</h3>
            <p className="text-sm text-brand-text-secondary mt-1 mb-4">Escreva uma frase "contada" e veja como a IA a transforma.</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input 
                    type="text"
                    value={tellingSentence}
                    onChange={(e) => setTellingSentence(e.target.value)}
                    placeholder='Ex: "Ela estava com raiva."'
                    className="w-full px-4 py-2 bg-brand-background border border-brand-secondary rounded-lg"
                    disabled={isLoading}
                />
                <button onClick={handleGenerate} disabled={isLoading || !tellingSentence.trim()} className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center sm:w-48 disabled:opacity-50">
                    {isLoading ? <LoadingSpinner /> : 'Transformar'}
                </button>
            </div>
             {suggestions.length > 0 && (
                <div className="mt-4 space-y-2 animate-fadeInUp">
                    {suggestions.map((s, i) => (
                        <p key={i} className="p-3 bg-brand-background/50 border-l-2 border-brand-primary/50 text-brand-text-secondary font-serif italic">
                            {s}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

const ArticleView: React.FC<{ post: BlogPost; onBack: () => void; onSelectPost: (post: BlogPost) => void; }> = ({ post, onBack, onSelectPost }) => {
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const articleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (articleRef.current) {
                const element = articleRef.current;
                const rect = element.getBoundingClientRect();
                const scrollTop = -rect.top;
                const scrollHeight = element.scrollHeight - window.innerHeight;
                if (scrollTop < 0 || scrollHeight <= 0) {
                    setProgress(0);
                } else if (scrollTop > scrollHeight) {
                    setProgress(100);
                } else {
                    setProgress((scrollTop / scrollHeight) * 100);
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, [post.id]);


    useEffect(() => {
        window.scrollTo(0, 0);
    }, [post.id]);

    const handleAskAI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuestion.trim()) return;
        setIsAiLoading(true);
        setAiAnswer('');
        try {
            const answer = await getAIFollowUp(post.content, aiQuestion);
            setAiAnswer(answer);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const createMarkup = (markdownText: string) => {
       const html = marked(markdownText, { gfm: true, breaks: true });
       return { __html: html as string };
    };

    const relatedPosts = blogPosts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 2);
    const contentParts = post.content.split('<!-- WIDGET_HERE -->');

    return (
        <div className="animate-fadeInUp">
            <div className="reading-progress-bar" style={{ width: `${progress}%` }}/>
            <div ref={articleRef}>
                <div className="p-4 sm:p-6 md:p-8">
                    <button onClick={onBack} className="text-sm font-semibold text-brand-primary hover:underline mb-6">
                        &larr; Voltar para todos os recursos
                    </button>
                </div>

                <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                     <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
                        <img src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                             <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-sm font-bold bg-brand-primary/80 text-white px-3 py-1 rounded-full">{post.category}</span>
                                    <h1 className="text-3xl md:text-5xl font-bold font-serif text-white mt-4 [text-shadow:_2px_2px_4px_rgb(0_0_0_/_60%)]">{post.title}</h1>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1 text-white/90 font-semibold [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)]">
                                    <ClockIcon className="w-5 h-5"/> {post.readTimeMinutes} min de leitura
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    <div 
                        className="prose-chat font-serif text-lg leading-relaxed text-brand-text-primary" 
                        dangerouslySetInnerHTML={createMarkup(contentParts[0])}
                    />

                    {post.interactiveWidget === 'show-dont-tell' && <ShowDontTellWidget />}

                    {contentParts[1] && (
                         <div 
                            className="prose-chat font-serif text-lg leading-relaxed text-brand-text-primary" 
                            dangerouslySetInnerHTML={createMarkup(contentParts[1])}
                        />
                    )}

                    {post.summaryPoints && (
                        <div className="mt-12 p-6 bg-brand-surface rounded-lg border border-brand-secondary">
                            <h3 className="text-xl font-bold font-serif text-brand-text-primary mb-3">Pontos-Chave</h3>
                            <ul className="space-y-2 list-disc list-inside text-brand-text-secondary">
                                {post.summaryPoints.map((point, index) => (
                                    <li key={index} className="font-serif">{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </article>

                {/* AI Mentor Section */}
                <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-brand-secondary px-4 sm:px-6 md:px-8">
                    <h2 className="text-2xl font-bold font-serif flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-brand-primary" /> Pergunte ao Mentor de IA</h2>
                    <p className="text-brand-text-secondary mt-2 mb-4">Tem alguma dúvida sobre este artigo? Peça um esclarecimento ou um exemplo prático.</p>
                    <form onSubmit={handleAskAI} className="flex gap-2">
                        <input 
                            type="text"
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            placeholder="Ex: Como posso aplicar isso em uma cena de fantasia?"
                            className="w-full px-4 py-2 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                            disabled={isAiLoading}
                        />
                        <button type="submit" disabled={isAiLoading || !aiQuestion.trim()} className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center w-32">
                            {isAiLoading ? <LoadingSpinner /> : 'Perguntar'}
                        </button>
                    </form>
                    {aiAnswer && (
                        <div className="mt-4 p-4 bg-brand-surface rounded-lg border border-brand-primary/50 animate-fadeInUp">
                            <p className="text-brand-text-primary font-serif whitespace-pre-wrap">{aiAnswer}</p>
                        </div>
                    )}
                </div>

                {/* Related Articles Section */}
                {relatedPosts.length > 0 && (
                    <div className="max-w-7xl mx-auto mt-12 py-12 border-t border-brand-secondary bg-brand-surface/50">
                        <h2 className="text-2xl font-bold font-serif mb-6 text-center">Artigos Relacionados</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
                            {relatedPosts.map(p => (
                               <PostCard key={p.id} post={p} onClick={() => onSelectPost(p)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const BlogListView: React.FC<{ onSelectPost: (post: BlogPost) => void }> = ({ onSelectPost }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = activeCategory ? post.category === activeCategory : true;
        const matchesSearch = searchTerm.trim() === '' ? true :
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    const categories = [...new Set(blogPosts.map(p => p.category))];

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Recursos para Autores</h1>
            <p className="text-brand-text-secondary mb-8">Artigos e dicas para aprimorar sua escrita.</p>

            <div className="mb-8 space-y-4">
                <div className="relative">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar artigos..."
                        className="w-full px-4 py-3 pl-10 bg-brand-surface border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveCategory(null)} className={`px-3 py-1.5 text-sm rounded-full font-semibold transition-colors ${activeCategory === null ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-text-primary hover:bg-brand-primary/20'}`}>
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 text-sm rounded-full font-semibold transition-colors ${activeCategory === cat ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-text-primary hover:bg-brand-primary/20'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} onClick={() => onSelectPost(post)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg">
                    <h3 className="text-xl font-semibold text-brand-text-primary">Nenhum artigo encontrado.</h3>
                    <p className="text-brand-text-secondary mt-2">Tente ajustar seus filtros ou termo de pesquisa.</p>
                </div>
            )}
        </div>
    );
};

const PublicBlogLayout: React.FC<PublicBlogLayoutProps> = ({ onStart, navigateToHome }) => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        const updateStateFromUrl = () => {
            const params = new URLSearchParams(window.location.search);
            const postId = params.get('blog');
            if (postId && postId !== 'true') {
                const post = blogPosts.find(p => p.id === postId);
                setSelectedPost(post || null);
            } else {
                setSelectedPost(null);
            }
        };
        updateStateFromUrl();
        window.addEventListener('popstate', updateStateFromUrl);
        return () => window.removeEventListener('popstate', updateStateFromUrl);
    }, []);

    const handleSelectPost = (post: BlogPost) => {
        setSelectedPost(post);
        window.history.pushState({ postId: post.id }, post.title, `?blog=${post.id}`);
    };

    const handleGoBackToList = () => {
        setSelectedPost(null);
        window.history.pushState({}, 'Recursos', `?blog=true`);
    };

    return (
         <div className="bg-brand-background text-brand-text-primary font-sans min-h-screen">
            <header className="sticky top-0 p-4 flex justify-between items-center z-50 bg-brand-background/80 backdrop-blur-md border-b border-brand-secondary/50">
                <button onClick={navigateToHome} className="flex items-center gap-2">
                    <PencilIcon className="w-8 h-8 text-brand-primary" />
                    <span className="font-bold text-xl">Escritor IA</span>
                </button>
                <nav className="flex items-center gap-6 text-sm font-semibold">
                    <button onClick={navigateToHome} className="text-brand-text-secondary hover:text-brand-primary transition-colors">Início</button>
                    <span className="text-brand-primary font-bold">Recursos</span>
                </nav>
                <button
                    onClick={onStart}
                    className="bg-brand-secondary text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-primary transition-colors text-sm"
                >
                    Acessar App
                </button>
            </header>
            <main>
               {selectedPost ? (
                    <ArticleView post={selectedPost} onBack={handleGoBackToList} onSelectPost={handleSelectPost} />
               ) : (
                    <BlogListView onSelectPost={handleSelectPost} />
               )}
            </main>
        </div>
    );
};

export default PublicBlogLayout;