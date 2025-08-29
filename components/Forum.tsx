import React, { useState, useMemo, useEffect } from 'react';
import { useAuthor } from '../context/AuthorContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { generateWeeklyChallengePrompt } from '../services/geminiService';
import type { ForumPost, ForumReply, WeeklyChallenge } from '../types';
import { SparklesIcon, ArrowUpIcon, UserCircleIcon } from './Icons';

const forumCategories = ["Geral", "Fantasia", "Ficção Científica", "Construção de Mundos", "Desenvolvimento de Personagem", "Técnicas de Escrita"];
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const Forum: React.FC = () => {
    const { author } = useAuthor();
    const [posts, setPosts] = useLocalStorage<ForumPost[]>('forum-posts', []);
    const [replies, setReplies] = useLocalStorage<ForumReply[]>('forum-replies', []);
    const [challenge, setChallenge] = useLocalStorage<WeeklyChallenge | null>('weekly-challenge', null);
    
    const [view, setView] = useState<'list' | 'post' | 'new_post'>('list');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("Geral");
    
    // States for new post/reply forms
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostCategory, setNewPostCategory] = useState('Geral');
    const [newReplyContent, setNewReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const checkAndGenerateChallenge = async () => {
            const now = new Date();
            if (!challenge || new Date(challenge.expiresAt) < now) {
                setIsGeneratingChallenge(true);
                try {
                    const prompt = await generateWeeklyChallengePrompt();
                    const expiresAt = new Date(now.getTime() + ONE_WEEK_IN_MS);
                    setChallenge({
                        id: `wc-${Date.now()}`,
                        prompt,
                        createdAt: now.toISOString(),
                        expiresAt: expiresAt.toISOString(),
                    });
                } catch (e) {
                    console.error("Failed to generate new weekly challenge", e);
                } finally {
                    setIsGeneratingChallenge(false);
                }
            }
        };
        checkAndGenerateChallenge();
    }, []);

    const handleVote = (type: 'post' | 'reply', id: string) => {
        if (!author) return;
        const updater = (item: ForumPost | ForumReply) => {
            const userHasVoted = item.upvotes.includes(author.id);
            if (userHasVoted) {
                return { ...item, upvotes: item.upvotes.filter(uid => uid !== author.id) };
            } else {
                return { ...item, upvotes: [...item.upvotes, author.id] };
            }
        };
        if (type === 'post') {
            setPosts(prev => prev.map(p => p.id === id ? updater(p) as ForumPost : p));
        } else {
            setReplies(prev => prev.map(r => r.id === id ? updater(r) as ForumReply : r));
        }
    };

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!author || !newPostTitle.trim() || !newPostContent.trim()) return;
        
        const newPost: ForumPost = {
            id: `post-${Date.now()}`,
            authorId: author.id,
            authorName: author.name,
            title: newPostTitle.trim(),
            content: newPostContent.trim(),
            category: newPostCategory,
            createdAt: new Date().toISOString(),
            upvotes: [],
            replyIds: [],
        };
        setPosts(prev => [newPost, ...prev]);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCategory('Geral');
        setView('list');
    };

    const handleCreateReply = (e: React.FormEvent, isChallenge: boolean = false) => {
        e.preventDefault();
        if (!author || !newReplyContent.trim() || !selectedPostId) return;

        const newReply: ForumReply = {
            id: `reply-${Date.now()}`,
            postId: selectedPostId,
            authorId: author.id,
            authorName: author.name,
            content: newReplyContent.trim(),
            createdAt: new Date().toISOString(),
            upvotes: [],
            isChallengeSubmission: isChallenge,
        };
        setReplies(prev => [...prev, newReply]);
        setPosts(prev => prev.map(p => p.id === selectedPostId ? { ...p, replyIds: [...p.replyIds, newReply.id] } : p));
        setNewReplyContent('');
    };

    const selectedPost = useMemo(() => posts.find(p => p.id === selectedPostId), [posts, selectedPostId]);
    const postReplies = useMemo(() => replies.filter(r => r.postId === selectedPostId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [replies, selectedPostId]);
    const challengeSubmissions = useMemo(() => replies.filter(r => r.isChallengeSubmission).sort((a,b) => b.upvotes.length - a.upvotes.length), [replies]);

    const filteredPosts = useMemo(() => {
        const sorted = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (activeCategory === "Geral") return sorted;
        return sorted.filter(p => p.category === activeCategory);
    }, [posts, activeCategory]);
    
    if (!author) return null;

    if (view === 'post' && selectedPost) {
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <button onClick={() => setView('list')} className="text-sm font-semibold text-brand-primary hover:underline mb-4">&larr; Voltar para o Fórum</button>
                <div className="bg-brand-surface p-4 rounded-lg border border-brand-secondary">
                    <span className="text-xs bg-brand-secondary/50 px-2 py-1 rounded-full font-semibold">{selectedPost.category}</span>
                    <h1 className="text-2xl font-bold font-serif mt-2">{selectedPost.title}</h1>
                    <p className="text-sm text-brand-text-secondary mt-1">Por {selectedPost.authorName} &bull; {new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                    <p className="mt-4 text-brand-text-primary whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
                <h2 className="text-xl font-bold font-serif mt-6 mb-4">Respostas ({postReplies.length})</h2>
                <div className="space-y-4">
                    {postReplies.map(reply => (
                        <div key={reply.id} className="flex gap-3">
                            <div onClick={() => handleVote('reply', reply.id)} className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${reply.upvotes.includes(author.id) ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-secondary/50 hover:bg-brand-secondary'}`}>
                                <ArrowUpIcon />
                                <span className="text-sm font-bold">{reply.upvotes.length}</span>
                            </div>
                            <div className="flex-grow bg-brand-surface p-3 rounded-lg border border-brand-secondary/50">
                                <p className="text-sm font-semibold">{reply.authorName} <span className="font-normal text-brand-text-secondary">&bull; {new Date(reply.createdAt).toLocaleDateString()}</span></p>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{reply.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                 <form onSubmit={handleCreateReply} className="mt-6 bg-brand-surface p-4 rounded-lg border border-brand-secondary">
                    <h3 className="font-bold mb-2">Deixar uma resposta</h3>
                    <textarea value={newReplyContent} onChange={e => setNewReplyContent(e.target.value)} rows={4} className="w-full p-2 bg-brand-background border border-brand-secondary rounded-lg" placeholder="Compartilhe suas ideias..."></textarea>
                    <button type="submit" className="mt-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Enviar Resposta</button>
                </form>
            </div>
        )
    }
    
    if (view === 'new_post') {
        return (
             <div className="p-4 sm:p-6 md:p-8">
                <button onClick={() => setView('list')} className="text-sm font-semibold text-brand-primary hover:underline mb-4">&larr; Voltar para o Fórum</button>
                <h1 className="text-3xl font-bold font-serif">Iniciar um Novo Tópico</h1>
                <form onSubmit={handleCreatePost} className="mt-6 space-y-4 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Título</label>
                        <input value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} className="w-full p-2 bg-brand-background border border-brand-secondary rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Categoria</label>
                        <select value={newPostCategory} onChange={e => setNewPostCategory(e.target.value)} className="w-full p-2 bg-brand-background border border-brand-secondary rounded-lg">
                            {forumCategories.map(cat => <option key={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Conteúdo</label>
                        <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} rows={8} className="w-full p-2 bg-brand-background border border-brand-secondary rounded-lg" required></textarea>
                    </div>
                    <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-5 rounded-lg">Publicar Tópico</button>
                </form>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Fórum Criativo</h1>
                    <p className="text-brand-text-secondary">Um espaço para superar o bloqueio criativo e colaborar em ideias.</p>
                </div>
                <button onClick={() => setView('new_post')} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Novo Tópico</button>
            </div>

            {/* Weekly Challenge */}
            <div className="mb-8 bg-gradient-to-r from-brand-primary/30 to-brand-surface p-6 rounded-lg border-2 border-brand-primary/50">
                <h2 className="text-2xl font-bold font-serif text-brand-text-primary flex items-center gap-2"><SparklesIcon /> Desafio da Semana</h2>
                {isGeneratingChallenge ? <p className="mt-2 italic">Gerando um novo desafio...</p> : <p className="mt-2 text-lg font-serif italic text-brand-text-primary">"{challenge?.prompt}"</p>}
                 <div className="mt-4">
                     <h3 className="font-bold mb-2">Respostas da Comunidade ({challengeSubmissions.length})</h3>
                     {challengeSubmissions.slice(0,1).map(reply => (
                         <div key={reply.id} className="bg-brand-surface/80 p-3 rounded-lg border border-brand-secondary flex gap-3">
                             <div onClick={() => handleVote('reply', reply.id)} className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${reply.upvotes.includes(author.id) ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-secondary/50 hover:bg-brand-secondary'}`}>
                                <ArrowUpIcon />
                                <span className="text-sm font-bold">{reply.upvotes.length}</span>
                            </div>
                            <div>
                               <p className="text-sm font-semibold">{reply.authorName}</p>
                               <p className="text-sm line-clamp-2">{reply.content}</p>
                            </div>
                         </div>
                     ))}
                     {/* A form to submit to the challenge could be added here */}
                 </div>
            </div>

            {/* Forum Posts */}
            <div className="flex gap-4 items-baseline">
                <h2 className="text-2xl font-bold font-serif mb-4">Tópicos Recentes</h2>
                <div className="flex-grow border-b border-brand-secondary/50"></div>
            </div>
             <div className="flex flex-wrap gap-2 mb-4">
                {forumCategories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 text-sm rounded-full font-semibold transition-colors ${activeCategory === cat ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-text-secondary hover:bg-brand-primary/20'}`}>{cat}</button>
                ))}
             </div>
             <div className="space-y-3">
                {filteredPosts.map(post => (
                    <div key={post.id} className="flex gap-3 items-center bg-brand-surface p-3 rounded-lg border border-brand-secondary/50 hover:border-brand-primary/50 transition-colors">
                        <div onClick={() => handleVote('post', post.id)} className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${post.upvotes.includes(author.id) ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-secondary/50 hover:bg-brand-secondary'}`}>
                            <ArrowUpIcon />
                            <span className="text-sm font-bold">{post.upvotes.length}</span>
                        </div>
                        <div>
                            <button onClick={() => { setSelectedPostId(post.id); setView('post');}} className="text-left">
                                <span className="text-xs bg-brand-secondary/50 px-2 py-1 rounded-full font-semibold">{post.category}</span>
                                <h3 className="font-bold text-brand-text-primary mt-1 hover:underline">{post.title}</h3>
                            </button>
                            <p className="text-xs text-brand-text-secondary">por {post.authorName} &bull; {post.replyIds.length} respostas</p>
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
};

export default Forum;
