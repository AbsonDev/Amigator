import React, { useState, useMemo } from 'react';
import type { Story, Author, Chapter } from '../types';
import { AppView } from '../types';
import { BookOpenIcon, UsersIcon, HomeIcon, PencilIcon, AgentIcon, RefreshIcon, GlobeAltIcon, WandSparklesIcon, ArrowDownTrayIcon, ClockIcon } from './Icons';
import CharacterEditor from './CharacterEditor';
import ChapterOrganizer from './ChapterOrganizer';
import ChapterEditor from './ChapterEditor';
import { analyzeScriptContinuity, analyzeRepetitions } from '../services/geminiService';
import AgentChatbot from './AgentChatbot';
import WorldBuilder from './WorldBuilder';
import IdeaHub from './IdeaHub';
import HistoryViewer from './HistoryViewer';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import saveAs from 'file-saver';


interface DashboardProps {
  author: Author;
  story: Story;
  setStory: (updatedStory: Story) => void;
  goToBookshelf: () => void;
  logAction: (actor: 'user' | 'agent', action: string) => void;
}

const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
  <div className="bg-brand-surface p-6 rounded-lg border border-brand-secondary">
    <p className="text-sm font-medium text-brand-text-secondary">{label}</p>
    <p className="text-3xl font-bold text-brand-text-primary mt-1">{value}</p>
  </div>
);

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>;

const Dashboard: React.FC<DashboardProps> = ({ author, story, setStory, goToBookshelf, logAction }) => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.OVERVIEW);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  
  const [activeAnalysis, setActiveAnalysis] = useState<'script' | 'repetition' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isIdeaHubOpen, setIsIdeaHubOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const wordCount = useMemo(() => {
    return story.chapters.reduce((acc, chap) => acc + chap.content.split(/\s+/).filter(Boolean).length, 0);
  }, [story.chapters]);

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    const updatedStory = {
      ...story,
      chapters: story.chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c)
    };
    setStory(updatedStory);
  };

  const handleAnalyzeScript = async () => {
    setIsAnalyzing(true);
    setActiveAnalysis('script');
    logAction('agent', 'Executou uma análise de continuidade da trama.');
    try {
        const results = await analyzeScriptContinuity(story);
        setStory({
            ...story,
            analysis: {
                ...story.analysis,
                scriptIssues: { ...story.analysis.scriptIssues, results, lastAnalyzed: new Date().toISOString() }
            }
        });
    } catch (e) {
        alert((e as Error).message);
        setActiveAnalysis(null);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleAnalyzeRepetitions = async () => {
    setIsAnalyzing(true);
    setActiveAnalysis('repetition');
    logAction('agent', 'Executou uma análise de repetições.');
    try {
        const results = await analyzeRepetitions(story);
        setStory({
            ...story,
            analysis: {
                ...story.analysis,
                repetitions: { ...story.analysis.repetitions, results, lastAnalyzed: new Date().toISOString() }
            }
        });
    } catch (e) {
        alert((e as Error).message);
        setActiveAnalysis(null);
    } finally {
        setIsAnalyzing(false);
    }
  };
  
  const handleIgnoreScriptIssue = (description: string) => {
    setStory({
      ...story,
      analysis: {
        ...story.analysis,
        scriptIssues: {
          ...story.analysis.scriptIssues,
          ignored: [...new Set([...story.analysis.scriptIssues.ignored, description])]
        }
      }
    })
  };

  const handleIgnoreRepetition = (text: string) => {
     setStory({
      ...story,
      analysis: {
        ...story.analysis,
        repetitions: {
          ...story.analysis.repetitions,
          ignored: [...new Set([...story.analysis.repetitions.ignored, text])]
        }
      }
    })
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    const fileName = story.title.replace(/ /g, '_');
    logAction('user', `Exportou a história como ${format.toUpperCase()}.`);

    if (format === 'txt') {
      const content = `${story.title}\npor ${author.name}\n\n${story.synopsis}\n\n` + story.chapters.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${fileName}.txt`);
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFont('times', 'normal');
      doc.setFontSize(22);
      doc.text(story.title, 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`por ${author.name}`, 105, 30, { align: 'center' });

      story.chapters.forEach((chapter, index) => {
        if (index > 0 || story.title.length > 0) doc.addPage();
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
                    new Paragraph({ text: story.title, heading: HeadingLevel.TITLE }),
                    new Paragraph({ text: `por ${author.name}`, heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: story.synopsis, style: "IntenseQuote" }),
                    ...story.chapters.flatMap(chapter => [
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


  const scriptIssues = useMemo(() => story.analysis?.scriptIssues.results.filter(issue => !story.analysis.scriptIssues.ignored.includes(issue.description)) || [], [story.analysis?.scriptIssues]);
  const repetitionIssues = useMemo(() => story.analysis?.repetitions.results.filter(issue => !story.analysis.repetitions.ignored.includes(issue.text)) || [], [story.analysis?.repetitions]);

  const renderContent = () => {
    if (editingChapter) {
        return <ChapterEditor 
            chapter={editingChapter} 
            onSave={handleUpdateChapter} 
            onBack={() => setEditingChapter(null)}
            logAction={logAction}
            story={story}
            setStory={setStory}
        />
    }

    switch (currentView) {
      case AppView.OVERVIEW:
        return (
          <div className="p-4 sm:p-6 md:p-8">
            <header className="flex justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-serif text-brand-text-primary">{story.title}</h1>
                    <p className="text-brand-text-secondary mt-2 max-w-3xl font-serif text-lg">{story.synopsis}</p>
                </div>
                <button onClick={() => setIsExportModalOpen(true)} className="flex-shrink-0 flex items-center gap-2 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-primary transition-all">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Exportar
                </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Contagem de Palavras" value={wordCount} />
              <StatCard label="Capítulos" value={story.chapters.length} />
              <StatCard label="Personagens" value={story.characters.length} />
            </div>
            <div className="mt-10">
                <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Ferramentas do Autor</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Script Continuity Widget */}
                    <div className="bg-brand-surface border border-brand-secondary rounded-lg p-6 flex flex-col">
                        <h3 className="font-bold text-brand-text-primary">Continuidade da Trama</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 flex-grow">Verifica furos de roteiro e inconsistências.</p>
                        {scriptIssues.length > 0 && <p className="text-yellow-400 font-bold my-2">{scriptIssues.length} problemas encontrados</p>}
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setActiveAnalysis('script')} disabled={isAnalyzing} className="flex-1 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all">Ver Detalhes</button>
                            <button onClick={handleAnalyzeScript} disabled={isAnalyzing} className="bg-brand-primary p-2 rounded-lg hover:bg-opacity-90 transition-all"><RefreshIcon className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} /></button>
                        </div>
                    </div>
                    {/* Repetition Analysis Widget */}
                    <div className="bg-brand-surface border border-brand-secondary rounded-lg p-6 flex flex-col">
                        <h3 className="font-bold text-brand-text-primary">Análise de Repetição</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 flex-grow">Encontra palavras e frases repetitivas.</p>
                        {repetitionIssues.length > 0 && <p className="text-yellow-400 font-bold my-2">{repetitionIssues.length} repetições encontradas</p>}
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setActiveAnalysis('repetition')} disabled={isAnalyzing} className="flex-1 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all">Ver Detalhes</button>
                            <button onClick={handleAnalyzeRepetitions} disabled={isAnalyzing} className="bg-brand-primary p-2 rounded-lg hover:bg-opacity-90 transition-all"><RefreshIcon className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} /></button>
                        </div>
                    </div>
                    {/* Idea Hub Widget */}
                    <div className="bg-brand-surface border border-brand-secondary rounded-lg p-6 flex flex-col">
                        <h3 className="font-bold text-brand-text-primary">Central de Ideias</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 flex-grow">Gere reviravoltas, nomes e diálogos para superar o bloqueio criativo.</p>
                        <button onClick={() => setIsIdeaHubOpen(true)} className="mt-4 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-center gap-2">
                            <WandSparklesIcon className="w-5 h-5" />
                            Abrir Central
                        </button>
                    </div>
                </div>
            </div>
          </div>
        );
      case AppView.CHAPTERS:
        return <ChapterOrganizer story={story} onEditChapter={setEditingChapter} />;
      case AppView.CHARACTERS:
        return <CharacterEditor story={story} />;
      case AppView.WORLD:
        return <WorldBuilder story={story} setStory={setStory} logAction={logAction} />;
      case AppView.HISTORY:
        return <HistoryViewer story={story} setStory={setStory} logAction={logAction} />;
      default:
        return null;
    }
  };
  
  const NavItem: React.FC<{ icon: React.ReactNode; label: string; view: AppView }> = ({ icon, label, view }) => {
    const isActive = currentView === view && !editingChapter;
    return (
        <button
            onClick={() => { setEditingChapter(null); setCurrentView(view); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${isActive ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary'}`}
        >
            {icon}
            <span className="flex-1 text-left">{label}</span>
        </button>
    );
  };


  return (
    <>
        <div className="flex h-screen bg-brand-background text-brand-text-primary">
            <aside className="w-64 bg-brand-surface/50 border-r border-brand-secondary flex flex-col p-4">
                <div className="flex items-center gap-2 p-2 mb-6">
                    <PencilIcon className="w-8 h-8 text-brand-primary" />
                    <span className="font-bold text-xl">Escritor IA</span>
                </div>
                <nav className="flex flex-col gap-2">
                    <NavItem icon={<HomeIcon className="w-5 h-5"/>} label="Painel de Controle" view={AppView.OVERVIEW} />
                    <NavItem icon={<BookOpenIcon className="w-5 h-5"/>} label="Capítulos" view={AppView.CHAPTERS} />
                    <NavItem icon={<UsersIcon className="w-5 h-5"/>} label="Personagens" view={AppView.CHARACTERS} />
                    <NavItem icon={<GlobeAltIcon className="w-5 h-5"/>} label="Mundo" view={AppView.WORLD} />
                    <NavItem icon={<ClockIcon className="w-5 h-5"/>} label="Versionamento & Histórico" view={AppView.HISTORY} />
                </nav>
                <div className="mt-auto">
                    <div className="border-t border-brand-secondary pt-4 text-center">
                        <p className="text-sm font-semibold text-brand-text-primary">{author.name}</p>
                        <button onClick={goToBookshelf} className="text-xs text-brand-text-secondary hover:text-brand-primary transition-colors mt-2">
                          Voltar para Estante
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
        
        <button 
            onClick={() => setIsChatbotOpen(prev => !prev)}
            className="fixed bottom-6 right-6 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transform hover:scale-110 transition-all z-40"
            aria-label="Abrir Agente de IA"
        >
            <AgentIcon className="w-8 h-8"/>
        </button>

        {isChatbotOpen && (
            <AgentChatbot 
                story={story} 
                setStory={setStory}
                onClose={() => setIsChatbotOpen(false)}
                logAction={logAction}
            />
        )}
        
        {isIdeaHubOpen && <IdeaHub story={story} onClose={() => setIsIdeaHubOpen(false)} />}

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

        {activeAnalysis && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setActiveAnalysis(null)}>
                <div className="bg-brand-surface rounded-xl border border-brand-secondary w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                    {isAnalyzing && <div className="text-center p-8"><LoadingSpinnerSmall /> <p className="mt-4 text-brand-text-secondary">A IA está lendo sua história...</p></div>}
                    
                    {activeAnalysis === 'script' && !isAnalyzing && (
                        <>
                            <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Análise de Continuidade do Roteiro</h2>
                            {scriptIssues.length > 0 ? (
                                <div className="space-y-4">
                                    {scriptIssues.map((issue, index) => (
                                        <div key={index} className="bg-brand-background p-4 rounded-lg border border-brand-secondary">
                                            <p className="font-semibold text-brand-text-primary">{issue.description}</p>
                                            <p className="text-sm text-brand-text-secondary mt-2"><strong className="text-brand-text-primary">Sugestão:</strong> {issue.suggestion}</p>
                                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                                                <span className="text-xs font-bold text-brand-text-secondary">Capítulos:</span>
                                                {issue.involvedChapters.map(chap => <span key={chap} className="text-xs bg-brand-secondary px-2 py-1 rounded-full">{chap}</span>)}
                                            </div>
                                            <div className="text-right mt-2">
                                                <button onClick={() => handleIgnoreScriptIssue(issue.description)} className="text-xs font-semibold text-brand-text-secondary hover:text-white transition-colors px-3 py-1">Ignorar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <p className="text-lg font-semibold text-brand-text-primary">Nenhum furo de roteiro encontrado!</p>
                                    <p className="text-brand-text-secondary mt-2">Sua história parece consistente. Bom trabalho!</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeAnalysis === 'repetition' && !isAnalyzing && (
                         <>
                            <h2 className="text-2xl font-bold font-serif text-brand-text-primary mb-4">Análise de Repetição</h2>
                            {repetitionIssues.length > 0 ? (
                                <div className="space-y-4">
                                    {repetitionIssues.map((issue, index) => (
                                        <div key={index} className="bg-brand-background p-4 rounded-lg border border-brand-secondary">
                                            <p className="font-semibold text-brand-text-primary">Texto repetido: "<span className="italic text-brand-primary">{issue.text}</span>" (encontrado {issue.count} vezes)</p>
                                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                                                <span className="text-xs font-bold text-brand-text-secondary">Capítulos:</span>
                                                {issue.locations.map(loc => <span key={loc} className="text-xs bg-brand-secondary px-2 py-1 rounded-full">{loc}</span>)}
                                            </div>
                                             <div className="text-right mt-2">
                                                <button onClick={() => handleIgnoreRepetition(issue.text)} className="text-xs font-semibold text-brand-text-secondary hover:text-white transition-colors px-3 py-1">Ignorar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <p className="text-lg font-semibold text-brand-text-primary">Nenhuma repetição significativa encontrada!</p>
                                    <p className="text-brand-text-secondary mt-2">Sua prosa parece variada e estilisticamente sólida.</p>
                                </div>
                            )}
                        </>
                    )}
                    <button onClick={() => setActiveAnalysis(null)} className="mt-6 w-full bg-brand-primary text-white font-bold py-2 rounded-lg hover:bg-opacity-90">Fechar</button>
                </div>
            </div>
        )}
    </>
  );
};

export default Dashboard;