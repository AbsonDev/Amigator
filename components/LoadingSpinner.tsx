
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './Icons';

const messages = [
  "Invocando as musas da criatividade...",
  "Consultando oráculos literários...",
  "Pintando os retratos dos seus personagens...",
  "Tecendo o fio da narrativa...",
  "Dando vida aos personagens...",
  "Construindo mundos palavra por palavra...",
  "Aguardando a inspiração divina...",
];

const LoadingSpinner = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-brand-background bg-opacity-80 backdrop-blur-sm flex flex-col justify-center items-center z-50">
      <div className="text-center p-8 rounded-lg">
        <SparklesIcon className="w-16 h-16 text-brand-primary mx-auto animate-pulse" />
        <h2 className="text-2xl font-bold text-brand-text-primary mt-6">Gerando sua História</h2>
        <p className="text-brand-text-secondary mt-2 transition-opacity duration-500 ease-in-out">
          {messages[messageIndex]}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;