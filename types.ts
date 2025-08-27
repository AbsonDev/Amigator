export interface Author {
  name: string;
  subscription: {
    tier: 'Free' | 'Hobby' | 'Amador' | 'Profissional';
    trialEnds?: string; // ISO string for trial end date
  };
  monthlyUsage: MonthlyUsage;
}

export interface MonthlyUsage {
  [feature: string]: {
    count: number;
    lastReset: string; // ISO string
  };
}

export interface Relationship {
  characterId: string;
  type: string; // ex: Amigo, Inimigo, Parente, Interesse Amoroso
  description: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  appearance: string; // Foco para a geração de imagem
  role: string;
  avatarUrl: string;
  narrativeArc: string;
  relationships: Relationship[];
}

export interface Chapter {
  id:string;
  title: string;
  summary: string;
  content: string;
}

export interface Message {
    role: 'user' | 'model' | 'character';
    parts: string;
}

export interface ScriptIssue {
  description: string;
  involvedChapters: string[];
  suggestion: string;
}

export interface RepetitionIssue {
    text: string;
    count: number;
    locations: string[]; // Chapter titles
}

export interface PacingPoint {
  chapterId: string;
  chapterTitle: string;
  tensionScore: number; // A score from 1 (low) to 10 (high)
  justification: string;
}

export interface CharacterVoiceDeviation {
  chapterId: string;
  chapterTitle: string;
  dialogueSnippet: string;
  explanation: string;
}

export interface StoryAnalysis {
    scriptIssues: {
        results: ScriptIssue[];
        ignored: string[]; // Array of issue descriptions
        lastAnalyzed: string | null;
    };
    repetitions: {
        results: RepetitionIssue[];
        ignored: string[]; // Array of repeated text
        lastAnalyzed: string | null;
    };
    pacing: {
        results: PacingPoint[];
        lastAnalyzed: string | null;
    };
    characterVoices: {
        [characterId: string]: {
            results: CharacterVoiceDeviation[];
            ignored: string[]; // Array of dialogueSnippets that are ignored
            lastAnalyzed: string | null;
        }
    };
}

export type WorldEntryCategory = 'Personagem' | 'Lugar' | 'Item' | 'Organização' | 'Evento';

export interface WorldEntry {
  id: string;
  name: string;
  category: WorldEntryCategory;
  description: string;
}

export interface ActionLogEntry {
  id: string;
  timestamp: string;
  actor: 'user' | 'agent';
  action: string;
}

export interface CoverTypography {
  fontFamily: 'serif' | 'sans-serif';
  color: 'light' | 'dark';
}

// Represents only the creative content of the story for versioning
export interface StoryContent {
  title: string;
  genre: string;
  synopsis: string;
  characters: Character[];
  chapters: Chapter[];
  world: WorldEntry[];
  coverUrl?: string;
  coverTypography?: CoverTypography;
}

export interface Version {
  id: string;
  name: string;
  createdAt: string;
  storyState: StoryContent; // Uses the content-only type
}

export interface PlotCard {
  id: string;
  title: string;
  description: string;
  position: { x: number; y: number };
  chapterId?: string;
  characterIds?: string[];
}

export interface PlotConnection {
  from: string; // from PlotCard id
  to: string; // to PlotCard id
}

export interface PlotData {
  cards: PlotCard[];
  connections: PlotConnection[];
}


export interface Story extends StoryContent {
  id: string;
  analysis: StoryAnalysis;
  chatHistory: Message[];
  versions: Version[];
  actionLog: ActionLogEntry[];
  autosaveEnabled: boolean;
  plot: PlotData;
}

export enum AppView {
  OVERVIEW,
  CHAPTERS,
  CHARACTERS,
  EDIT_CHAPTER,
  WORLD,
  HISTORY,
  COVER_DESIGN,
  PLOT,
  PACING_ANALYZER,
}

export interface BetaReaderFeedback {
  overallImpression: string;
  pacing: string;
  dialogue: string;
  characterConsistency: string;
  suggestionsForImprovement: string[];
}

export interface GrammarSuggestion {
  originalText: string;
  suggestedText: string;
  explanation: string;
}

export interface ShowDontTellSuggestion {
  originalText: string;
  suggestions: string[];
  explanation: string;
}