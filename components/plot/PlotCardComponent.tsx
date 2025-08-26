import React, { useState } from 'react';
import type { PlotCard } from '../../types';
import { useStory } from '../../context/StoryContext';
import { BookOpenIcon, UsersIcon, PencilSquareIcon, TrashIcon } from '../Icons';

interface PlotCardComponentProps {
    card: PlotCard;
    zoom: number;
    onDrag: (cardId: string, newPosition: { x: number, y: number }) => void;
    onEdit: () => void;
    onDelete: () => void;
    onStartConnection: (fromCardId: string) => void;
}

const PlotCardComponent: React.FC<PlotCardComponentProps> = ({ card, zoom, onDrag, onEdit, onDelete, onStartConnection }) => {
    const { activeStory } = useStory();
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Ignora cliques nos controles ou conectores
        if ((e.target as HTMLElement).closest('.card-control') || (e.target as HTMLElement).closest('.card-connector-out')) return;
        
        // Impede o início da panorâmica do canvas ao arrastar o cartão
        e.stopPropagation(); 
        
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (dragStart) {
            // Ajusta o movimento com base no nível de zoom
            const dx = (e.clientX - dragStart.x) / zoom;
            const dy = (e.clientY - dragStart.y) / zoom;
            const newPos = {
                x: card.position.x + dx,
                y: card.position.y + dy,
            };
            onDrag(card.id, newPos);
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    };
    
    // O onMouseUp principal no contêiner cuidará da lógica de conexão.
    // Este onMouseUp é apenas para o estado de arrastar do cartão.
    const handleMouseUp = () => {
        setDragStart(null);
    };
    
    if (!activeStory) return null;

    const chapter = card.chapterId ? activeStory.chapters.find(c => c.id === card.chapterId) : null;
    const characters = (card.characterIds || []).map(id => activeStory.characters.find(c => c.id === id)).filter(Boolean);

    return (
        <div
            data-card-id={card.id} // Atributo para detecção fácil no contêiner pai
            className="absolute w-64 p-4 bg-brand-surface border border-brand-secondary rounded-lg shadow-lg cursor-grab active:cursor-grabbing select-none flex flex-col group"
            style={{ left: card.position.x, top: card.position.y, minHeight: '180px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Finaliza o arrastar se o mouse sair
        >
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity card-control z-10">
                <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-brand-secondary"><PencilSquareIcon className="w-4 h-4" /></button>
                <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400"><TrashIcon className="w-4 h-4" /></button>
            </div>
            
            <div
                className="card-connector-out"
                onMouseDown={(e) => { e.stopPropagation(); onStartConnection(card.id); }}
                title="Arrastar para conectar"
            />
            <div
                className="card-connector-in"
                title="Ponto de conexão"
            />
            
            <h3 className="font-bold text-brand-text-primary pb-1 mb-2 border-b border-brand-secondary pr-12">{card.title}</h3>
            <p className="text-xs text-brand-text-secondary font-serif flex-grow overflow-y-auto pr-1">{card.description}</p>
            <div className="flex-shrink-0 mt-2 pt-2 border-t border-brand-secondary text-xs text-brand-text-secondary space-y-1">
                {chapter && (
                    <div className="flex items-center gap-1.5 truncate">
                        <BookOpenIcon className="w-3.5 h-3.5 flex-shrink-0 text-brand-primary" />
                        <span>{chapter.title}</span>
                    </div>
                )}
                {characters.length > 0 && (
                    <div className="flex items-center gap-1.5 truncate">
                        <UsersIcon className="w-3.5 h-3.5 flex-shrink-0 text-brand-primary" />
                        <span>{characters.map(c => c?.name).join(', ')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlotCardComponent;
