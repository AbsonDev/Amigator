import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useStory } from '../context/StoryContext';
import { suggestPlotPointsFromSummaries } from '../services/geminiService';
import type { PlotCard, PlotConnection } from '../types';
import { SparklesIcon, PlusIcon } from './Icons';
import PlotCardComponent from './plot/PlotCardComponent';
import EditPlotCardModal from './plot/EditPlotCardModal';

const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-brand-background/50 flex flex-col items-center justify-center z-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        <p className="mt-4 text-brand-text-secondary">A IA está analisando seus capítulos...</p>
    </div>
);

const PlotVisualizer: React.FC = () => {
    const { activeStory, updateActiveStory } = useStory();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Canvas interaction states
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
    
    // Connection states
    const [isConnecting, setIsConnecting] = useState<{ from: string; to: { x: number, y: number } } | null>(null);

    // Modal state
    const [editingCard, setEditingCard] = useState<PlotCard | "new" | null>(null);
    
    const plotData = useMemo(() => activeStory?.plot || { cards: [], connections: [] }, [activeStory]);
    const cardMap = useMemo(() => new Map(plotData.cards.map(card => [card.id, card])), [plotData.cards]);
    
    const handleSuggestPlotPoints = async () => {
        if (!activeStory) return;
        setIsLoading(true);
        try {
            const suggestions = await suggestPlotPointsFromSummaries(activeStory);
            const existingCards = plotData.cards;

            // Find the bottom-most coordinate of existing cards to stack new ones below.
            const bottomY = existingCards.length > 0 ? Math.max(...existingCards.map(c => c.position.y)) + 200 : 50; // Add card height + gap
            const startX = 50;

            const newCards: PlotCard[] = suggestions.map((suggestion, index) => ({
                ...suggestion,
                id: `plot-${Date.now()}-${index}`,
                position: {
                    x: startX + (index % 4) * 280, // 4 cards per row, 256 width + 24 gap
                    y: bottomY + Math.floor(index / 4) * 200, // 180 height + 20 gap
                },
            }));

            updateActiveStory(story => ({
                ...story,
                plot: { ...story.plot, cards: [...story.plot.cards, ...newCards] },
                actionLog: [...story.actionLog, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'agent', action: `Sugeriu ${newCards.length} pontos de trama com IA.`}]
            }));
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only pan if clicking on the background
        if (e.target === e.currentTarget) {
            setIsPanning(true);
            setStartPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanning) {
            setViewOffset(prev => ({
                x: prev.x + e.clientX - startPanPoint.x,
                y: prev.y + e.clientY - startPanPoint.y,
            }));
            setStartPanPoint({ x: e.clientX, y: e.clientY });
        }
        if (isConnecting) {
             const rect = containerRef.current?.getBoundingClientRect();
             if (rect) {
                setIsConnecting(prev => prev ? { ...prev, to: { x: (e.clientX - rect.left - viewOffset.x) / zoom, y: (e.clientY - rect.top - viewOffset.y) / zoom } } : null);
             }
        }
    };

    const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isConnecting) {
            const targetEl = e.target as HTMLElement;
            const cardEl = targetEl.closest<HTMLElement>('[data-card-id]');

            if (cardEl && cardEl.dataset.cardId) {
                const toCardId = cardEl.dataset.cardId;
                if (isConnecting.from !== toCardId) {
                    const newConnection: PlotConnection = { from: isConnecting.from, to: toCardId };
                    updateActiveStory(story => {
                        // Prevent duplicate connections
                        const existing = story.plot.connections.some(c => (c.from === newConnection.from && c.to === newConnection.to));
                        if (existing) return story;
                        return { ...story, plot: { ...story.plot, connections: [...story.plot.connections, newConnection] } };
                    });
                }
            }
        }
        setIsPanning(false);
        setIsConnecting(null);
    };

    const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            e.preventDefault();
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const zoomFactor = 0.1;
            const delta = e.deltaY > 0 ? -1 : 1;
            const newZoom = Math.max(0.2, Math.min(2, zoom + delta * zoomFactor * zoom));

            const worldX = (mouseX - viewOffset.x) / zoom;
            const worldY = (mouseY - viewOffset.y) / zoom;
            
            const newViewOffsetX = mouseX - worldX * newZoom;
            const newViewOffsetY = mouseY - worldY * newZoom;

            setZoom(newZoom);
            setViewOffset({ x: newViewOffsetX, y: newViewOffsetY });
        }
    }, [zoom, viewOffset]);
    
    const handleCardDrag = (cardId: string, newPosition: {x: number, y: number}) => {
       updateActiveStory(story => {
           const updatedCards = story.plot.cards.map(c => c.id === cardId ? { ...c, position: newPosition } : c);
           return { ...story, plot: { ...story.plot, cards: updatedCards } };
       });
    };
    
    const handleStartConnection = (fromCardId: string) => {
        const fromCard = cardMap.get(fromCardId);
        if (fromCard) {
            const startX = fromCard.position.x + 256; // Card width
            const startY = fromCard.position.y + 24;  // Connector Y position
            setIsConnecting({ from: fromCardId, to: { x: startX, y: startY } });
        }
    };

    const handleSaveCard = (cardToSave: Omit<PlotCard, 'id' | 'position'>, id?: string) => {
        updateActiveStory(story => {
            if (id) { // Editing existing card
                const updatedCards = story.plot.cards.map(c => c.id === id ? { ...c, ...cardToSave } : c);
                return { ...story, plot: { ...story.plot, cards: updatedCards } };
            } else { // Creating new card
                const newCard: PlotCard = {
                    ...cardToSave,
                    id: `plot-${Date.now()}`,
                    position: { x: (-viewOffset.x + 50) / zoom, y: (-viewOffset.y + 50) / zoom },
                };
                return { ...story, plot: { ...story.plot, cards: [...story.plot.cards, newCard] } };
            }
        });
        setEditingCard(null);
    };

    const handleDeleteCard = (cardId: string) => {
        updateActiveStory(story => ({
            ...story,
            plot: {
                cards: story.plot.cards.filter(c => c.id !== cardId),
                connections: story.plot.connections.filter(c => c.from !== cardId && c.to !== cardId),
            },
        }));
    };

    if (!activeStory) return null;

    return (
        <div className="relative w-full h-full overflow-hidden bg-brand-background">
            <div
                ref={containerRef}
                className="absolute inset-0 bg-[radial-gradient(#3c3c3c_1px,transparent_1px)] [background-size:24px_24px] cursor-grab active:cursor-grabbing"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp} // Also handles finishing connection if mouse leaves canvas
                onWheel={handleWheel}
            >
                <div style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})` }}>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: 0, left: 0, width: '100vw', height: '100vh' }}>
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#8a4fff" />
                            </marker>
                        </defs>
                        {plotData.connections.map(({ from, to }, i) => {
                            const fromCard = cardMap.get(from);
                            const toCard = cardMap.get(to);
                            if (!fromCard || !toCard) return null;
                            const x1 = fromCard.position.x + 256;
                            const y1 = fromCard.position.y + 24;
                            const x2 = toCard.position.x;
                            const y2 = toCard.position.y + 24;
                            const controlPointOffset = Math.max(50, Math.abs(y2 - y1) * 0.3);
                            return <path key={i} d={`M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`} stroke="#8a4fff" strokeWidth="2" fill="none" className="connection-line" markerEnd="url(#arrow)" />;
                        })}
                        {isConnecting && cardMap.has(isConnecting.from) && (
                            (() => {
                                const fromCard = cardMap.get(isConnecting.from);
                                if (!fromCard) return null;
                                const x1 = fromCard.position.x + 256;
                                const y1 = fromCard.position.y + 24;
                                const x2 = isConnecting.to.x;
                                const y2 = isConnecting.to.y;
                                const controlPointOffset = Math.max(50, Math.abs(y2 - y1) * 0.3);
                                return <path d={`M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`} stroke="#8a4fff" strokeWidth="2" strokeDasharray="5,5" fill="none" className="connection-preview" />;
                            })()
                        )}
                    </svg>

                    {plotData.cards.map(card => (
                        <PlotCardComponent
                            key={card.id}
                            card={card}
                            zoom={zoom}
                            onDrag={handleCardDrag}
                            onEdit={() => setEditingCard(card)}
                            onDelete={() => handleDeleteCard(card.id)}
                            onStartConnection={handleStartConnection}
                        />
                    ))}
                </div>
            </div>
            
            <div className="absolute top-0 left-0 p-4 sm:p-6 md:p-8 z-10 w-full flex justify-between items-center bg-brand-background/80 backdrop-blur-sm">
                 <div>
                     <h1 className="text-3xl font-bold font-serif text-brand-text-primary">Visualizador de Trama</h1>
                     <p className="text-sm text-brand-text-secondary">Arraste os cartões, conecte os pontos e use a roda do mouse para dar zoom.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setEditingCard("new")} className="flex items-center gap-2 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all">
                        <PlusIcon className="w-5 h-5" /> Adicionar Cartão
                    </button>
                    <button onClick={handleSuggestPlotPoints} disabled={isLoading} className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50">
                        <SparklesIcon className="w-5 h-5" /> Sugerir com IA
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            
            {editingCard && (
                <EditPlotCardModal
                    card={editingCard === "new" ? undefined : editingCard}
                    onSave={handleSaveCard}
                    onClose={() => setEditingCard(null)}
                />
            )}
        </div>
    );
};

export default PlotVisualizer;