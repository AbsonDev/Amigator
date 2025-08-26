import React, { useState, useEffect, useRef } from 'react';
import type { Story, Character, Message } from '../../types';
import { chatWithCharacter } from '../../services/geminiService';
import Modal from '../common/Modal';
import { UserCircleIcon } from '../Icons';

interface CharacterChatModalProps {
  story: Story;
  character: Character;
  onClose: () => void;
}

const LoadingDots = () => (
    <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-0"></span>
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-brand-text-secondary rounded-full animate-bounce delay-300"></span>
    </div>
);

const CharacterChatModal: React.FC<CharacterChatModalProps> = ({ story, character, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{ role: 'character', parts: `Olá, autor. O que você quer me perguntar?` }]);
    }, [character]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', parts: input };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithCharacter(story, character, currentMessages, input);
            const characterMessage: Message = { role: 'character', parts: response };
            setMessages(prev => [...prev, characterMessage]);
        } catch (error) {
            const errorMessage: Message = { role: 'character', parts: (error as Error).message };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Conversando com ${character.name}`} className="max-w-2xl h-[80vh]">
            <header className="p-4 border-b border-brand-secondary flex-shrink-0 flex items-center gap-3">
                <img src={character.avatarUrl} alt={character.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-primary" />
                <div>
                    <h2 id="modal-title" className="text-xl font-bold font-serif text-brand-text-primary">
                        Conversando com {character.name}
                    </h2>
                    <p className="text-sm text-brand-text-secondary">Explore a mente do seu personagem. As conversas não são salvas.</p>
                </div>
            </header>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'character' && <img src={character.avatarUrl} alt={character.name} className="w-8 h-8 rounded-full object-cover" />}
                        <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-lg' : 'bg-brand-secondary text-brand-text-primary rounded-bl-lg'}`}>
                            <p className="text-sm font-serif">{msg.parts}</p>
                        </div>
                        {msg.role === 'user' && <UserCircleIcon className="w-8 h-8 text-brand-text-secondary" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start items-start gap-3">
                         <img src={character.avatarUrl} alt={character.name} className="w-8 h-8 rounded-full object-cover" />
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
                        placeholder={`Pergunte algo para ${character.name}...`}
                        className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-1 focus:ring-brand-primary outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-primary text-white font-bold p-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CharacterChatModal;