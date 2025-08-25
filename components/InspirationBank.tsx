import React, { useState, useEffect } from 'react';
import { BookmarkIcon, TagIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon } from './Icons';

interface InspirationItem {
  id: string;
  type: 'quote' | 'scene' | 'dialogue' | 'description' | 'idea';
  content: string;
  tags: string[];
  source?: string;
  createdAt: string;
  color: string;
}

const InspirationBank: React.FC = () => {
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [newItem, setNewItem] = useState({ content: '', tags: '', type: 'idea' });
  const [isAdding, setIsAdding] = useState(false);

  // Load items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('inspirationBank');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save items to localStorage
  useEffect(() => {
    localStorage.setItem('inspirationBank', JSON.stringify(items));
  }, [items]);

  // Add new item
  const addItem = () => {
    if (!newItem.content.trim()) return;

    const item: InspirationItem = {
      id: Date.now().toString(),
      type: newItem.type as any,
      content: newItem.content,
      tags: newItem.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      color: getRandomColor()
    };

    setItems([item, ...items]);
    setNewItem({ content: '', tags: '', type: 'idea' });
    setIsAdding(false);
  };

  // Delete item
  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification in real app
  };

  // Get random color for cards
  const getRandomColor = () => {
    const colors = [
      'from-blue-500/20 to-blue-600/20',
      'from-purple-500/20 to-purple-600/20',
      'from-green-500/20 to-green-600/20',
      'from-yellow-500/20 to-yellow-600/20',
      'from-pink-500/20 to-pink-600/20',
      'from-indigo-500/20 to-indigo-600/20'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Type icons
  const typeIcons: Record<string, string> = {
    quote: '💬',
    scene: '🎬',
    dialogue: '🗣️',
    description: '🖼️',
    idea: '💡'
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-40"
        title="Banco de Inspiração"
      >
        <BookmarkIcon className="w-6 h-6" />
      </button>

      {/* Sidebar Panel */}
      <div className={`fixed left-0 top-0 h-full w-96 bg-brand-surface/95 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-brand-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookmarkIcon className="w-6 h-6 text-purple-400" />
                Banco de Inspiração
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-brand-secondary/30 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar inspiração..."
                className="w-full pl-10 pr-3 py-2 bg-brand-secondary/30 rounded-lg text-sm placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-brand-secondary/30 text-brand-text-secondary hover:bg-brand-secondary/50'
                }`}
              >
                Todos
              </button>
              {Object.entries(typeIcons).map(([type, icon]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    selectedType === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-brand-secondary/30 text-brand-text-secondary hover:bg-brand-secondary/50'
                  }`}
                >
                  {icon} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Add New Button */}
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full p-3 border-2 border-dashed border-brand-secondary/50 rounded-lg hover:border-purple-500 transition-all flex items-center justify-center gap-2 text-brand-text-secondary hover:text-purple-400"
              >
                <PlusIcon className="w-5 h-5" />
                Adicionar Inspiração
              </button>
            )}

            {/* Add New Form */}
            {isAdding && (
              <div className="p-3 bg-brand-secondary/30 rounded-lg space-y-3">
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-secondary/50 rounded text-sm"
                >
                  <option value="idea">💡 Ideia</option>
                  <option value="quote">💬 Citação</option>
                  <option value="scene">🎬 Cena</option>
                  <option value="dialogue">🗣️ Diálogo</option>
                  <option value="description">🖼️ Descrição</option>
                </select>
                
                <textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="Digite sua inspiração..."
                  className="w-full px-3 py-2 bg-brand-secondary/50 rounded text-sm h-20 resize-none"
                />
                
                <input
                  type="text"
                  value={newItem.tags}
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                  placeholder="Tags (separadas por vírgula)"
                  className="w-full px-3 py-2 bg-brand-secondary/50 rounded text-sm"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={addItem}
                    className="flex-1 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 bg-brand-secondary/50 rounded hover:bg-brand-secondary/70"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Items */}
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`p-3 bg-gradient-to-r ${item.color} rounded-lg border border-brand-secondary/30 hover:border-purple-500/50 transition-all group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{typeIcons[item.type]}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => copyToClipboard(item.content)}
                      className="p-1 hover:bg-brand-secondary/30 rounded"
                      title="Copiar"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 hover:bg-red-500/30 rounded"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-brand-text-primary mb-2">{item.content}</p>
                
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-brand-secondary/30 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-brand-text-secondary mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && !isAdding && (
              <div className="text-center py-8 text-brand-text-secondary">
                <p>Nenhuma inspiração encontrada</p>
                <p className="text-sm mt-2">Adicione suas ideias, citações e trechos favoritos!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InspirationBank;