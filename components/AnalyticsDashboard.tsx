import React, { useState, useEffect, useMemo } from 'react';
import { useStory } from '../context/StoryContext';
import { analyzeStoryAnalytics } from '../services/analyticsService';
import type { WritingAnalytics } from '../types/analytics';
import { ChartBarIcon, TrendingUpIcon, UsersIcon, BookOpenIcon, SparklesIcon, ClockIcon } from './Icons';

const AnalyticsDashboard: React.FC = () => {
  const { activeStory } = useStory();
  const [analytics, setAnalytics] = useState<WritingAnalytics | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'characters' | 'sentiment' | 'vocabulary'>('overview');
  
  useEffect(() => {
    if (activeStory) {
      const data = analyzeStoryAnalytics(activeStory);
      setAnalytics(data);
    }
  }, [activeStory]);
  
  if (!activeStory || !analytics) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-brand-text-secondary">Nenhuma história selecionada para análise</p>
      </div>
    );
  }
  
  // Calculate chart data for word count over time
  const wordCountChartData = useMemo(() => {
    if (!analytics.dailyWords) return [];
    return analytics.dailyWords.slice(-7).map(day => ({
      date: new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      words: day.words
    }));
  }, [analytics.dailyWords]);
  
  // Get top characters by mentions
  const topCharacters = useMemo(() => {
    return [...analytics.characterMentions]
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);
  }, [analytics.characterMentions]);
  
  return (
    <div className="h-full overflow-y-auto bg-brand-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary/10 to-purple-600/10 p-6 border-b border-brand-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-brand-text-secondary">
            Análise detalhada da sua escrita e progresso
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 border-b border-brand-secondary/30">
          {[
            { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
            { id: 'characters', label: 'Personagens', icon: UsersIcon },
            { id: 'sentiment', label: 'Sentimento', icon: SparklesIcon },
            { id: 'vocabulary', label: 'Vocabulário', icon: BookOpenIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                selectedTab === tab.id
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total de Palavras"
                value={analytics.totalWords.toLocaleString()}
                icon={BookOpenIcon}
                trend="+12%"
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Capítulos"
                value={analytics.totalChapters.toString()}
                icon={ChartBarIcon}
                subtitle={`Média: ${analytics.averageChapterLength.toLocaleString()} palavras`}
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="Personagens"
                value={analytics.totalCharacters.toString()}
                icon={UsersIcon}
                subtitle="Ativos na história"
                color="from-purple-500 to-purple-600"
              />
              <StatCard
                title="Writing Streak"
                value={`${analytics.writingStreak} dias`}
                icon={TrendingUpIcon}
                trend="🔥"
                color="from-orange-500 to-orange-600"
              />
            </div>
            
            {/* Word Count Chart */}
            <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
              <h3 className="text-xl font-bold mb-4">Palavras Escritas (Últimos 7 dias)</h3>
              <div className="h-64 flex items-end gap-2">
                {wordCountChartData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-brand-text-secondary mb-2">
                      {day.words.toLocaleString()}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-brand-primary to-purple-600 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${(day.words / Math.max(...wordCountChartData.map(d => d.words))) * 100}%` }}
                    />
                    <div className="text-xs text-brand-text-secondary mt-2">
                      {day.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Writing Speed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-brand-primary" />
                  Velocidade de Escrita
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Média</span>
                    <span className="font-bold">{analytics.writingSpeed.averageWPM} WPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Mais Rápido</span>
                    <span className="font-bold text-green-500">{analytics.writingSpeed.fastestSession} WPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Mais Lento</span>
                    <span className="font-bold text-orange-500">{analytics.writingSpeed.slowestSession} WPM</span>
                  </div>
                  <div className="pt-3 border-t border-brand-secondary/30">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-brand-text-secondary">
                        Tendência: <span className="font-bold text-green-500">Melhorando</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Most Used Words */}
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <h3 className="text-xl font-bold mb-4">Palavras Mais Usadas</h3>
                <div className="space-y-2">
                  {analytics.mostUsedWords.slice(0, 5).map((word, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-brand-text-primary">{word.word}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand-text-secondary">{word.count}x</span>
                        {word.category === 'overused' && (
                          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-500 rounded">
                            Overused
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'characters' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Análise de Personagens</h2>
            
            {/* Character Mentions Chart */}
            <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
              <h3 className="text-xl font-bold mb-4">Menções por Personagem</h3>
              <div className="space-y-4">
                {topCharacters.map((char, index) => (
                  <div key={char.characterId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{char.characterName}</span>
                      <span className="text-sm text-brand-text-secondary">
                        {char.mentions} menções
                      </span>
                    </div>
                    <div className="w-full bg-brand-secondary/30 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-brand-primary to-purple-600 rounded-full transition-all"
                        style={{ width: `${(char.mentions / topCharacters[0].mentions) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-brand-text-secondary">
                      Aparece em {char.chapters.length} capítulos
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Character Relationships */}
            <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
              <h3 className="text-xl font-bold mb-4">Rede de Relacionamentos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {analytics.characterMentions.map(char => (
                  <div key={char.characterId} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-brand-primary to-purple-600" />
                    <div className="font-medium text-sm">{char.characterName}</div>
                    <div className="text-xs text-brand-text-secondary">
                      {char.relationships.length} conexões
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'sentiment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Análise de Sentimento</h2>
            
            {/* Chapter Sentiments */}
            <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
              <h3 className="text-xl font-bold mb-4">Sentimento por Capítulo</h3>
              <div className="space-y-4">
                {analytics.sentimentAnalysis.map(chapter => (
                  <div key={chapter.chapterId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{chapter.chapterTitle}</span>
                      <span className={`text-sm font-bold ${
                        chapter.overallSentiment > 0 ? 'text-green-500' : 
                        chapter.overallSentiment < 0 ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {chapter.overallSentiment > 0 ? '😊' : 
                         chapter.overallSentiment < 0 ? '😢' : '😐'}
                        {' '}{(chapter.overallSentiment * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    {/* Emotion bars */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {Object.entries(chapter.emotions).slice(0, 4).map(([emotion, value]) => (
                        <div key={emotion} className="space-y-1">
                          <div className="text-brand-text-secondary capitalize">{emotion}</div>
                          <div className="w-full bg-brand-secondary/30 rounded-full h-1">
                            <div
                              className="h-full bg-brand-primary rounded-full"
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-4 text-xs text-brand-text-secondary">
                      <span>Ritmo: <span className="font-bold">{chapter.pacing}</span></span>
                      <span>Tensão: <span className="font-bold">{(chapter.tension * 100).toFixed(0)}%</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Emotional Arcs */}
            <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
              <h3 className="text-xl font-bold mb-4">Arcos Emocionais</h3>
              <div className="space-y-3">
                {analytics.emotionalArcs.map((arc, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-brand-secondary/20 rounded-lg">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      arc.arcType === 'rise' ? 'bg-green-500/20' :
                      arc.arcType === 'fall' ? 'bg-red-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {arc.arcType === 'rise' ? '📈' :
                       arc.arcType === 'fall' ? '📉' : '➡️'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        Capítulos {arc.chapterRange[0] + 1} - {arc.chapterRange[1] + 1}
                      </div>
                      <div className="text-sm text-brand-text-secondary">
                        Intensidade: {(arc.intensity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'vocabulary' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Análise de Vocabulário</h2>
            
            {/* Vocabulary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <div className="text-3xl font-bold text-brand-primary">
                  {analytics.vocabularyComplexity.uniqueWords.toLocaleString()}
                </div>
                <div className="text-sm text-brand-text-secondary mt-1">Palavras Únicas</div>
              </div>
              
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <div className="text-3xl font-bold text-green-500">
                  {analytics.vocabularyComplexity.readabilityScore.toFixed(1)}
                </div>
                <div className="text-sm text-brand-text-secondary mt-1">Índice de Leitura</div>
              </div>
              
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <div className="text-3xl font-bold text-purple-500">
                  {analytics.vocabularyComplexity.gradeLevel}º
                </div>
                <div className="text-sm text-brand-text-secondary mt-1">Nível de Escolaridade</div>
              </div>
              
              <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
                <div className="text-3xl font-bold text-orange-500">
                  {analytics.vocabularyComplexity.averageSentenceLength.toFixed(1)}
                </div>
                <div className="text-sm text-brand-text-secondary mt-1">Palavras por Frase</div>
              </div>
            </div>
            
            {/* Word Cloud */}
            <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30">
              <h3 className="text-xl font-bold mb-4">Nuvem de Palavras</h3>
              <div className="flex flex-wrap gap-2">
                {analytics.mostUsedWords.map((word, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full transition-all hover:scale-110 ${
                      word.category === 'overused' 
                        ? 'bg-orange-500/20 text-orange-500' 
                        : word.category === 'common'
                        ? 'bg-brand-primary/20 text-brand-primary'
                        : 'bg-purple-500/20 text-purple-500'
                    }`}
                    style={{ fontSize: `${Math.max(12, Math.min(24, word.count / 2))}px` }}
                  >
                    {word.word}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Suggestions */}
            <div className="bg-gradient-to-r from-brand-primary/10 to-purple-600/10 rounded-xl p-6 border border-brand-primary/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-brand-primary" />
                Sugestões de Melhoria
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm">
                    Seu vocabulário está diversificado com {analytics.vocabularyComplexity.uniqueWords} palavras únicas
                  </span>
                </li>
                {analytics.vocabularyComplexity.readabilityScore < 60 && (
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">!</span>
                    <span className="text-sm">
                      Considere simplificar algumas frases para melhorar a legibilidade
                    </span>
                  </li>
                )}
                {analytics.mostUsedWords.some(w => w.category === 'overused') && (
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">!</span>
                    <span className="text-sm">
                      Algumas palavras estão sendo usadas em excesso. Tente variar com sinônimos
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.FC<any>;
  trend?: string;
  subtitle?: string;
  color: string;
}> = ({ title, value, icon: Icon, trend, subtitle, color }) => (
  <div className="bg-brand-surface/50 backdrop-blur-sm rounded-xl p-6 border border-brand-secondary/30 hover:border-brand-primary/30 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className="text-sm font-bold text-green-500">{trend}</span>
      )}
    </div>
    <div className="text-3xl font-bold text-brand-text-primary">{value}</div>
    <div className="text-sm text-brand-text-secondary mt-1">{title}</div>
    {subtitle && (
      <div className="text-xs text-brand-text-secondary mt-2">{subtitle}</div>
    )}
  </div>
);

export default AnalyticsDashboard;