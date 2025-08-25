import React, { useState, useEffect } from 'react';
import { useStory } from '../context/StoryContext';
import { 
  convertToScreenplay, 
  formatScreenplay,
  exportScreenplayPDF,
  exportFinalDraftXML,
  analyzeScreenplay
} from '../services/screenplayService';
import type { Screenplay, ScreenplayFormat, Scene, ScreenplayAnalysis } from '../types/screenplay';
import { FilmIcon, ArrowDownTrayIcon, SparklesIcon, ChartBarIcon } from './Icons';

const ScreenplayConverter: React.FC = () => {
  const { activeStory } = useStory();
  const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ScreenplayFormat>('film');
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [analysis, setAnalysis] = useState<ScreenplayAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'screenplay' | 'analysis' | 'export'>('screenplay');
  
  const handleConvert = async () => {
    if (!activeStory) return;
    
    setIsConverting(true);
    try {
      const convertedScreenplay = await convertToScreenplay(activeStory, selectedFormat);
      setScreenplay(convertedScreenplay);
      
      // Analyze the screenplay
      const screenplayAnalysis = analyzeScreenplay(convertedScreenplay);
      setAnalysis(screenplayAnalysis);
    } catch (error) {
      console.error('Error converting to screenplay:', error);
      alert('Erro ao converter para roteiro. Por favor, tente novamente.');
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleExportPDF = async () => {
    if (!screenplay) return;
    
    try {
      const blob = await exportScreenplayPDF(screenplay);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${screenplay.title.replace(/\s+/g, '_')}_screenplay.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting screenplay:', error);
      alert('Erro ao exportar roteiro.');
    }
  };
  
  const handleExportFinalDraft = () => {
    if (!screenplay) return;
    
    try {
      const xml = exportFinalDraftXML(screenplay);
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${screenplay.title.replace(/\s+/g, '_')}_screenplay.fdx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Final Draft:', error);
      alert('Erro ao exportar para Final Draft.');
    }
  };
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };
  
  if (!activeStory) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-brand-text-secondary">Nenhuma história selecionada</p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto bg-brand-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 p-6 border-b border-brand-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-text-primary mb-2 flex items-center gap-3">
                <FilmIcon className="w-8 h-8 text-purple-500" />
                Modo Roteirista
              </h1>
              <p className="text-brand-text-secondary">
                Converta sua história em um roteiro profissional formatado
              </p>
            </div>
            
            {!screenplay && (
              <div className="flex items-center gap-4">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as ScreenplayFormat)}
                  className="px-4 py-2 bg-brand-surface border border-brand-secondary rounded-lg text-brand-text-primary focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="film">Filme</option>
                  <option value="tv">TV/Série</option>
                  <option value="theater">Teatro</option>
                  <option value="short">Curta-metragem</option>
                </select>
                
                <button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  {isConverting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Convertendo...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5" />
                      Converter para Roteiro
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {screenplay && (
            <div className="flex gap-2 mt-6">
              {[
                { id: 'screenplay', label: 'Roteiro', icon: FilmIcon },
                { id: 'analysis', label: 'Análise', icon: ChartBarIcon },
                { id: 'export', label: 'Exportar', icon: ArrowDownTrayIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-brand-surface text-brand-text-secondary hover:bg-brand-secondary'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {screenplay ? (
          <>
            {activeTab === 'screenplay' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scene List */}
                <div className="lg:col-span-1">
                  <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-4 border border-brand-secondary/30">
                    <h3 className="text-lg font-bold mb-4">Cenas ({screenplay.scenes.length})</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {screenplay.scenes.map((scene) => (
                        <button
                          key={scene.id}
                          onClick={() => setSelectedScene(scene)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedScene?.id === scene.id
                              ? 'bg-purple-600/20 border border-purple-600/50'
                              : 'bg-brand-secondary/20 hover:bg-brand-secondary/30'
                          }`}
                        >
                          <div className="font-mono text-sm text-purple-400">
                            CENA {scene.number}
                          </div>
                          <div className="text-xs text-brand-text-secondary mt-1">
                            {scene.heading.setting}. {scene.heading.location}
                          </div>
                          <div className="text-xs text-brand-text-secondary">
                            {scene.heading.time} • {Math.round(scene.duration)}s
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-4 border border-brand-secondary/30 mt-4">
                    <h3 className="text-lg font-bold mb-4">Estatísticas</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-brand-text-secondary">Duração Total</span>
                        <span className="font-bold text-purple-400">
                          {formatDuration(screenplay.duration)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-text-secondary">Páginas</span>
                        <span className="font-bold">{screenplay.pages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-text-secondary">Formato</span>
                        <span className="font-bold capitalize">{screenplay.format}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Scene Content */}
                <div className="lg:col-span-2">
                  <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                    {selectedScene ? (
                      <div className="font-mono text-sm space-y-4">
                        {/* Scene Heading */}
                        <div className="text-purple-400 font-bold">
                          {selectedScene.heading.setting}. {selectedScene.heading.location} - {selectedScene.heading.time}
                        </div>
                        
                        {/* Action Lines */}
                        {selectedScene.action.map((action, index) => (
                          <div key={index} className="text-brand-text-primary">
                            {action.text}
                          </div>
                        ))}
                        
                        {/* Dialogue */}
                        {selectedScene.dialogue.map((dialogue, index) => (
                          <div key={index} className="space-y-1">
                            <div className="text-center text-purple-400 font-bold">
                              {dialogue.character}
                              {dialogue.voiceOver && ' (V.O.)'}
                              {dialogue.offScreen && ' (O.S.)'}
                            </div>
                            {dialogue.parenthetical && (
                              <div className="text-center text-brand-text-secondary">
                                ({dialogue.parenthetical})
                              </div>
                            )}
                            <div className="max-w-md mx-auto text-brand-text-primary">
                              {dialogue.dialogue}
                            </div>
                          </div>
                        ))}
                        
                        {/* Transition */}
                        {selectedScene.transition && (
                          <div className="text-right text-purple-400 font-bold mt-4">
                            {selectedScene.transition}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-brand-text-secondary py-12">
                        <FilmIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Selecione uma cena para visualizar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'analysis' && analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Structure Analysis */}
                <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                  <h3 className="text-xl font-bold mb-4">Estrutura de 3 Atos</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Ato 1</span>
                        <span className="text-sm text-brand-text-secondary">
                          {analysis.structure.act1.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-brand-secondary/30 rounded-full h-2">
                        <div 
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${analysis.structure.act1.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        Cenas {analysis.structure.act1.scenes[0]} - {analysis.structure.act1.scenes[analysis.structure.act1.scenes.length - 1]}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Ato 2</span>
                        <span className="text-sm text-brand-text-secondary">
                          {analysis.structure.act2.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-brand-secondary/30 rounded-full h-2">
                        <div 
                          className="h-full bg-pink-600 rounded-full"
                          style={{ width: `${analysis.structure.act2.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        Cenas {analysis.structure.act2.scenes[0]} - {analysis.structure.act2.scenes[analysis.structure.act2.scenes.length - 1]}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Ato 3</span>
                        <span className="text-sm text-brand-text-secondary">
                          {analysis.structure.act3.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-brand-secondary/30 rounded-full h-2">
                        <div 
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${analysis.structure.act3.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        Cenas {analysis.structure.act3.scenes[0]} - {analysis.structure.act3.scenes[analysis.structure.act3.scenes.length - 1]}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Pacing Analysis */}
                <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                  <h3 className="text-xl font-bold mb-4">Análise de Ritmo</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-400 mb-2">
                        {analysis.pacing === 'fast' ? '⚡' : analysis.pacing === 'slow' ? '🐢' : '⚖️'}
                      </div>
                      <div className="text-xl font-bold capitalize">{analysis.pacing}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-text-secondary">Diálogo vs Ação</span>
                        <span className="font-bold">
                          {(analysis.dialogueRatio * 100).toFixed(0)}% diálogo
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-text-secondary">Duração Média da Cena</span>
                        <span className="font-bold">
                          {analysis.averageSceneDuration.toFixed(1)} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Character Screen Time */}
                <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                  <h3 className="text-xl font-bold mb-4">Tempo de Tela dos Personagens</h3>
                  <div className="space-y-3">
                    {analysis.characterArcs.slice(0, 5).map((arc) => (
                      <div key={arc.character}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{arc.character}</span>
                          <span className="text-xs text-brand-text-secondary">
                            {arc.screenTime.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-brand-secondary/30 rounded-full h-1.5">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                            style={{ width: `${arc.screenTime}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Suggestions */}
                <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-purple-600/30">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    Sugestões de Melhoria
                  </h3>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'export' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-8 border border-brand-secondary/30">
                  <h3 className="text-2xl font-bold mb-6">Exportar Roteiro</h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleExportPDF}
                      className="w-full p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-600/30 hover:border-purple-600/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg mb-1">PDF Formatado</h4>
                          <p className="text-sm text-brand-text-secondary">
                            Formato padrão da indústria com formatação profissional
                          </p>
                        </div>
                        <ArrowDownTrayIcon className="w-6 h-6 text-purple-400" />
                      </div>
                    </button>
                    
                    <button
                      onClick={handleExportFinalDraft}
                      className="w-full p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-600/30 hover:border-purple-600/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg mb-1">Final Draft (.fdx)</h4>
                          <p className="text-sm text-brand-text-secondary">
                            Compatível com Final Draft e outros softwares profissionais
                          </p>
                        </div>
                        <ArrowDownTrayIcon className="w-6 h-6 text-purple-400" />
                      </div>
                    </button>
                    
                    <div className="p-6 bg-brand-secondary/20 rounded-xl">
                      <h4 className="font-bold mb-2">Informações do Roteiro</h4>
                      <div className="space-y-2 text-sm text-brand-text-secondary">
                        <div className="flex justify-between">
                          <span>Título:</span>
                          <span className="text-brand-text-primary">{screenplay.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Formato:</span>
                          <span className="text-brand-text-primary capitalize">{screenplay.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Páginas:</span>
                          <span className="text-brand-text-primary">{screenplay.pages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duração:</span>
                          <span className="text-brand-text-primary">{formatDuration(screenplay.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FilmIcon className="w-24 h-24 mx-auto mb-6 text-purple-600/20" />
            <h2 className="text-2xl font-bold mb-2">Transforme sua História em Roteiro</h2>
            <p className="text-brand-text-secondary max-w-2xl mx-auto mb-8">
              Converta automaticamente sua narrativa em um roteiro profissional formatado, 
              com cenas, diálogos e direções de palco. Perfeito para adaptações cinematográficas, 
              televisivas ou teatrais.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <div className="text-3xl mb-3">🎬</div>
                <h3 className="font-bold mb-2">Formatação Profissional</h3>
                <p className="text-sm text-brand-text-secondary">
                  Padrão da indústria com cabeçalhos de cena, ação e diálogos
                </p>
              </div>
              
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold mb-2">Análise de Estrutura</h3>
                <p className="text-sm text-brand-text-secondary">
                  Estrutura de 3 atos, ritmo e tempo de tela dos personagens
                </p>
              </div>
              
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <div className="text-3xl mb-3">📤</div>
                <h3 className="font-bold mb-2">Múltiplos Formatos</h3>
                <p className="text-sm text-brand-text-secondary">
                  Exporte para PDF ou Final Draft (.fdx)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenplayConverter;