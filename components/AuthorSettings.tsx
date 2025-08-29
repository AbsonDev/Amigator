import React, { useState } from 'react';
import { useAuthor } from '../context/AuthorContext';
import { LockClosedIcon, LinkIcon, ClipboardIcon, CheckIcon } from './Icons';

interface AuthorSettingsProps {
    openUpgradeModal: () => void;
}

const AuthorSettings: React.FC<AuthorSettingsProps> = ({ openUpgradeModal }) => {
    const { author, setAuthor, users, setUsers } = useAuthor();
    const [bio, setBio] = useState(author?.bio || '');
    const [isPublic, setIsPublic] = useState(author?.isProfilePublic || false);
    const [copied, setCopied] = useState(false);

    if (!author) return null;

    const isHobbyOrAbove = ['Hobby', 'Amador', 'Profissional'].includes(author.subscription.tier);

    const handleSave = () => {
        const updatedAuthor = { ...author, bio, isProfilePublic: isPublic };
        setAuthor(updatedAuthor);
        // Also update the main users list
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedAuthor.id ? updatedAuthor : u));
        alert('Perfil salvo com sucesso!');
    };
    
    const handleFeatureClick = (action: () => void) => {
        if (isHobbyOrAbove) {
            action();
        } else {
            openUpgradeModal();
        }
    };
    
    const shareableLink = `${window.location.origin}/?profile=${author.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareableLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl font-bold font-serif text-brand-text-primary mb-2">Configurações do Perfil de Autor</h1>
            <p className="text-brand-text-secondary mb-6">Personalize sua página pública e compartilhe seu trabalho com o mundo.</p>

            <div className="max-w-2xl mx-auto space-y-8">
                <div className={`bg-brand-surface p-6 rounded-lg border border-brand-secondary relative ${!isHobbyOrAbove && 'opacity-50'}`}>
                    {!isHobbyOrAbove && <div className="absolute inset-0 bg-black/30 rounded-lg z-10"></div>}
                    
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-brand-text-primary flex items-center gap-2">Perfil Público {!isHobbyOrAbove && <LockClosedIcon className="w-4 h-4 text-yellow-400" />}</h2>
                        <button 
                            onClick={() => handleFeatureClick(() => setIsPublic(prev => !prev))} 
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isPublic && isHobbyOrAbove ? 'bg-brand-primary' : 'bg-brand-secondary'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isPublic && isHobbyOrAbove ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <p className="text-sm text-brand-text-secondary mt-1">
                        {isPublic ? 'Seu perfil está visível para outros na Vitrine da Comunidade.' : 'Ative para que outros usuários possam ver seus livros publicados.'}
                    </p>
                    
                     <div className="mt-4">
                        <label htmlFor="bio" className="block text-sm font-medium text-brand-text-secondary mb-1">Sua Biografia</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                            placeholder="Conte um pouco sobre você e sua escrita..."
                            disabled={!isHobbyOrAbove}
                        />
                    </div>
                    
                    <div className="mt-4">
                        <label htmlFor="share-link" className="block text-sm font-medium text-brand-text-secondary mb-1">Link Compartilhável</label>
                        <div className="flex items-center gap-2">
                             <input
                                id="share-link"
                                type="text"
                                readOnly
                                value={shareableLink}
                                className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg text-brand-text-secondary"
                                disabled={!isHobbyOrAbove}
                            />
                            <button 
                                onClick={() => handleFeatureClick(handleCopyLink)} 
                                className="p-2.5 bg-brand-secondary rounded-lg hover:bg-brand-primary"
                                title="Copiar link"
                            >
                                {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button 
                        onClick={() => handleFeatureClick(handleSave)}
                        className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthorSettings;
