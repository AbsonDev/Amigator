import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useStory } from '../context/StoryContext';
import debounce from 'lodash.debounce';

const ManuscriptView: React.FC = () => {
    const { activeStory, updateActiveStory } = useStory();
    const editorRef = useRef<HTMLDivElement>(null);

    // This effect handles updates coming from OUTSIDE this component (e.g., ChapterEditor)
    // It compares the current DOM content with the story context and updates if they differ.
    // This is crucial for keeping the views in sync.
    useEffect(() => {
        if (!editorRef.current || !activeStory) return;

        const parser = new DOMParser();
        const domFromStory = parser.parseFromString(
            activeStory.chapters.map(c => c.content).join(''), 
            'text/html'
        );
        const domFromEditor = parser.parseFromString(
             Array.from(editorRef.current.querySelectorAll('.manuscript-chapter-content')).map(el => el.innerHTML).join(''),
            'text/html'
        );
        
        // If text content differs, an external change likely happened.
        if (domFromStory.body.textContent !== domFromEditor.body.textContent) {
            const fullHtml = activeStory.chapters.map(chapter =>
                `<div class="manuscript-chapter-wrapper" data-chapter-id="${chapter.id}">
                    <h2 class="text-2xl font-bold font-serif my-4 p-2 bg-brand-secondary rounded-md" contenteditable="false">${chapter.title}</h2>
                    <div class="manuscript-chapter-content">${chapter.content}</div>
                 </div>`
            ).join('<hr class="my-8 border-brand-secondary/50" />');
            editorRef.current.innerHTML = fullHtml;
        }

    }, [activeStory]); // Rerun whenever the story object changes from context

    // This effect sets the initial content when the component mounts or the story ID changes.
    useEffect(() => {
        if (editorRef.current && activeStory) {
             const fullHtml = activeStory.chapters.map(chapter =>
                `<div class="manuscript-chapter-wrapper" data-chapter-id="${chapter.id}">
                    <h2 class="text-2xl font-bold font-serif my-4 p-2 bg-brand-secondary rounded-md" contenteditable="false">${chapter.title}</h2>
                    <div class="manuscript-chapter-content">${chapter.content}</div>
                 </div>`
            ).join('<hr class="my-8 border-brand-secondary/50" />');
            editorRef.current.innerHTML = fullHtml;
        }
    }, [activeStory?.id]);


    const debouncedUpdate = useMemo(() => debounce((html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const chapterElements = doc.querySelectorAll<HTMLDivElement>('[data-chapter-id]');
        
        const newContentMap = new Map<string, string>();
        chapterElements.forEach(el => {
            const id = el.dataset.chapterId;
            const contentEl = el.querySelector<HTMLDivElement>('.manuscript-chapter-content');
            if (id && contentEl) {
                newContentMap.set(id, contentEl.innerHTML);
            }
        });

        if (newContentMap.size > 0) {
            updateActiveStory(story => ({
                ...story,
                chapters: story.chapters.map(ch => {
                    const newContent = newContentMap.get(ch.id);
                    if (newContent !== undefined && ch.content !== newContent) {
                        return { ...ch, content: newContent };
                    }
                    return ch;
                })
            }));
        }
    }, 1500), [updateActiveStory]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            debouncedUpdate(editorRef.current.innerHTML);
        }
    }, [debouncedUpdate]);

    if (!activeStory) {
        return <div className="p-8">Carregando história...</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col overflow-hidden">
            <header className="flex-shrink-0">
                <h1 className="text-3xl font-bold font-serif text-brand-text-primary mb-2">Manuscrito Completo</h1>
                <p className="text-brand-text-secondary mb-6">Veja e edite todos os seus capítulos em um único lugar. As alterações são sincronizadas com a visualização de capítulos individuais.</p>
            </header>
            <main className="flex-grow bg-brand-surface border border-brand-secondary rounded-lg overflow-y-auto">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleInput}
                    className="w-full max-w-4xl mx-auto p-8 font-serif text-lg leading-relaxed text-brand-text-primary outline-none"
                    aria-label="Editor de Manuscrito"
                />
            </main>
        </div>
    );
};

export default ManuscriptView;
