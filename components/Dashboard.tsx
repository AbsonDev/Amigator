import React, { useState, useMemo } from 'react';
import type { Chapter } from '../types';
import { AppView } from '../types';
import { BookOpenIcon, UsersIcon, HomeIcon, PencilIcon, GlobeAltIcon, ArrowDownTrayIcon, ClockIcon, ChevronDoubleLeftIcon, LockClosedIcon, WandSparklesIcon, PhotoIcon, NetworkIcon, ChevronDoubleRightIcon } from './Icons';
import CharacterEditor from './CharacterEditor';
import ChapterOrganizer from './ChapterOrganizer';
import ChapterEditor from './ChapterEditor';
import AgentChatbot from './AgentChatbot';
import WorldBuilder from './WorldBuilder';
import HistoryViewer from './HistoryViewer';
import AuthorTools from './AuthorTools';
import { useStory } from '../context/StoryContext';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import saveAs from 'file-saver';
import { useAuthor } from '../context/AuthorContext';
import UpgradeModal from './UpgradeModal';
import CoverDesigner from './CoverDesigner';
import PlotVisualizer from './PlotVisualizer';


interface DashboardProps {
  goToBookshelf: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
  <div className="bg-brand-surface p-6 rounded-lg border border-brand-secondary">
    <p className="text-sm font-medium text-brand-text-secondary">{label}</p>
    <p className="text-3xl font-bold text-brand-text-primary mt-1">{value}</p>
  </div>
);

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isCollapsed: boolean; isActive: boolean; onClick: () => void; }> = ({ icon, label, isCollapsed, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full text-left p-3 rounded-md transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-brand-secondary hover:text-brand-text-primary'}`}
    >
        <span className="flex-shrink-0">{icon}</span>
        {!isCollapsed && <span className="font-semibold">{label}</span>}
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ goToBookshelf }) => {
  const { author } = useAuthor();
  const { activeStory, updateActiveStory } = useStory();
  const [currentView, setCurrentView] = useState<AppView>(AppView.OVERVIEW);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const stripHtml = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
  };

  const wordCount = useMemo(() => {
    if (!activeStory) return 0;
    return activeStory.chapters.reduce((acc, chap) => acc + stripHtml(chap.content).split(/\s+/).filter(Boolean).length, 0);
  }, [activeStory?.chapters]);

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setCurrentView(AppView.EDIT_CHAPTER);
  };

  const handleBackToChapters = () => {
    setEditingChapter(null);
    setCurrentView(AppView.CHAPTERS);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (author && ['Free', 'Hobby'].includes(author.subscription.tier) && (format === 'pdf' || format === 'docx')) {
      setIsExportModalOpen(false);
      setIsUpgradeModalOpen(true);
      return;
    }
    if (!activeStory) return;
    
    updateActiveStory(story => ({
      ...story,
      actionLog: [...story.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: `Exportou a história como ${format.toUpperCase()}.`}]
    }));

    const fileName = activeStory.title.replace(/ /g, '_');

    if (format === 'txt') {
      const content = `${activeStory.title}\npor ${author?.name}\n\n${activeStory.synopsis}\n\n` + activeStory.chapters.map(c => `## ${c.title}\n\n${stripHtml(c.content)}`).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${fileName}.txt`);
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFont('times', 'normal');
      doc.setFontSize(22);
      doc.text(activeStory.title, 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`por ${author?.name}`, 105, 30, { align: 'center' });

      activeStory.chapters.forEach((chapter, index) => {
        if (index > 0) doc.addPage();
        doc.setFontSize(18);
        doc.text(chapter.title, 20, 20);
        doc.setFontSize(12);
        const splitContent = doc.splitTextToSize(stripHtml(chapter.content), 170);
        doc.text(splitContent, 20, 30);
      });
      doc.save(`${fileName}.pdf`);
    }

    if (format === 'docx') {
        const doc = new Document({
            creator: author?.name || "Simulador de Escritor IA",
            title: activeStory.title,
            description: activeStory.synopsis,
            sections: [{
                children: [
                    new Paragraph({ text: activeStory.title, heading: HeadingLevel.TITLE }),
                    new Paragraph({ text: `por ${author?.name || ''}`, heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: activeStory.synopsis, style: "IntenseQuote" }),
                    ...activeStory.chapters.flatMap(chapter => [
                        new Paragraph({ text: chapter.title, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
                        ...stripHtml(chapter.content).split('\n').map(p => new Paragraph({ text: p }))
                    ])
                ]
            }]
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${fileName}.docx`);
    }
    setIsExportModalOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.OVERVIEW:
        return (
          <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-4xl font-bold font-serif text-brand-text-primary">{activeStory?.title}</h1>
            <p className="text-brand-text-secondary font-serif italic mt-2">{activeStory?.synopsis}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <StatCard label="Contagem de Palavras" value={wordCount.toLocaleString('pt-BR')} />
              <StatCard label="Capítulos" value={activeStory?.chapters.length || 0} />
              <StatCard label="Personagens" value={activeStory?.characters.length || 0} />
            </div>
            <AuthorTools openUpgradeModal={() => setIsUpgradeModalOpen(true)} />
          </div>
        );
      case AppView.CHAPTERS:
        return <ChapterOrganizer onEditChapter={handleEditChapter} />;
      case AppView.CHARACTERS:
        return <CharacterEditor />;
      case AppView.EDIT_CHAPTER:
        return editingChapter ? <ChapterEditor chapter={editingChapter} onBack={handleBackToChapters} /> : null;
      case AppView.WORLD:
        return <WorldBuilder />;
      case AppView.HISTORY:
        return <HistoryViewer openUpgradeModal={() => setIsUpgradeModalOpen(true)} />;
      case AppView.COVER_DESIGN:
        return <CoverDesigner />;
      case AppView.PLOT:
        return <PlotVisualizer />;
      default:
        return null;
    }
  };

  if (!activeStory) {
      return (
          <div className="h-screen flex items-center justify-center text-center">
              <div>
                <h2 className="text-2xl font-bold">História não encontrada</h2>
                <p className="text-brand-text-secondary mt-2">Parece que a história que você estava vendo não existe mais.</p>
                <button onClick={goToBookshelf} className="mt-4 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Voltar para a Estante</button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-brand-background text-brand-text-primary overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className={`bg-brand-surface border-r border-brand-secondary flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center justify-center p-4 h-16 border-b border-brand-secondary">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-md hover:bg-brand-secondary">
            {isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex-grow p-2 space-y-1 overflow-y-auto">
          <NavItem icon={<HomeIcon />} label="Painel" isCollapsed={isSidebarCollapsed} isActive={currentView === AppView.OVERVIEW} onClick={() => setCurrentView(AppView.OVERVIEW)} />
          <NavItem icon={<PencilIcon />} label="Capítulos" isCollapsed={isSidebarCollapsed} isActive={currentView === AppView.CHAPTERS || currentView === AppView.EDIT_CHAPTER} onClick={() => setCurrentView(AppView.CHAPTERS)} />
          <NavItem icon={<UsersIcon />} label="Personagens" isCollapsed={isSidebarCollapsed} isActive={currentView === AppView.CHARACTERS} onClick={() => setCurrentView(AppView.CHARACTERS)} />
          <NavItem icon={<GlobeAltIcon />} label="Mundo" isCollapsed={isSidebarCollapsed} isActive={currentView === AppView.WORLD} onClick={() => setCurrentView(AppView.WORLD)} />
          <NavItem icon={<NetworkIcon className="w-6 h-6" />} label="Trama" isCollapsed={isSidebarCollapsed} isActive={currentView === AppView.PLOT} onClick={() => setCurrentView(AppView.PLOT)} />
          <NavItem icon={<PhotoIcon />} label="Capa" isCollapsed={isSidebarCollapsed} isActive={currentView === AppView.COVER_DESIGN} onClick={() => setCurrentView(AppView.COVER_DESIGN)} />
          <NavItem icon={<ClockIcon />} label="Histórico" isCollapsed={isSidebarCollapsed} isActive={currentView === AppView.HISTORY} onClick={() => setCurrentView(AppView.HISTORY)} />
        </div>
        <div className="p-2 border-t border-brand-secondary flex-shrink-0">
          <NavItem icon={<ArrowDownTrayIcon />} label="Exportar" isCollapsed={isSidebarCollapsed} isActive={false} onClick={() => setIsExportModalOpen(true)} />
          <NavItem icon={<BookOpenIcon />} label="Estante" isCollapsed={isSidebarCollapsed} isActive={false} onClick={goToBookshelf} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">
        {renderView()}
      </main>

      {/* Agent Chatbot */}
      <AgentChatbot isCollapsed={isChatCollapsed} onToggle={() => setIsChatCollapsed(!isChatCollapsed)} />

      {/* Modals */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setIsExportModalOpen(false)}>
          <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Exportar Manuscrito</h2>
            <p className="text-brand-text-secondary mb-6">Escolha o formato para exportar sua obra.</p>
            <div className="space-y-3">
              <button onClick={() => handleExport('txt')} className="w-full text-left p-3 bg-brand-secondary rounded-lg hover:bg-brand-primary transition-colors">TXT - Texto Simples</button>
              <button onClick={() => handleExport('pdf')} className="w-full text-left p-3 bg-brand-secondary rounded-lg hover:bg-brand-primary transition-colors flex items-center justify-between">
                <span>PDF - Adobe PDF</span>
                {!['Amador', 'Profissional'].includes(author?.subscription.tier || 'Free') && <LockClosedIcon className="w-5 h-5 text-yellow-400"/>}
              </button>
              <button onClick={() => handleExport('docx')} className="w-full text-left p-3 bg-brand-secondary rounded-lg hover:bg-brand-primary transition-colors flex items-center justify-between">
                <span>DOCX - Microsoft Word</span>
                {!['Amador', 'Profissional'].includes(author?.subscription.tier || 'Free') && <LockClosedIcon className="w-5 h-5 text-yellow-400"/>}
              </button>
            </div>
          </div>
        </div>
      )}
      {isUpgradeModalOpen && <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;