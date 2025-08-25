export interface Author {
  name: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  avatarUrl: string;
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

export interface Version {
  id: string;
  name: string;
  createdAt: string;
  storyState: Story;
}


export interface Story {
  id: string;
  title: string;
  synopsis: string;
  characters: Character[];
  chapters: Chapter[];
  analysis: StoryAnalysis;
  chatHistory: Message[];
  world: WorldEntry[];
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