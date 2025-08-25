import React, { useState, useEffect, useRef } from 'react';
import { useStory } from '../context/StoryContext';
import { 
  generateCoverImage, 
  createBookCover, 
  generate3DMockup,
  exportCoverHighRes,
  suggestCoverElements,
  coverTemplates
} from '../services/bookCoverService';
import type { BookCover, CoverTemplate, CoverGenerationOptions, MockupOptions } from '../types/bookCover';
import { SparklesIcon, ArrowDownTrayIcon, PencilIcon, PhotoIcon } from './Icons';

interface BookCoverGeneratorProps {
  authorName: string;
  onClose: () => void;
}

const BookCoverGenerator: React.FC<BookCoverGeneratorProps> = ({ authorName, onClose }) => {
  const { activeStory } = useStory();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCover, setCurrentCover] = useState<BookCover | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CoverTemplate>(coverTemplates[0]);
  const [coverImage, setCoverImage] = useState<string>('');
  const [mockupImage, setMockupImage] = useState<string>('');
  const [suggestedElements, setSuggestedElements] = useState<string[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'customize' | 'mockup'>('templates');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Cover options
  const [options, setOptions] = useState<CoverGenerationOptions>({
    genre: activeStory?.genre || 'Fantasia',
    theme: '',
    mood: 'vibrant',
    style: 'illustrated',
    elements: [],
    colorScheme: 'complementary'
  });
  
  // Mockup options
  const [mockupOptions, setMockupOptions] = useState<MockupOptions>({
    type: 'hardcover',
    perspective: '3d',
    background: 'gradient',
    shadows: true,
    reflections: false
  });

  useEffect(() => {
    if (activeStory) {
      loadSuggestedElements();
    }
  }, [activeStory]);

  const loadSuggestedElements = async () => {
    if (!activeStory) return;
    const elements = await suggestCoverElements(activeStory);
    setSuggestedElements(elements);
    setSelectedElements(elements.slice(0, 3));
  };

  const handleGenerateCover = async () => {
    if (!activeStory) return;
    
    setIsGenerating(true);
    try {
      // Generate AI image
      const imageUrl = await generateCoverImage(activeStory, {
        ...options,
        theme: customPrompt || activeStory.synopsis,
        elements: selectedElements
      });
      setCoverImage(imageUrl);
      
      // Create cover object
      const cover = await createBookCover(
        activeStory,
        authorName,
        selectedTemplate,
        imageUrl
      );
      setCurrentCover(cover);
      
      // Generate 3D mockup
      const mockup = await generate3DMockup(cover, mockupOptions);
      setMockupImage(mockup);
      
    } catch (error) {
      console.error('Error generating cover:', error);
      alert('Erro ao gerar a capa. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCover = async () => {
    if (!currentCover) return;
    
    try {
      const blob = await exportCoverHighRes(currentCover);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeStory?.title.replace(/\s+/g, '_')}_cover.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting cover:', error);
      alert('Erro ao exportar a capa.');
    }
  };

  const renderCoverPreview = () => {
    if (!currentCover || !coverImage) return null;
    
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="relative aspect-[3/4] bg-brand-surface rounded-lg overflow-hidden shadow-2xl">
          {/* Background Image */}
          <img 
            src={coverImage} 
            alt="Cover background" 
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              opacity: currentCover.layout.imageOpacity,
              filter: `blur(${currentCover.layout.imageBlur}px)`
            }}
          />
          
          {/* Overlay */}
          {currentCover.layout.overlay && (
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: currentCover.layout.overlayOpacity }}
            />
          )}
          
          {/* Text Elements */}
          <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">
            {/* Title Section */}
            <div className="text-center">
              <h1 
                className="font-bold leading-tight mb-2"
                style={{
                  fontFamily: currentCover.fonts.title.family,
                  fontSize: `${currentCover.fonts.title.size / 2}px`,
                  fontWeight: currentCover.fonts.title.weight,
                  fontStyle: currentCover.fonts.title.style,
                  textTransform: currentCover.fonts.title.textTransform
                }}
              >
                {currentCover.title}
              </h1>
              {currentCover.subtitle && (
                <p 
                  className="opacity-90"
                  style={{
                    fontFamily: currentCover.fonts.subtitle?.family,
                    fontSize: `${currentCover.fonts.subtitle?.size}px`,
                    fontWeight: currentCover.fonts.subtitle?.weight,
                    fontStyle: currentCover.fonts.subtitle?.style
                  }}
                >
                  {currentCover.subtitle}
                </p>
              )}
            </div>
            
            {/* Author Section */}
            <div className="text-center">
              <p 
                style={{
                  fontFamily: currentCover.fonts.author.family,
                  fontSize: `${currentCover.fonts.author.size / 1.5}px`,
                  fontWeight: currentCover.fonts.author.weight,
                  fontStyle: currentCover.fonts.author.style
                }}
              >
                {currentCover.author}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-brand-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-brand-text-primary">Gerador de Capas com IA</h2>
              <p className="text-brand-text-secondary mt-1">Crie capas profissionais para sua história</p>
            </div>
            <button
              onClick={onClose}
              className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: 'templates', label: 'Templates', icon: PhotoIcon },
              { id: 'customize', label: 'Personalizar', icon: PencilIcon },
              { id: 'mockup', label: '3D Mockup', icon: SparklesIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-secondary/30 text-brand-text-secondary hover:bg-brand-secondary/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Options */}
            <div className="space-y-6">
              {activeTab === 'templates' && (
                <>
                  <div>
                    <h3 className="text-lg font-bold mb-4">Escolha um Template</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {coverTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedTemplate.id === template.id
                              ? 'border-brand-primary bg-brand-primary/10'
                              : 'border-brand-secondary/30 hover:border-brand-primary/50'
                          }`}
                        >
                          <div className="text-sm font-medium">{template.name}</div>
                          <div className="text-xs text-brand-text-secondary mt-1">
                            {template.style}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Mood da Capa</h3>
                    <div className="flex gap-2">
                      {['dark', 'light', 'vibrant', 'muted', 'dramatic'].map(mood => (
                        <button
                          key={mood}
                          onClick={() => setOptions(prev => ({ ...prev, mood: mood as any }))}
                          className={`px-4 py-2 rounded-lg capitalize transition-all ${
                            options.mood === mood
                              ? 'bg-brand-primary text-white'
                              : 'bg-brand-secondary/30 text-brand-text-secondary hover:bg-brand-secondary/50'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'customize' && (
                <>
                  <div>
                    <h3 className="text-lg font-bold mb-4">Elementos Visuais Sugeridos</h3>
                    <div className="space-y-2">
                      {suggestedElements.map((element, index) => (
                        <label key={index} className="flex items-center gap-3 p-3 bg-brand-secondary/20 rounded-lg hover:bg-brand-secondary/30 transition-all cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedElements.includes(element)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedElements([...selectedElements, element]);
                              } else {
                                setSelectedElements(selectedElements.filter(el => el !== element));
                              }
                            }}
                            className="w-4 h-4 text-brand-primary"
                          />
                          <span className="text-sm">{element}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Prompt Personalizado</h3>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Descreva elementos adicionais para a capa..."
                      className="w-full h-32 px-4 py-3 bg-brand-secondary/20 rounded-lg text-brand-text-primary placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-primary outline-none resize-none"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Estilo Visual</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['illustrated', 'photographic', 'abstract', 'minimalist', 'vintage', 'modern'].map(style => (
                        <button
                          key={style}
                          onClick={() => setOptions(prev => ({ ...prev, style }))}
                          className={`px-4 py-2 rounded-lg capitalize transition-all ${
                            options.style === style
                              ? 'bg-brand-primary text-white'
                              : 'bg-brand-secondary/30 text-brand-text-secondary hover:bg-brand-secondary/50'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'mockup' && currentCover && (
                <>
                  <div>
                    <h3 className="text-lg font-bold mb-4">Tipo de Livro</h3>
                    <div className="flex gap-2">
                      {['hardcover', 'paperback', 'ebook'].map(type => (
                        <button
                          key={type}
                          onClick={() => setMockupOptions(prev => ({ ...prev, type: type as any }))}
                          className={`px-4 py-2 rounded-lg capitalize transition-all ${
                            mockupOptions.type === type
                              ? 'bg-brand-primary text-white'
                              : 'bg-brand-secondary/30 text-brand-text-secondary hover:bg-brand-secondary/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Perspectiva</h3>
                    <div className="flex gap-2">
                      {['front', 'spine', '3d', 'flat'].map(perspective => (
                        <button
                          key={perspective}
                          onClick={() => setMockupOptions(prev => ({ ...prev, perspective: perspective as any }))}
                          className={`px-4 py-2 rounded-lg capitalize transition-all ${
                            mockupOptions.perspective === perspective
                              ? 'bg-brand-primary text-white'
                              : 'bg-brand-secondary/30 text-brand-text-secondary hover:bg-brand-secondary/50'
                          }`}
                        >
                          {perspective}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4">Opções</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={mockupOptions.shadows}
                          onChange={(e) => setMockupOptions(prev => ({ ...prev, shadows: e.target.checked }))}
                          className="w-4 h-4 text-brand-primary"
                        />
                        <span className="text-sm">Sombras</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={mockupOptions.reflections}
                          onChange={(e) => setMockupOptions(prev => ({ ...prev, reflections: e.target.checked }))}
                          className="w-4 h-4 text-brand-primary"
                        />
                        <span className="text-sm">Reflexos</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
              
              {/* Generate Button */}
              <button
                onClick={handleGenerateCover}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-brand-primary to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Gerando Capa...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    Gerar Capa com IA
                  </span>
                )}
              </button>
            </div>
            
            {/* Right Panel - Preview */}
            <div className="flex flex-col items-center justify-center">
              {currentCover ? (
                <>
                  {activeTab === 'mockup' && mockupImage ? (
                    <img 
                      src={mockupImage} 
                      alt="3D Mockup" 
                      className="w-full max-w-md rounded-lg shadow-2xl"
                    />
                  ) : (
                    renderCoverPreview()
                  )}
                  
                  {/* Export Button */}
                  <button
                    onClick={handleExportCover}
                    className="mt-6 px-6 py-3 bg-brand-secondary/50 text-brand-text-primary font-medium rounded-lg hover:bg-brand-secondary/70 transition-all flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Exportar em Alta Resolução
                  </button>
                </>
              ) : (
                <div className="text-center text-brand-text-secondary">
                  <PhotoIcon className="w-24 h-24 mx-auto mb-4 opacity-20" />
                  <p>Clique em "Gerar Capa" para criar sua capa</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCoverGenerator;