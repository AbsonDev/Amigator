import React, { useState, useMemo } from 'react';
import type { Author, Chapter } from '../types';
import { AppView } from '../types';
import { BookOpenIcon, UsersIcon, HomeIcon, PencilIcon, AgentIcon, GlobeAltIcon, ArrowDownTrayIcon, ClockIcon, ChevronDoubleLeftIcon, ChartBarIcon, PhotoIcon, FilmIcon, SpeakerWaveIcon } from './Icons';
import CharacterEditor from './CharacterEditor';
import ChapterOrganizer from './ChapterOrganizer';
import ChapterEditor from './ChapterEditor';
import AgentChatbot from './AgentChatbot';
import WorldBuilder from './WorldBuilder';
import HistoryViewer from './HistoryViewer';
import AuthorTools from './AuthorTools';
import AnalyticsDashboard from './AnalyticsDashboard';
import BookCoverGenerator from './BookCoverGenerator';
import ScreenplayConverter from './ScreenplayConverter';
import AudioNarrator from './AudioNarrator';
import { useStory } from '../context/StoryContext';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import saveAs from 'file-saver';


interface DashboardProps {
  author: Author;
  goToBookshelf: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; }> = React.memo(({ label, value }) => (
  <div className="bg-brand-surface p-6 rounded-lg border border-brand-secondary">
    <p className="text-sm font-medium text-brand-text-secondary">{label}</p>
    <p className="text-3xl font-bold text-brand-text-primary mt-1">{value}</p>
  </div>
));

const Dashboard: React.FC<DashboardProps> = ({ author, goToBookshelf }) => {
  const { activeStory, updateActiveStory } = useStory();
  const [currentView, setCurrentView] = useState<AppView>(AppView.OVERVIEW);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCoverGeneratorOpen, setIsCoverGeneratorOpen] = useState(false);

  const wordCount = useMemo(() => {
    if (!activeStory) return 0;
    return activeStory.chapters.reduce((acc, chap) => acc + chap.content.split(/\s+/).filter(Boolean).length, 0);
  }, [activeStory?.chapters]);

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!activeStory) return;
    
    updateActiveStory(story => ({
      ...story,
      actionLog: [...story.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: `Exportou a história como ${format.toUpperCase()}.`}]
    }));

    const fileName = activeStory.title.replace(/ /g, '_');
    
    if (format === 'txt') {
      const content = `${activeStory.title}\npor ${author.name}\n\n${activeStory.synopsis}\n\n` + activeStory.chapters.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${fileName}.txt`);
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFont('times', 'normal');
      doc.setFontSize(22);
      doc.text(activeStory.title, 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`por ${author.name}`, 105, 30, { align: 'center' });

      activeStory.chapters.forEach((chapter, index) => {
        if (index > 0 || activeStory.title.length > 0) doc.addPage();
        doc.setFontSize(18);
        doc.text(chapter.title, 20, 20);
        doc.setFontSize(12);
        const splitContent = doc.splitTextToSize(chapter.content, 170);
        doc.text(splitContent, 20, 30);
      });
      doc.save(`${fileName}.pdf`);
    }

    if (format === 'docx') {
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: activeStory.title, heading: HeadingLevel.TITLE }),
                    new Paragraph({ text: `por ${author.name}`, heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: activeStory.synopsis, style: "IntenseQuote" }),
                    ...activeStory.chapters.flatMap(chapter => [
                        new Paragraph({ text: chapter.title, heading: HeadingLevel.HEADING_1 }),
                        ...chapter.content.split('\n').map(paragraph => new Paragraph({
                            children: [new TextRun(paragraph)]
                        }))
                    ])
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${fileName}.docx`);
    }
    setIsExportModalOpen(false);
  };


  if (!activeStory) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando história...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (editingChapter) {
        return <ChapterEditor 
            chapter={editingChapter} 
            onBack={() => setEditingChapter(null)}
        />
    }

    switch (currentView) {
      case AppView.OVERVIEW:
        return (
          <div className="p-4 sm:p-6 md:p-8">
            <header className="flex justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-serif text-brand-text-primary">{activeStory.title}</h1>
                    <p className="text-brand-text-secondary mt-2 max-w-3xl font-serif text-lg">{activeStory.synopsis}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsCoverGeneratorOpen(true)} className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-brand-primary to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-brand-primary/30 transition-all">
                        <PhotoIcon className="w-5 h-5" />
                        Gerar Capa
                    </button>
                    <button onClick={() => setIsExportModalOpen(true)} className="flex-shrink-0 flex items-center gap-2 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-primary transition-all">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Exportar
                    </button>
                </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Contagem de Palavras" value={wordCount} />
              <StatCard label="Capítulos" value={activeStory.chapters.length} />
              <StatCard label="Personagens" value={activeStory.characters.length} />
            </div>
            <AuthorTools />
          </div>
        );
      case AppView.CHAPTERS:
        return <ChapterOrganizer onEditChapter={setEditingChapter} />;
      case AppView.CHARACTERS:
        return <CharacterEditor />;
      case AppView.WORLD:
        return <WorldBuilder />;
      case AppView.HISTORY:
        return <HistoryViewer />;
      case AppView.ANALYTICS:
        return <AnalyticsDashboard />;
      case AppView.SCREENPLAY:
        return <ScreenplayConverter />;
      case AppView.AUDIO_NARRATOR:
        return <AudioNarrator />;
      default:
        return null;
    }
  };
  
  const NavItem: React.FC<{ icon: React.ReactNode; label: string; view: AppView }> = ({ icon, label, view }) => {
    const isActive = currentView === view && !editingChapter;
    return (
        <button
            onClick={() => { setEditingChapter(null); setCurrentView(view); }}
            title={isSidebarCollapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${isSidebarCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary'}`}
        >
            {icon}
            {!isSidebarCollapsed && <span className="flex-1 text-left">{label}</span>}
        </button>
    );
  };


  return (
    <>
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <aside className={`bg-brand-surface/50 border-r border-brand-secondary flex flex-col p-4 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className={`flex items-center gap-2 p-2 mb-6 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    <PencilIcon className="w-8 h-8 text-brand-primary flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="font-bold text-xl">Escritor IA</span>}
                </div>
                <nav className="flex flex-col gap-2">
                    <NavItem icon={<HomeIcon className="w-5 h-5 flex-shrink-0"/>} label="Painel de Controle" view={AppView.OVERVIEW} />
                    <NavItem icon={<BookOpenIcon className="w-5 h-5 flex-shrink-0"/>} label="Capítulos" view={AppView.CHAPTERS} />
                    <NavItem icon={<UsersIcon className="w-5 h-5 flex-shrink-0"/>} label="Personagens" view={AppView.CHARACTERS} />
                    <NavItem icon={<GlobeAltIcon className="w-5 h-5 flex-shrink-0"/>} label="Mundo" view={AppView.WORLD} />
                    <NavItem icon={<FilmIcon className="w-5 h-5 flex-shrink-0"/>} label="Roteiro" view={AppView.SCREENPLAY} />
                    <NavItem icon={<SpeakerWaveIcon className="w-5 h-5 flex-shrink-0"/>} label="Narrador" view={AppView.AUDIO_NARRATOR} />
                    <NavItem icon={<ChartBarIcon className="w-5 h-5 flex-shrink-0"/>} label="Analytics" view={AppView.ANALYTICS} />
                    <NavItem icon={<ClockIcon className="w-5 h-5 flex-shrink-0"/>} label="Histórico" view={AppView.HISTORY} />
                </nav>
                <div className="mt-auto space-y-2">
                    <div className={`border-t border-brand-secondary pt-4 text-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
                        <p className="text-sm font-semibold text-brand-text-primary">{author.name}</p>
                        <button onClick={goToBookshelf} className="text-xs text-brand-text-secondary hover:text-brand-primary transition-colors mt-2">
                          Voltar para Estante
                        </button>
                    </div>
                    <div className={`${isSidebarCollapsed ? 'mt-2' : 'border-t border-brand-secondary pt-2'}`}>
                      <button onClick={() => setIsSidebarCollapsed(p => !p)} title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                          <ChevronDoubleLeftIcon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                          {!isSidebarCollapsed && <span className="flex-1 text-left">Recolher</span>}
                      </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
                {renderContent()}
            </main>
            
            <AgentChatbot isCollapsed={isChatCollapsed} onToggle={() => setIsChatCollapsed(p => !p)} />
        </div>
        
        {isExportModalOpen && (
             <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setIsExportModalOpen(false)}>
                <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Exportar Manuscrito</h2>
                    <p className="text-brand-text-secondary mb-6">Selecione o formato para exportar sua história.</p>
                    <div className="flex flex-col gap-3">
                       <button onClick={() => handleExport('pdf')} className="w-full text-left bg-brand-secondary p-4 rounded-lg hover:bg-brand-primary transition-colors">
                           <p className="font-bold">PDF</p>
                           <p className="text-sm text-brand-text-secondary">Ideal para compartilhamento e leitura.</p>
                       </button>
                       <button onClick={() => handleExport('docx')} className="w-full text-left bg-brand-secondary p-4 rounded-lg hover:bg-brand-primary transition-colors">
                           <p className="font-bold">DOCX (Microsoft Word)</p>
                           <p className="text-sm text-brand-text-secondary">Perfeito para enviar para editores.</p>
                       </button>
                       <button onClick={() => handleExport('txt')} className="w-full text-left bg-brand-secondary p-4 rounded-lg hover:bg-brand-primary transition-colors">
                           <p className="font-bold">TXT (Texto Plano)</p>
                           <p className="text-sm text-brand-text-secondary">Formato simples para máxima compatibilidade.</p>
                       </button>
                    </div>
                </div>
            </div>
        )}
        
        {isCoverGeneratorOpen && (
            <BookCoverGenerator 
                authorName={author.name}
                onClose={() => setIsCoverGeneratorOpen(false)}
            />
        )}
    </>
  );
};

export default Dashboard;