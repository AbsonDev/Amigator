import React, { useState, useEffect, useRef } from 'react';
import { useStory } from '../context/StoryContext';
import { 
  narrationService,
  generateChapterNarration,
  generateAudiobook,
  estimateNarrationDuration
} from '../services/audioNarrationService';
import { VOICE_PRESETS } from '../types/audioNarration';
import type { VoiceProfile, AudioSettings } from '../types/audioNarration';
import type { Chapter } from '../types';
import { 
  SpeakerWaveIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  MicrophoneIcon
} from './Icons';

const AudioNarrator: React.FC = () => {
  const { activeStory } = useStory();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOICE_PRESETS[0]);
  const [customVoice, setCustomVoice] = useState<VoiceProfile>({
    ...VOICE_PRESETS[0],
    pitch: 0,
    speed: 1
  });
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [highlightedWord, setHighlightedWord] = useState(-1);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    autoPlay: false,
    highlightText: true,
    volumeMusic: 0.3,
    volumeNarration: 1,
    pauseBetweenChapters: 2
  });
  const [activeTab, setActiveTab] = useState<'narrate' | 'audiobook' | 'settings'>('narrate');
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStory && activeStory.chapters.length > 0) {
      setSelectedChapter(activeStory.chapters[0]);
    }
  }, [activeStory]);

  const handleStartNarration = async () => {
    if (!selectedChapter) return;

    setIsNarrating(true);
    setProgress(0);
    setCurrentText(selectedChapter.content);

    try {
      await generateChapterNarration(
        selectedChapter,
        customVoice,
        (prog) => setProgress(prog)
      );
    } catch (error) {
      console.error('Narration error:', error);
      alert('Erro na narração. Verifique se o navegador suporta síntese de voz.');
    } finally {
      setIsNarrating(false);
      setProgress(0);
    }
  };

  const handlePause = () => {
    if (isNarrating) {
      narrationService.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (isPaused) {
      narrationService.play();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    narrationService.stop();
    setIsNarrating(false);
    setIsPaused(false);
    setProgress(0);
  };

  const handleVoiceChange = (preset: VoiceProfile) => {
    setSelectedVoice(preset);
    setCustomVoice({
      ...preset,
      pitch: preset.pitch,
      speed: preset.speed
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedDuration = selectedChapter 
    ? estimateNarrationDuration(selectedChapter.content, customVoice.speed)
    : 0;

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
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 border-b border-brand-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-text-primary mb-2 flex items-center gap-3">
            <SpeakerWaveIcon className="w-8 h-8 text-blue-500" />
            Narrador com IA
          </h1>
          <p className="text-brand-text-secondary">
            Transforme sua história em audiobook com vozes naturais
          </p>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: 'narrate', label: 'Narração', icon: MicrophoneIcon },
              { id: 'audiobook', label: 'Audiobook', icon: SpeakerWaveIcon },
              { id: 'settings', label: 'Configurações', icon: AdjustmentsHorizontalIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-brand-surface text-brand-text-secondary hover:bg-brand-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'narrate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Chapter Selection */}
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-4 border border-brand-secondary/30">
                <h3 className="text-lg font-bold mb-3">Selecionar Capítulo</h3>
                <select
                  value={selectedChapter?.id || ''}
                  onChange={(e) => {
                    const chapter = activeStory.chapters.find(c => c.id === e.target.value);
                    setSelectedChapter(chapter || null);
                  }}
                  className="w-full px-3 py-2 bg-brand-secondary/30 rounded-lg text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {activeStory.chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Selection */}
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-4 border border-brand-secondary/30">
                <h3 className="text-lg font-bold mb-3">Voz do Narrador</h3>
                <div className="space-y-2">
                  {VOICE_PRESETS.map(voice => (
                    <button
                      key={voice.id}
                      onClick={() => handleVoiceChange(voice)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedVoice.id === voice.id
                          ? 'bg-blue-600/20 border border-blue-600/50'
                          : 'bg-brand-secondary/20 hover:bg-brand-secondary/30'
                      }`}
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-xs text-brand-text-secondary">
                        {voice.gender === 'male' ? '👨' : voice.gender === 'female' ? '👩' : '🧑'} 
                        {' '}{voice.age === 'child' ? 'Criança' : voice.age === 'young' ? 'Jovem' : voice.age === 'adult' ? 'Adulto' : 'Idoso'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Customization */}
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-4 border border-brand-secondary/30">
                <h3 className="text-lg font-bold mb-3">Personalizar Voz</h3>
                
                {/* Pitch */}
                <div className="mb-4">
                  <label className="text-sm text-brand-text-secondary">Tom (Pitch)</label>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={customVoice.pitch}
                    onChange={(e) => setCustomVoice(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-xs text-brand-text-secondary mt-1">
                    <span>Grave</span>
                    <span>{customVoice.pitch.toFixed(1)}</span>
                    <span>Agudo</span>
                  </div>
                </div>

                {/* Speed */}
                <div className="mb-4">
                  <label className="text-sm text-brand-text-secondary">Velocidade</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={customVoice.speed}
                    onChange={(e) => setCustomVoice(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-xs text-brand-text-secondary mt-1">
                    <span>Lento</span>
                    <span>{customVoice.speed.toFixed(1)}x</span>
                    <span>Rápido</span>
                  </div>
                </div>

                {/* Estimated Duration */}
                <div className="p-3 bg-brand-secondary/20 rounded-lg">
                  <div className="text-sm text-brand-text-secondary">Duração Estimada</div>
                  <div className="text-xl font-bold text-blue-400">
                    {formatDuration(estimatedDuration)}
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-600/30">
                <div className="flex justify-center gap-3 mb-4">
                  {!isNarrating ? (
                    <button
                      onClick={handleStartNarration}
                      className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-110"
                    >
                      <PlayIcon className="w-6 h-6" />
                    </button>
                  ) : (
                    <>
                      {isPaused ? (
                        <button
                          onClick={handleResume}
                          className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
                        >
                          <PlayIcon className="w-6 h-6" />
                        </button>
                      ) : (
                        <button
                          onClick={handlePause}
                          className="p-4 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-all"
                        >
                          <PauseIcon className="w-6 h-6" />
                        </button>
                      )}
                      <button
                        onClick={handleStop}
                        className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                      >
                        <StopIcon className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                {isNarrating && (
                  <div>
                    <div className="w-full bg-brand-secondary/30 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-brand-text-secondary mt-2">
                      {progress.toFixed(0)}% concluído
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text Display */}
            <div className="lg:col-span-2">
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <h3 className="text-xl font-bold mb-4">
                  {selectedChapter?.title || 'Selecione um capítulo'}
                </h3>
                
                {selectedChapter && (
                  <div 
                    ref={textRef}
                    className="prose prose-invert max-w-none max-h-[600px] overflow-y-auto"
                  >
                    <div className="text-brand-text-primary leading-relaxed whitespace-pre-wrap">
                      {currentText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audiobook' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-8 border border-brand-secondary/30">
              <h2 className="text-2xl font-bold mb-6">Criar Audiobook Completo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-brand-text-secondary">Título do Audiobook</label>
                    <div className="text-lg font-bold">{activeStory.title}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-brand-text-secondary">Total de Capítulos</label>
                    <div className="text-lg font-bold">{activeStory.chapters.length}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-brand-text-secondary">Duração Total Estimada</label>
                    <div className="text-lg font-bold text-blue-400">
                      {formatDuration(
                        activeStory.chapters.reduce((acc, chap) => 
                          acc + estimateNarrationDuration(chap.content, customVoice.speed), 0
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-brand-text-secondary mb-2 block">Narrador Principal</label>
                    <select
                      value={selectedVoice.id}
                      onChange={(e) => {
                        const voice = VOICE_PRESETS.find(v => v.id === e.target.value);
                        if (voice) handleVoiceChange(voice);
                      }}
                      className="w-full px-3 py-2 bg-brand-secondary/30 rounded-lg text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {VOICE_PRESETS.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-brand-text-secondary">Pausa entre Capítulos (segundos)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={audioSettings.pauseBetweenChapters}
                      onChange={(e) => setAudioSettings(prev => ({ 
                        ...prev, 
                        pauseBetweenChapters: parseInt(e.target.value) 
                      }))}
                      className="w-full px-3 py-2 bg-brand-secondary/30 rounded-lg text-brand-text-primary focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                  <SpeakerWaveIcon className="w-5 h-5" />
                  Gerar Audiobook Completo
                </button>
                
                <button className="px-6 py-3 bg-brand-secondary/50 text-brand-text-primary font-medium rounded-xl hover:bg-brand-secondary/70 transition-all flex items-center gap-2">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Exportar MP3
                </button>
              </div>

              {/* Chapter List */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Capítulos do Audiobook</h3>
                <div className="space-y-2">
                  {activeStory.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="flex items-center justify-between p-3 bg-brand-secondary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-brand-text-secondary">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-medium">{chapter.title}</span>
                      </div>
                      <span className="text-sm text-brand-text-secondary">
                        ~{formatDuration(estimateNarrationDuration(chapter.content, customVoice.speed))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-8 border border-brand-secondary/30">
              <h2 className="text-2xl font-bold mb-6">Configurações de Áudio</h2>
              
              <div className="space-y-6">
                {/* Auto Play */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reprodução Automática</div>
                    <div className="text-sm text-brand-text-secondary">
                      Iniciar próximo capítulo automaticamente
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audioSettings.autoPlay}
                      onChange={(e) => setAudioSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-brand-secondary peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Highlight Text */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Destacar Texto</div>
                    <div className="text-sm text-brand-text-secondary">
                      Destacar palavras durante a narração
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audioSettings.highlightText}
                      onChange={(e) => setAudioSettings(prev => ({ ...prev, highlightText: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-brand-secondary peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Volume Controls */}
                <div>
                  <label className="font-medium mb-3 block">Volume da Narração</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioSettings.volumeNarration}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, volumeNarration: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-brand-text-secondary mt-1">
                    <span>0%</span>
                    <span>{(audioSettings.volumeNarration * 100).toFixed(0)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Background Music Volume */}
                <div>
                  <label className="font-medium mb-3 block">Volume da Música de Fundo</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioSettings.volumeMusic}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, volumeMusic: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-brand-text-secondary mt-1">
                    <span>0%</span>
                    <span>{(audioSettings.volumeMusic * 100).toFixed(0)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Save Settings */}
                <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioNarrator;