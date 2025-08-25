import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import { chatWithAgent } from '../services/geminiService';
import { AgentIcon, ChevronDoubleRightIcon } from './Icons';
import { useStory } from '../context/StoryContext';
import { marked } from 'marked';

interface AgentChatbotProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const LoadingDots = () => (
    <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-0"></span>
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-300"></span>
    </div>
);

const AgentChatbot: React.FC<AgentChatbotProps> = ({ isCollapsed, onToggle }) => {
    const { activeStory, updateActiveStory } = useStory();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!activeStory) return;
        if (activeStory.chatHistory && activeStory.chatHistory.length > 0) {
            setMessages(activeStory.chatHistory);
        } else {
            setMessages([
                { role: 'model', parts: `Olá! Sou seu agente de IA. Como posso ajudar com a história "${activeStory.title}" hoje? Você pode me pedir para alterar a sinopse, personagens, capítulos e muito mais.` }
            ]);
        }
    }, [activeStory?.id, activeStory?.title, activeStory?.chatHistory]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      if(!isCollapsed) {
        scrollToBottom();
      }
    }, [messages, isCollapsed]);
    
    const createMarkup = (markdownText: string) => {
      const html = marked.parse(markdownText, {
        gfm: true,
        breaks: true,
        mangle: false,
        headerIds: false,
      });
      return { __html: html as string };
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !activeStory) return;

        const userMessage: Message = { role: 'user', parts: input };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setInput('');
        setIsLoading(true);

        try {
            const historyForApi = currentMessages.filter(m => m.role === 'user' || m.role === 'model');
            const result = await chatWithAgent(activeStory, historyForApi, input);
            
            const agentMessage: Message = { role: 'model', parts: result.conversationalResponse };
            
            updateActiveStory(prevStory => {
                const finalMessages = [...historyForApi, agentMessage];
                
                if (result.updatedStory) {
                    return {
                        ...result.updatedStory,
                        chatHistory: finalMessages,
                        actionLog: [...prevStory.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'agent', action: `Atualizou a história via chat: "${input}"`}]
                    };
                } else {
                    return {
                        ...prevStory,
                        chatHistory: finalMessages
                    };
                }
            });

        } catch (error) {
            const errorMessage: Message = { role: 'model', parts: (error as Error).message };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className={`flex-shrink-0 h-full bg-brand-surface/80 backdrop-blur-sm border-l border-brand-secondary flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-96'}`}>
            {isCollapsed ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <button 
                        onClick={onToggle} 
                        className="flex flex-col items-center justify-center text-center p-4 text-brand-text-secondary hover:text-brand-primary transition-colors h-full w-full"
                        title="Abrir Agente IA"
                    >
                        <AgentIcon className="w-8 h-8 mb-4" />
                        <span className="font-semibold text-sm" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            Agente IA
                        </span>
                    </button>
                </div>
            ) : (
                <>
                    <header className="flex items-center justify-between p-4 border-b border-brand-secondary flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <AgentIcon className="w-6 h-6 text-brand-primary" />
                            <h2 className="font-bold text-brand-text-primary">Agente Literário IA</h2>
                        </div>
                        <button onClick={onToggle} title="Recolher Agente" className="text-brand-text-secondary hover:text-brand-primary">
                           <ChevronDoubleRightIcon className="w-6 h-6" /> 
                        </button>
                    </header>
                    
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-lg' : 'bg-brand-secondary text-brand-text-primary rounded-bl-lg'}`}>
                                    <div className="prose-chat text-sm" dangerouslySetInnerHTML={createMarkup(msg.parts)}></div>
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
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                            </button>
                        </div>
                    </form>
                </>
            )}
        </aside>
    );
};

export default AgentChatbot;