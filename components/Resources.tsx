import React, { useState } from 'react';
import { blogPosts } from '../data/blogPosts';
import type { BlogPost } from '../types';
import { marked } from 'marked';
import { ClockIcon } from './Icons';

const ArticleView: React.FC<{ post: BlogPost; onBack: () => void; }> = ({ post, onBack }) => {
     const createMarkup = (markdownText: string) => {
        const html = marked(markdownText, { gfm: true, breaks: true });
        return { __html: html as string };
    };
    return (
        <div className="animate-fadeInUp">
            <button onClick={onBack} className="text-sm font-semibold text-brand-primary hover:underline mb-6">
                &larr; Voltar para todos os recursos
            </button>
            <div className="max-w-4xl mx-auto">
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8">
                    <img src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 md:p-8">
                        <span className="text-sm font-bold bg-brand-primary/80 text-white px-3 py-1 rounded-full">{post.category}</span>
                        <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mt-4 [text-shadow:_1px_1px_3px_rgb(0_0_0_/_40%)]">{post.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-brand-text-secondary border-y border-brand-secondary py-3 mb-8">
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-5 h-5"/>
                        <span className="font-semibold">{post.readTimeMinutes} min de leitura</span>
                    </div>
                </div>

                <div 
                    className="prose-chat font-serif text-lg leading-relaxed text-brand-text-primary" 
                    dangerouslySetInnerHTML={createMarkup(post.content)}
                />
            </div>
        </div>
    );
};

const PostCard: React.FC<{ post: BlogPost, onClick: () => void }> = ({ post, onClick }) => (
    <button onClick={onClick} className="group bg-brand-surface rounded-lg border border-brand-secondary overflow-hidden text-left hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 block w-full">
        <div className="relative h-48 overflow-hidden">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
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


const Resources: React.FC = () => {
    const [posts] = useState<BlogPost[]>(blogPosts);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    if (selectedPost) {
        return <div className="p-4 sm:p-6 md:p-8"><ArticleView post={selectedPost} onBack={() => setSelectedPost(null)} /></div>;
    }

    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Recursos para Autores</h1>
            <p className="text-brand-text-secondary mb-8">Artigos e dicas para aprimorar sua escrita.</p>

            {posts.length === 0 && (
                <div className="text-center py-20 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg">
                    <h2 className="text-xl font-semibold">Nenhum recurso encontrado.</h2>
                    <p className="mt-2 text-brand-text-secondary">Parece que a IA ainda não escreveu nenhum artigo. Tente recarregar a página.</p>
                </div>
            )}

            {featuredPost && (
                 <div className="mb-12">
                     <h2 className="text-2xl font-bold font-serif mb-4">Em Destaque</h2>
                     <button 
                        onClick={() => setSelectedPost(featuredPost)} 
                        className="group block w-full text-left bg-brand-surface rounded-lg border border-brand-secondary hover:border-brand-primary transition-colors overflow-hidden md:flex"
                    >
                        <div className="md:w-1/2 lg:w-3/5 h-64 md:h-auto overflow-hidden">
                            <img src={featuredPost.imageUrl} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <div className="md:w-1/2 lg:w-2/5 p-6 flex flex-col justify-center">
                            <span className="text-sm font-bold bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full self-start">{featuredPost.category}</span>
                            <h2 className="text-2xl md:text-3xl font-bold font-serif mt-3 text-brand-text-primary group-hover:text-brand-primary transition-colors">{featuredPost.title}</h2>
                            <div className="flex items-center gap-1 text-sm text-brand-text-secondary mt-2"><ClockIcon className="w-4 h-4"/> {featuredPost.readTimeMinutes} min de leitura</div>
                            <p className="text-brand-text-secondary mt-2 line-clamp-3 font-serif">{featuredPost.content.substring(0, 200).replace(/\*/g, '')}...</p>
                        </div>
                    </button>
                 </div>
            )}
            
            {otherPosts.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold font-serif mb-4">Mais Artigos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherPosts.map(post => (
                           <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resources;