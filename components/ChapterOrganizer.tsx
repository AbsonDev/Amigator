
import React from 'react';
import type { Chapter } from '../types';
import { useStory } from '../context/StoryContext';
import { PencilIcon } from './Icons';

interface ChapterOrganizerProps {
    onEditChapter: (chapter: Chapter) => void;
}

const ChapterOrganizer: React.FC<ChapterOrganizerProps> = React.memo(({ onEditChapter }) => {
  const { activeStory } = useStory();

  if (!activeStory) return null;

  return (
    <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl font-bold font-serif text-brand-text-primary mb-6">Estrutura de Capítulos</h1>
        <div className="space-y-4">
            {activeStory.chapters.map((chapter, index) => (
                <div key={chapter.id} className="bg-brand-surface p-4 rounded-lg border border-brand-secondary flex justify-between items-center transition-all hover:border-brand-primary hover:shadow-lg">
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-brand-primary">
                           {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                            <h3 className="font-semibold text-brand-text-primary">{chapter.title}</h3>
                            <p className="text-sm text-brand-text-secondary font-serif italic">{chapter.summary}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onEditChapter(chapter)}
                        className="flex items-center gap-2 bg-brand-secondary text-brand-text-primary font-semibold py-2 px-3 rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
                    >
                       <PencilIcon className="w-4 h-4"/>
                       Editar
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
});

ChapterOrganizer.displayName = 'ChapterOrganizer';

export default ChapterOrganizer;
