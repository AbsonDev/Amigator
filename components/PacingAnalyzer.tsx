import React, { useState, useMemo } from 'react';
import { useStory } from '../context/StoryContext';
import { useAuthor } from '../context/AuthorContext';
import { analyzePacingAndTension } from '../services/geminiService';
import { SparklesIcon, ChartBarIcon, LockClosedIcon } from './Icons';
import type { PacingPoint } from '../types';

interface PacingAnalyzerProps {
    onNavigateToChapter: (chapterId: string) => void;
    openUpgradeModal: () => void;
}

const PacingChart: React.FC<{ data: PacingPoint[], onNavigateToChapter: (chapterId: string) => void }> = ({ data, onNavigateToChapter }) => {
    const [tooltip, setTooltip] = useState<{ visible: boolean; content: PacingPoint | null; x: number; y: number }>({ visible: false, content: null, x: 0, y: 0 });

    const width = 1000;
    const height = 400;
    const margin = { top: 20, right: 40, bottom: 80, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = (index: number) => margin.left + (index / (data.length - 1)) * innerWidth;
    const yScale = (score: number) => margin.top + innerHeight - ((score - 1) / 9) * innerHeight;

    const linePath = data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(index)} ${yScale(point.tensionScore)}`).join(' ');

    const handleMouseEnter = (e: React.MouseEvent<SVGCircleElement>, point: PacingPoint) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Fix: Correctly type the event target to access ownerSVGElement and handle potential null value.
        const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (svgRect) {
            setTooltip({ visible: true, content: point, x: rect.left - svgRect.left, y: rect.top - svgRect.top });
        }
    };

    return (
        <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-brand-surface border border-brand-secondary rounded-lg">
                {/* Y-Axis labels */}
                {[1, 3, 5, 7, 9].map(score => (
                    <g key={score}>
                        <text x={margin.left - 10} y={yScale(score) + 4} textAnchor="end" fill="#a0a0a0" fontSize="10">{score}</text>
                        <line x1={margin.left} x2={width - margin.right} y1={yScale(score)} y2={yScale(score)} stroke="#3c3c3c" strokeDasharray="2,2" />
                    </g>
                ))}
                 <text x={margin.left - 30} y={height/2} textAnchor="middle" fill="#a0a0a0" fontSize="12" transform={`rotate(-90, ${margin.left - 30}, ${height/2})`}>Nível de Tensão</text>

                {/* Data line and points */}
                <path d={linePath} fill="none" stroke="#8a4fff" strokeWidth="2" />
                {data.map((point, index) => (
                    <g key={point.chapterId}>
                        <circle
                            cx={xScale(index)}
                            cy={yScale(point.tensionScore)}
                            r="8"
                            fill="#1e1e1e"
                            stroke="#8a4fff"
                            strokeWidth="2"
                            className="cursor-pointer"
                            onClick={() => onNavigateToChapter(point.chapterId)}
                            onMouseEnter={(e) => handleMouseEnter(e, point)}
                            onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                        />
                         {/* X-Axis labels */}
                        <text x={xScale(index)} y={height - margin.bottom + 20} textAnchor="middle" fill="#a0a0a0" fontSize="10" className="max-w-[10px] truncate">
                           Cap. {index + 1}
                        </text>
                    </g>
                ))}
            </svg>
            {tooltip.visible && tooltip.content && (
                <div 
                    className="absolute z-10 p-3 bg-brand-background border border-brand-secondary rounded-lg shadow-lg w-64 text-sm pointer-events-none transition-opacity"
                    style={{ left: tooltip.x + 15, top: tooltip.y - 15, transform: 'translateY(-100%)' }}
                >
                    <p className="font-bold text-brand-text-primary">{tooltip.content.chapterTitle}</p>
                    <p className="text-brand-primary font-semibold">Tensão: {tooltip.content.tensionScore}/10</p>
                    <p className="text-brand-text-secondary mt-1 text-xs italic">"{tooltip.content.justification}"</p>
                    <p className="text-xs text-brand-text-secondary/50 mt-2">Clique para ir ao capítulo</p>
                </div>
            )}
        </div>
    );
};


const PacingAnalyzer: React.FC<PacingAnalyzerProps> = ({ onNavigateToChapter, openUpgradeModal }) => {
    const { author, setAuthor } = useAuthor();
    const { activeStory, updateActiveStory } = useStory();
    const [isLoading, setIsLoading] = useState(false);

    if (!activeStory || !author) return null;
    
    const isPro = ['Amador', 'Profissional'].includes(author.subscription.tier);
    const analysisData = activeStory.analysis.pacing;

    const getUsageStatus = (featureKey: string, limit: number) => {
      const usage = author.monthlyUsage?.[featureKey] || { count: 0, lastReset: new Date(0).toISOString() };
      const now = new Date();
      const lastReset = new Date(usage.lastReset);
      
      let currentCount = usage.count;
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
          currentCount = 0;
      }
      
      return {
          canUse: currentCount < limit,
          remaining: Math.max(0, limit - currentCount)
      };
    };

    const trackUsage = (featureKey: string) => {
      const now = new Date();
      const currentUsage = author.monthlyUsage?.[featureKey] || { count: 0, lastReset: new Date(0).toISOString() };
      const lastReset = new Date(currentUsage.lastReset);
      
      let count = currentUsage.count;
      let resetDate = currentUsage.lastReset;

      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
          count = 0;
          resetDate = now.toISOString();
      }
      
      setAuthor({
          ...author,
          monthlyUsage: {
              ...author.monthlyUsage,
              [featureKey]: {
                  count: count + 1,
                  lastReset: resetDate
              }
          }
      });
    };

    const usageStatus = getUsageStatus('pacingAnalysis', 1);

    const handleAnalyze = async () => {
        if (!isPro && !usageStatus.canUse) {
            openUpgradeModal();
            return;
        }
        setIsLoading(true);
        try {
            const results = await analyzePacingAndTension(activeStory);
            if (!isPro) trackUsage('pacingAnalysis');
            updateActiveStory(story => ({
                ...story,
                analysis: {
                    ...story.analysis,
                    pacing: { results, lastAnalyzed: new Date().toISOString() }
                },
                actionLog: [...story.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'agent', action: 'Executou uma análise de ritmo e tensão.'}]
            }));
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Analisador de Ritmo e Tensão</h1>
                    <p className="text-brand-text-secondary max-w-2xl">Visualize o fluxo emocional da sua história, identifique seções lentas e garanta que seus momentos de clímax tenham o impacto desejado.</p>
                </div>
                 <button onClick={handleAnalyze} disabled={isLoading} className="relative flex-shrink-0 flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50">
                    {!isPro && <span className="absolute -top-2 -right-2 text-xs bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full">PRO</span>}
                    {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Analisando...</> : <><SparklesIcon className="w-5 h-5" /> Analisar Ritmo</>}
                 </button>
            </div>
            
            {!isPro && !usageStatus.canUse ? (
                <div className="text-center py-20 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg">
                    <LockClosedIcon className="w-12 h-12 mx-auto text-yellow-400" />
                    <h2 className="mt-4 text-2xl font-bold text-brand-text-primary">Limite Mensal Atingido</h2>
                    <p className="mt-2 text-brand-text-secondary max-w-md mx-auto">Você usou sua análise de ritmo gratuita deste mês. Faça upgrade para análises ilimitadas.</p>
                    <button onClick={openUpgradeModal} className="mt-6 bg-brand-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-opacity-90">
                        Ver Planos
                    </button>
                </div>
            ) : analysisData.results.length > 0 ? (
                <div>
                    <PacingChart data={analysisData.results} onNavigateToChapter={onNavigateToChapter} />
                     <p className="text-right text-xs text-brand-text-secondary mt-2">
                        {!isPro && `(${usageStatus.remaining} uso gratuito restante) `}
                        Última análise em: {new Date(analysisData.lastAnalyzed || Date.now()).toLocaleString()}
                    </p>
                </div>
            ) : (
                 <div className="text-center py-20 bg-brand-surface border-2 border-dashed border-brand-secondary rounded-lg">
                    <ChartBarIcon className="w-16 h-16 mx-auto text-brand-secondary" />
                    <h2 className="mt-4 text-xl font-semibold text-brand-text-primary">Pronto para analisar sua história?</h2>
                    <p className="mt-2 text-brand-text-secondary">
                        Clique em "Analisar Ritmo" para que a IA gere um gráfico visual da tensão em sua narrativa.
                        {!isPro && ` Você tem ${usageStatus.remaining} uso gratuito restante este mês.`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PacingAnalyzer;