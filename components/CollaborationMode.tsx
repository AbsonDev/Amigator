import React, { useState } from 'react';
import { useStory } from '../context/StoryContext';
import { UsersIcon, LinkIcon, ChatBubbleLeftIcon, PencilIcon } from './Icons';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'reviewer';
  avatar: string;
  lastActive: string;
  color: string;
}

const CollaborationMode: React.FC = () => {
  const { activeStory } = useStory();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Você',
      email: 'author@example.com',
      role: 'owner',
      avatar: '👤',
      lastActive: 'Agora',
      color: '#8a4fff'
    }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const generateShareLink = () => {
    const link = `https://escritor-ia.app/collaborate/${activeStory?.id}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
  };

  const inviteCollaborator = () => {
    if (inviteEmail) {
      const newCollab: Collaborator = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: 'editor',
        avatar: '👥',
        lastActive: 'Convidado',
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      };
      setCollaborators([...collaborators, newCollab]);
      setInviteEmail('');
    }
  };

  const addComment = () => {
    if (newComment) {
      setComments([...comments, {
        id: Date.now(),
        text: newComment,
        author: 'Você',
        timestamp: new Date().toLocaleString()
      }]);
      setNewComment('');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-brand-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-purple-500" />
          Modo Colaborativo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collaborators Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-surface/50 rounded-xl p-6 border border-brand-secondary/30">
              <h2 className="text-xl font-bold mb-4">Colaboradores Ativos</h2>
              
              <div className="space-y-3">
                {collaborators.map(collab => (
                  <div key={collab.id} className="flex items-center justify-between p-3 bg-brand-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        {collab.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{collab.name}</div>
                        <div className="text-xs text-brand-text-secondary">{collab.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">{collab.role}</div>
                      <div className="text-xs text-brand-text-secondary">{collab.lastActive}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Invite Form */}
              <div className="mt-6 pt-6 border-t border-brand-secondary/30">
                <h3 className="font-medium mb-3">Convidar Colaborador</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="flex-1 px-4 py-2 bg-brand-secondary/30 rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    onClick={inviteCollaborator}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Convidar
                  </button>
                </div>
              </div>

              {/* Share Link */}
              <div className="mt-4">
                <button
                  onClick={generateShareLink}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                >
                  <LinkIcon className="w-4 h-4" />
                  Gerar link de compartilhamento
                </button>
                {shareLink && (
                  <div className="mt-2 p-2 bg-brand-secondary/30 rounded text-xs">
                    {shareLink} (copiado!)
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Activity */}
            <div className="bg-brand-surface/50 rounded-xl p-6 border border-brand-secondary/30">
              <h2 className="text-xl font-bold mb-4">Atividade em Tempo Real</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">Maria</span> está editando o Capítulo 3
                    </div>
                    <div className="text-xs text-brand-text-secondary">Agora mesmo</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">João</span> adicionou um comentário
                    </div>
                    <div className="text-xs text-brand-text-secondary">Há 5 minutos</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">Ana</span> criou um novo personagem
                    </div>
                    <div className="text-xs text-brand-text-secondary">Há 15 minutos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments & Chat */}
          <div className="space-y-6">
            <div className="bg-brand-surface/50 rounded-xl p-6 border border-brand-secondary/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                Comentários
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {comments.length === 0 ? (
                  <p className="text-brand-text-secondary text-sm">Nenhum comentário ainda</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-brand-secondary/20 rounded-lg p-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-brand-text-secondary">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicionar comentário..."
                  className="flex-1 px-3 py-2 bg-brand-secondary/30 rounded-lg text-sm placeholder-brand-text-secondary focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  onClick={addComment}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Enviar
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-brand-surface/50 rounded-xl p-6 border border-brand-secondary/30">
              <h2 className="text-xl font-bold mb-4">Permissões</h2>
              
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="text-purple-600" />
                  <span>Permitir edição de capítulos</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="text-purple-600" />
                  <span>Permitir criação de personagens</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="text-purple-600" />
                  <span>Permitir exclusão de conteúdo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="text-purple-600" />
                  <span>Permitir comentários</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationMode;