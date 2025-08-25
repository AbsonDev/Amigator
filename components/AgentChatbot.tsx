import React, { useState, useEffect, useRef } from 'react';
import type { Story, Message } from '../types';
import { chatWithAgent } from '../services/geminiService';
import { AgentIcon } from './Icons';

interface AgentChatbotProps {
    story: Story;
    setStory: (updatedStory: Story) => void;
    onClose: () => void;
    logAction: (actor: 'user' | 'agent', action: string) => void;
}

const LoadingDots = () => (
    <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-0"></span>
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-300"></span>
    </div>
);

const AgentChatbot: React.FC<AgentChatbotProps> = ({ story, setStory, onClose, logAction }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize with history, adding a welcome message if history is empty
        if (story.chatHistory && story.chatHistory.length > 0) {
            setMessages(story.chatHistory);
        } else {
            setMessages([
                { role: 'model', parts: `Olá! Sou seu agente de IA. Como posso ajudar com a história "${story.title}" hoje? Você pode me pedir para alterar a sinopse, personagens, capítulos e muito mais.` }
            ]);
        }
    }, [story.id]); // Re-initialize if the story changes


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', parts: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const historyForApi = newMessages.filter(m => m.role === 'user' || m.role === 'model');
            const result = await chatWithAgent(story, historyForApi, input);
            
            const agentMessage: Message = { role: 'model', parts: result.conversationalResponse };
            
            if (result.updatedStory) {
                // The AI returns the full story object, let's ensure chat history is consistent
                const updatedStoryWithHistory = {
                    ...result.updatedStory,
                    chatHistory: [...historyForApi, agentMessage]
                };
                logAction('agent', `Atualizou a história via chat: "${input}"`);
                setStory(updatedStoryWithHistory);
                setMessages([...newMessages, agentMessage]);
            } else {
                // If AI didn't return a new story, just update the chat history
                const finalMessages = [...newMessages, agentMessage];
                const updatedStoryWithChat = {
                    ...story,
                    chatHistory: finalMessages
                };
                setStory(updatedStoryWithChat);
                setMessages(finalMessages);
            }

        } catch (error) {
            const errorMessage: Message = { role: 'model', parts: (error as Error).message };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[600px] bg-brand-surface rounded-xl shadow-2xl border border-brand-secondary flex flex-col z-50 animate-fade-in-up">
            <header className="flex items-center justify-between p-3 border-b border-brand-secondary flex-shrink-0">
                <div className="flex items-center gap-2">
                    <AgentIcon className="w-6 h-6 text-brand-primary" />
                    <h2 className="font-bold text-brand-text-primary">Agente Literário IA</h2>
                </div>
                <button onClick={onClose} className="text-brand-text-secondary text-2xl leading-none hover:text-white">&times;</button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-lg' : 'bg-brand-secondary text-brand-text-primary rounded-bl-lg'}`}>
                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.parts.replace(/\n/g, '<br />') }}></p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-[85%] p-3 rounded-2xl bg-brand-secondary text-brand-text-primary rounded-bl-lg">
                            <LoadingDots />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-brand-secondary flex-shrink-0">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Converse com seu agente..."
                        className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-1 focus:ring-brand-primary outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-primary text-white font-bold p-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                    </button>
                </div>
            </form>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AgentChatbot;