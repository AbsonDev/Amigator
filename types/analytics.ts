// Analytics Types and Interfaces

export interface WritingAnalytics {
  totalWords: number;
  totalChapters: number;
  totalCharacters: number;
  averageChapterLength: number;
  writingStreak: number;
  lastWritingDate: string;
  dailyWords: DailyWordCount[];
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
  writingSpeed: WritingSpeed;
  characterMentions: CharacterMention[];
  sentimentAnalysis: ChapterSentiment[];
  vocabularyComplexity: VocabularyMetrics;
  mostUsedWords: WordFrequency[];
  writingPatterns: WritingPattern[];
  emotionalArcs: EmotionalArc[];
}

export interface DailyWordCount {
  date: string;
  words: number;
  chapters: string[];
  duration: number; // minutes
}

export interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  totalWords: number;
  averagePerDay: number;
  bestDay: string;
  worstDay: string;
}

export interface MonthlyProgress {
  month: string;
  year: number;
  totalWords: number;
  totalChapters: number;
  completionRate: number;
  goals: WritingGoal[];
}

export interface WritingSpeed {
  averageWPM: number; // words per minute
  fastestSession: number;
  slowestSession: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface CharacterMention {
  characterId: string;
  characterName: string;
  mentions: number;
  chapters: string[];
  sentimentTowards: number; // -1 to 1
  relationships: string[];
}

export interface ChapterSentiment {
  chapterId: string;
  chapterTitle: string;
  overallSentiment: number; // -1 to 1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  tension: number; // 0 to 1
  pacing: 'slow' | 'medium' | 'fast';
}

export interface VocabularyMetrics {
  uniqueWords: number;
  averageSentenceLength: number;
  readabilityScore: number; // Flesch-Kincaid
  gradeLevel: number;
  complexityTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface WordFrequency {
  word: string;
  count: number;
  category: 'common' | 'unique' | 'overused';
  suggestions?: string[];
}

export interface WritingPattern {
  pattern: string;
  description: string;
  frequency: number;
  recommendation: string;
}

export interface EmotionalArc {
  chapterRange: [number, number];
  arcType: 'rise' | 'fall' | 'rise-fall' | 'fall-rise' | 'steady';
  intensity: number;
  keyMoments: string[];
}

export interface WritingGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'project';
  target: number;
  current: number;
  deadline: string;
  achieved: boolean;
}

export interface WritingSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  wordsWritten: number;
  chaptersEdited: string[];
  productivity: 'low' | 'medium' | 'high';
  distractions: number;
}