// Audio Narration Types and Interfaces

export interface AudioNarration {
  id: string;
  storyId: string;
  chapterId?: string;
  title: string;
  audioUrl: string;
  duration: number; // seconds
  voice: VoiceProfile;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'young' | 'adult' | 'elderly';
  language: string;
  accent?: string;
  pitch: number; // -1 to 1
  speed: number; // 0.5 to 2
  emotion?: VoiceEmotion;
}

export type VoiceEmotion = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'calm'
  | 'serious'
  | 'playful';

export interface AudioChapter {
  chapterId: string;
  chapterTitle: string;
  startTime: number;
  endTime: number;
  paragraphs: AudioParagraph[];
}

export interface AudioParagraph {
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string; // for dialogue
}

export interface AudioSettings {
  autoPlay: boolean;
  highlightText: boolean;
  backgroundMusic?: string;
  volumeMusic: number;
  volumeNarration: number;
  pauseBetweenChapters: number; // seconds
}

export interface AudiobookMetadata {
  title: string;
  author: string;
  narrator: string;
  duration: number;
  chapters: number;
  language: string;
  genre: string;
  copyright?: string;
  isbn?: string;
}

// Available voice presets
export const VOICE_PRESETS: VoiceProfile[] = [
  {
    id: 'narrator-male-adult',
    name: 'João (Narrador)',
    gender: 'male',
    age: 'adult',
    language: 'pt-BR',
    pitch: 0,
    speed: 1
  },
  {
    id: 'narrator-female-adult',
    name: 'Maria (Narradora)',
    gender: 'female',
    age: 'adult',
    language: 'pt-BR',
    pitch: 0.1,
    speed: 1
  },
  {
    id: 'character-young-female',
    name: 'Ana (Jovem)',
    gender: 'female',
    age: 'young',
    language: 'pt-BR',
    pitch: 0.3,
    speed: 1.1
  },
  {
    id: 'character-elderly-male',
    name: 'Carlos (Idoso)',
    gender: 'male',
    age: 'elderly',
    language: 'pt-BR',
    pitch: -0.2,
    speed: 0.9
  },
  {
    id: 'character-child',
    name: 'Pedro (Criança)',
    gender: 'neutral',
    age: 'child',
    language: 'pt-BR',
    pitch: 0.5,
    speed: 1.2
  }
];