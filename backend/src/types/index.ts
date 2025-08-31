export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  name: string;
  subscription: {
    tier: 'Free' | 'Hobby' | 'Amador' | 'Profissional';
    trialEnds?: string;
  };
  monthlyUsage: {
    [feature: string]: {
      count: number;
      lastReset: string;
    };
  };
  feedbackCredits: number;
  bio: string;
  isProfilePublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Story {
  id: string;
  authorId: string;
  title: string;
  genre: string;
  synopsis: string;
  chapters: Chapter[];
  characters: Character[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  content: string;
  order: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  appearance: string;
  role: string;
  avatarUrl?: string;
}

export interface AIRequest {
  prompt: string;
  model?: 'gemini-flash' | 'gemini-pro';
  temperature?: number;
  maxTokens?: number;
  context?: any;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}