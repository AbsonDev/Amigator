import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, StopIcon } from './Icons';

interface VoiceCommandsProps {
  onTextInsert: (text: string) => void;
  onCommand: (command: string, params?: any) => void;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onTextInsert, onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      const confidence = event.results[current][0].confidence;
      
      setTranscript(transcript);
      setConfidence(confidence);

      // Check for commands
      if (event.results[current].isFinal) {
        processTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const processTranscript = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Voice commands
    const commands: Record<string, () => void> = {
      'novo parágrafo': () => onCommand('newParagraph'),
      'nova linha': () => onCommand('newLine'),
      'deletar última frase': () => onCommand('deleteLast'),
      'desfazer': () => onCommand('undo'),
      'refazer': () => onCommand('redo'),
      'salvar': () => onCommand('save'),
      'negrito': () => onCommand('bold'),
      'itálico': () => onCommand('italic'),
      'aspas': () => onCommand('quotes'),
    };

    // Check if it's a command
    for (const [cmd, action] of Object.entries(commands)) {
      if (lowerText.includes(cmd)) {
        action();
        return;
      }
    }

    // Otherwise, insert as text
    onTextInsert(text);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleListening}
        className={`p-2 rounded-lg transition-all ${
          isListening 
            ? 'bg-red-600 text-white animate-pulse' 
            : 'bg-brand-secondary/30 text-brand-text-secondary hover:bg-brand-secondary/50'
        }`}
        title={isListening ? 'Parar ditado' : 'Iniciar ditado'}
      >
        {isListening ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
      </button>
      
      {isListening && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-brand-text-secondary">Ouvindo...</span>
          {transcript && (
            <span className="text-sm text-brand-text-primary italic">"{transcript}"</span>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceCommands;