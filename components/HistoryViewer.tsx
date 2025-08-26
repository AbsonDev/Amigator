
import React, { useState } from 'react';
import type { Story, Version, StoryContent } from '../types';
import { AgentIcon, UserCircleIcon, LockClosedIcon } from './Icons';
import { useStory } from '../context/StoryContext';
import ConfirmationModal from './common/ConfirmationModal';
import { useAuthor } from '../context/AuthorContext';

interface HistoryViewerProps {
    openUpgradeModal: () => void;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ openUpgradeModal }) => {
    const { author } = useAuthor();
    const { activeStory, updateActiveStory } = useStory();
    const [activeTab, setActiveTab] = useState<'versions' | 'log'>('versions');
    const [isSaving, setIsSaving] = useState(false);
    const [versionName, setVersionName] = useState('');
    const [viewingVersion, setViewingVersion] = useState<Version | null>(null);
    const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);

    if (!activeStory || !author) return null;

    const isPro = author.subscription.tier === 'Pro';

    const handleSaveVersion = () => {
        if (!versionName.trim()) {
            alert("Por favor, dê um nome para a versão.");
            return;
        }
        
        updateActiveStory(prevStory => {
            const storyStateSnapshot: StoryContent = {
                title: prevStory.title,
                genre: prevStory.genre,
                synopsis: prevStory.synopsis,
                chapters: prevStory.chapters,
                world: prevStory.world,
                // This creates a new array of new character objects with empty avatar URLs for the snapshot
                characters: prevStory.characters.map(char => ({ ...char, avatarUrl: '' }))
            };

            const newVersion: Version = {
                id: `ver-${Date.now()}`,
                name: versionName.trim(),
                createdAt: new Date().toISOString(),
                storyState: storyStateSnapshot
            };
            return {
                ...prevStory,
                versions: [...prevStory.versions, newVersion].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
                actionLog: [...prevStory.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: `Salvou a versão '${versionName.trim()}'.`}]
            };
        });
        setVersionName('');
        setIsSaving(false);
    };

    const confirmRestoreVersion = (version: Version) => {
        updateActiveStory(prevStory => {
            const restoredCore = version.storyState;
            
            const currentCharactersMap = new Map(prevStory.characters.map(c => [c.id, c]));
            const mergedCharacters = restoredCore.characters.map(restoredChar => {
                const currentCharacter = currentCharactersMap.get(restoredChar.id);
                return {
                    ...restoredChar,
                    avatarUrl: currentCharacter ? currentCharacter.avatarUrl : '',
                };
            });

            return {
                ...prevStory,
                ...restoredCore,
                characters: mergedCharacters,
                id: prevStory.id,
                versions: prevStory.versions,
                actionLog: [...prevStory.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user' as const, action: `Restaurou a história para a versão '${version.name}'.`}],
                autosaveEnabled: prevStory.autosaveEnabled,
            };
        });
        setVersionToRestore(null);
    };

    const handleToggleAutosave = () => {
        if (!isPro) {
            openUpgradeModal();
            return;
        }
        updateActiveStory(prevStory => {
            const newAutosaveState = !prevStory.autosaveEnabled;
            return {
                ...prevStory,
                autosaveEnabled: newAutosaveState,
                actionLog: [...prevStory.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: `O salvamento automático foi ${newAutosaveState ? 'ativado' : 'desativado'}.`}]
            };
        });
    };

     const handleProFeatureClick = (action: () => void) => {
        if (isPro) {
            action();
        } else {
            openUpgradeModal();
        }
    };
    
    const sortedActionLog = [...activeStory.actionLog].reverse();
    const sortedVersions = [...activeStory.versions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <>
            <div className="p-4 sm:p-6 md:p-8">
                <h1 className="text-3xl font-bold font-serif text-brand-text-primary mb-2">Versionamento & Histórico</h1>
                <p className="text-brand-text-secondary mb-6">Acompanhe as alterações e salve pontos de restauração do seu manuscrito.</p>

                <div className="flex border-b border-brand-secondary mb-6">
                    <button onClick={() => setActiveTab('versions')} className={`px-4 py-2 font-semibold ${activeTab === 'versions' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary'}`}>
                        Versões Salvas
                    </button>
                    <button onClick={() => setActiveTab('log')} className={`px-4 py-2 font-semibold ${activeTab === 'log' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary'}`}>
                        Log de Atividades
                    </button>
                </div>

                {activeTab === 'versions' && (
                    <div>
                        <div className="bg-brand-surface p-4 rounded-lg border border-brand-secondary mb-6 relative">
                             {!isPro && <span className="absolute top-2 right-2 text-xs bg-yellow-500 text-black font-bold px-2 py-1 rounded">PRO</span>}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-brand-text-primary flex items-center gap-2">Salvar Versões Automaticamente {!isPro && <LockClosedIcon className="w-4 h-4 text-yellow-400" />}</h2>
                                    <p className="text-sm text-brand-text-secondary mt-1">Cria uma versão de backup 5 segundos após você parar de digitar no editor.</p>
                                </div>
                                <button onClick={handleToggleAutosave} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${activeStory.autosaveEnabled && isPro ? 'bg-brand-primary' : 'bg-brand-secondary'}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${activeStory.autosaveEnabled && isPro ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-brand-surface p-4 rounded-lg border border-brand-secondary mb-6 relative">
                            {!isPro && <span className="absolute top-2 right-2 text-xs bg-yellow-500 text-black font-bold px-2 py-1 rounded">PRO</span>}
                            <h2 className="font-bold text-brand-text-primary flex items-center gap-2">Criar um Ponto de Restauração Manual {!isPro && <LockClosedIcon className="w-4 h-4 text-yellow-400" />}</h2>
                            <p className="text-sm text-brand-text-secondary mt-1 mb-3">Salve o estado atual do seu livro como uma versão nomeada para poder restaurá-lo no futuro.</p>
                             {isSaving ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={versionName}
                                        onChange={(e) => setVersionName(e.target.value)}
                                        placeholder="Ex: Primeiro Rascunho Completo"
                                        className="w-full px-3 py-2 bg-brand-background border border-brand-secondary rounded-lg focus:ring-brand-primary outline-none"
                                    />
                                    <button onClick={handleSaveVersion} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">Salvar</button>
                                    <button onClick={() => setIsSaving(false)} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80">Cancelar</button>
                                </div>
                            ) : (
                                <button onClick={() => handleProFeatureClick(() => setIsSaving(true))} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                                    Salvar Versão Manual
                                </button>
                            )}
                        </div>
                        
                        <h2 className="text-xl font-bold font-serif mb-4">Histórico de Versões</h2>
                         {sortedVersions.length > 0 ? (
                            <div className="space-y-3">
                                {sortedVersions.map(version => (
                                    <div key={version.id} className="bg-brand-surface p-3 rounded-lg border border-brand-secondary flex justify-between items-center">
                                        <div>
                                            <p className={`font-semibold text-brand-text-primary ${version.name.startsWith('Autosave') ? 'italic' : ''}`}>{version.name}</p>
                                            <p className="text-xs text-brand-text-secondary">Salvo em: {new Date(version.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setViewingVersion(version)} className="text-sm bg-brand-secondary text-white font-semibold py-1.5 px-3 rounded-md hover:bg-opacity-80">Visualizar</button>
                                            <button onClick={() => handleProFeatureClick(() => setVersionToRestore(version))} className="text-sm bg-brand-primary text-white font-semibold py-1.5 px-3 rounded-md hover:bg-opacity-80">Restaurar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                            <p className="text-center text-brand-text-secondary py-10">Nenhuma versão salva ainda.</p>
                         )}
                    </div>
                )}
                
                {activeTab === 'log' && (
                    <div className="space-y-4">
                        {sortedActionLog.map(log => (
                            <div key={log.id} className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    {log.actor === 'user' ? <UserCircleIcon className="w-6 h-6 text-brand-text-secondary" /> : <AgentIcon className="w-6 h-6 text-brand-primary" />}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-brand-text-primary">
                                        <span className={`font-bold ${log.actor === 'agent' ? 'text-brand-primary' : ''}`}>{log.actor === 'user' ? 'Você' : 'Agente IA'}</span> {log.action}
                                    </p>
                                     <p className="text-xs text-brand-text-secondary">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {versionToRestore && (
                <ConfirmationModal
                    title={`Restaurar Versão "${versionToRestore.name}"?`}
                    description="Todas as alterações não salvas na versão atual serão perdidas. Esta ação não pode ser desfeita."
                    onConfirm={() => confirmRestoreVersion(versionToRestore)}
                    onCancel={() => setVersionToRestore(null)}
                />
            )}

            {viewingVersion && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setViewingVersion(null)}>
                    <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                       <header className="p-4 border-b border-brand-secondary flex-shrink-0">
                           <h2 className="text-2xl font-bold font-serif text-brand-text-primary">Visualizando: {viewingVersion.name}</h2>
                           <p className="text-sm text-brand-text-secondary">Salvo em {new Date(viewingVersion.createdAt).toLocaleString()}. Este é um modo de apenas leitura.</p>
                       </header>
                       <div className="flex-grow p-4 overflow-y-auto font-serif text-brand-text-primary">
                           <h1 className="text-3xl font-bold mb-4">{viewingVersion.storyState.title}</h1>
                           <p className="italic mb-6">{viewingVersion.storyState.synopsis}</p>
                           {viewingVersion.storyState.chapters.map(c => (
                               <div key={c.id} className="mb-6">
                                   <h2 className="text-2xl font-bold mb-2">{c.title}</h2>
                                   <p className="whitespace-pre-wrap leading-relaxed">{c.content}</p>
                               </div>
                           ))}
                       </div>
                       <footer className="p-3 border-t border-brand-secondary flex-shrink-0">
                          <button onClick={() => setViewingVersion(null)} className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90">Fechar Visualização</button>
                       </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default HistoryViewer;