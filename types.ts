export interface Author {
  name: string;
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
  id: string;
  title: string;
  summary: string;
  content: string;
}

export interface Message {
    role: 'user' | 'model';
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

// Represents only the creative content of the story for versioning
export interface StoryContent {
  title: string;
  genre: string;
  synopsis: string;
  characters: Character[];
  chapters: Chapter[];
  world: WorldEntry[];
}

export interface Version {
  id: string;
  name: string;
  createdAt: string;
  storyState: StoryContent; // Uses the content-only type
}


export interface Story extends StoryContent {
  id: string;
  analysis: StoryAnalysis;
  chatHistory: Message[];
  versions: Version[];
  actionLog: ActionLogEntry[];
  autosaveEnabled: boolean;
}

export enum AppView {
  OVERVIEW,
  CHAPTERS,
  CHARACTERS,
  EDIT_CHAPTER,
  WORLD,
  HISTORY,
  ANALYTICS,
  SCREENPLAY,
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