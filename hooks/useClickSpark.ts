import { useEffect, useCallback } from 'react';

/**
 * Um hook customizado para criar um efeito de ondulação/faísca no clique.
 * Ele anexa um span estilizado ao elemento referenciado e o remove após a animação.
 * O elemento alvo deve ter `position: relative` e `overflow: hidden`.
 * 
 * @param ref Um React ref anexado ao HTMLElement clicável.
 */
const useClickSpark = (ref: React.RefObject<HTMLElement>) => {
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (!target) return;

    // Garante que o botão tenha os estilos necessários para que o efeito seja contido.
    const computedStyle = window.getComputedStyle(target);
    if (computedStyle.position === 'static') {
      target.style.position = 'relative';
    }
    target.style.overflow = 'hidden';

    // Cria o elemento da faísca
    const spark = document.createElement('span');
    spark.className = 'click-spark';
    
    // Posiciona a faísca no local do clique
    const rect = target.getBoundingClientRect();
    spark.style.top = `${e.clientY - rect.top}px`;
    spark.style.left = `${e.clientX - rect.left}px`;
    
    // Adiciona ao DOM e configura a limpeza
    target.appendChild(spark);
    spark.addEventListener('animationend', () => {
      spark.remove();
    }, { once: true });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      // Usa mousedown para uma sensação de feedback mais imediata
      element.addEventListener('mousedown', handleClick);
    }
    return () => {
      if (element) {
        element.removeEventListener('mousedown', handleClick);
      }
    };
  }, [ref, handleClick]);
};

export default useClickSpark;
