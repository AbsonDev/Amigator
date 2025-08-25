import React, { useState } from 'react';
import { useStory } from '../context/StoryContext';
import { BookOpenIcon, LinkIcon, CalendarIcon } from './Icons';

interface BookSeries {
  id: string;
  title: string;
  books: any[];
  timeline: TimelineEvent[];
  sharedCharacters: string[];
  overarchingPlot: string;
}

interface TimelineEvent {
  id: string;
  bookId: string;
  chapter: string;
  event: string;
  date: string;
  characters: string[];
}

const SeriesManager: React.FC = () => {
  const { activeStory, stories } = useStory();
  const [series, setSeries] = useState<BookSeries>({
    id: 'series-1',
    title: 'Minha Série',
    books: stories || [],
    timeline: [],
    sharedCharacters: [],
    overarchingPlot: ''
  });
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [newEvent, setNewEvent] = useState({ event: '', date: '', characters: '' });

  const addTimelineEvent = () => {
    if (newEvent.event && selectedBook) {
      const event: TimelineEvent = {
        id: Date.now().toString(),
        bookId: selectedBook,
        chapter: 'Capítulo 1',
        event: newEvent.event,
        date: newEvent.date,
        characters: newEvent.characters.split(',').map(c => c.trim())
      };
      setSeries(prev => ({
        ...prev,
        timeline: [...prev.timeline, event]
      }));
      setNewEvent({ event: '', date: '', characters: '' });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-brand-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <BookOpenIcon className="w-8 h-8 text-indigo-500" />
          Gestão de Séries
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Series Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-surface/50 rounded-xl p-6 border border-brand-secondary/30">
              <h2 className="text-xl font-bold mb-4">Visão Geral da Série</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-brand-text-secondary">Título da Série</label>
                  <input
                    type="text"
                    value={series.title}
                    onChange={(e) => setSeries(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-brand-secondary/30 rounded-lg text-brand-text-primary mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-brand-text-secondary">Arco Narrativo Principal</label>
                  <textarea
                    value={series.overarchingPlot}
                    onChange={(e) => setSeries(prev => ({ ...prev, overarchingPlot: e.target.value }))}
                    placeholder="Descreva o arco narrativo que conecta todos os livros..."
                    className="w-full px-4 py-3 bg-brand-secondary/30 rounded-lg text-brand-text-primary mt-1 h-32 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Books in Series */}
            <div className="bg-brand-surface/50 rounded-xl p-6 border border-brand-secondary/30">
              <h2 className="text-xl font-bold mb-4">Livros na Série</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {series.books.map((book, index) => (
                  <div key={book.id} className="bg-brand-secondary/20 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">Volume {index + 1}</div>
                        <div className="text-lg font-bold mt-1">{book.title}</div>
                        <div className="text-sm text-brand-text-secondary mt-2">
                          {book.chapters?.length || 0} capítulos
                        </div>
                      </div>
                      <LinkIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                ))}
                
                <button className="bg-brand-secondary/20 rounded-lg p-4 border-2 border-dashed border-brand-secondary hover:border-indigo-500 transition-all">
                  <div className="text-center">
                    <div className="text-3xl mb-2">+</div>
                    <div className="text-sm">Adicionar Volume</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-brand-surface/50 rounded-xl p-6 border border-brand-secondary/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Timeline Unificada
              </h2>
              
              <div className="space-y-3 mb-6">
                {series.timeline.length === 0 ? (
                  <p className="text-brand-text-secondary text-sm">Nenhum evento na timeline</p>
                ) : (
                  series.timeline.map(event => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">{event.event}</div>
                        <div className="text-sm text-brand-text-secondary">
                          {event.date} • {event.characters.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Add Event Form */}
              <div className="border-t border-brand-secondary/30 pt-4">
                <h3 className="font-medium mb-3">Adicionar Evento</h3>
                <div className="space-y-3">
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-secondary/30 rounded-lg"
                  >
                    <option value="">Selecione o livro</option>
                    {series.books.map(book => (
                      <option key={book.id} value={book.id}>{book.title}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={newEvent.event}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event: e.target.value }))}
                    placeholder="Descrição do evento"
                    className="w-full px-3 py-2 bg-brand-secondary/30 rounded-lg"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="Data/Período"
                      className="px-3 py-2 bg-brand-secondary/30 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newEvent.characters}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, characters: e.target.value }))}
                      placeholder="Personagens (separados por vírgula)"
                      className="px-3 py-2 bg-brand-secondary/30 rounded-lg"
                    />
                  </div>
                  
                  <button
                    onClick={addTimelineEvent}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Adicionar Evento
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Shared Elements */}
          <div className="space-y-6">
            {/* Shared Characters */}
            <div className="bg-brand-surface/50 rounded-xl p-6 border border-brand-secondary/30">
              <h2 className="text-xl font-bold mb-4">Personagens Compartilhados</h2>
              
              <div className="space-y-2">
                {activeStory?.characters.map(char => (
                  <label key={char.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={series.sharedCharacters.includes(char.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeries(prev => ({
                            ...prev,
                            sharedCharacters: [...prev.sharedCharacters, char.id]
                          }));
                        } else {
                          setSeries(prev => ({
                            ...prev,
                            sharedCharacters: prev.sharedCharacters.filter(id => id !== char.id)
                          }));
                        }
                      }}
                      className="text-indigo-600"
                    />
                    <span className="text-sm">{char.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Consistency Check */}
            <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl p-6 border border-indigo-600/30">
              <h2 className="text-xl font-bold mb-4">Verificação de Consistência</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Timeline consistente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Personagens coerentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">1 aviso de continuidade</span>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Executar Análise Completa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesManager;