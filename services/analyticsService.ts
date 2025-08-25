import type { Story, Chapter, Character } from '../types';
import type { 
  WritingAnalytics, 
  DailyWordCount, 
  ChapterSentiment,
  CharacterMention,
  VocabularyMetrics,
  WordFrequency,
  WritingSpeed,
  EmotionalArc
} from '../types/analytics';

// Analyze writing analytics for a story
export const analyzeStoryAnalytics = (story: Story): WritingAnalytics => {
  const now = new Date();
  
  // Calculate total words
  const totalWords = story.chapters.reduce((acc, chapter) => 
    acc + chapter.content.split(/\s+/).filter(Boolean).length, 0
  );
  
  // Calculate average chapter length
  const averageChapterLength = story.chapters.length > 0 
    ? Math.round(totalWords / story.chapters.length) 
    : 0;
  
  // Analyze character mentions
  const characterMentions = analyzeCharacterMentions(story);
  
  // Analyze sentiment
  const sentimentAnalysis = story.chapters.map(chapter => 
    analyzeChapterSentiment(chapter)
  );
  
  // Analyze vocabulary
  const vocabularyComplexity = analyzeVocabulary(story);
  
  // Get most used words
  const mostUsedWords = getMostUsedWords(story);
  
  // Calculate writing speed (mock data for now)
  const writingSpeed: WritingSpeed = {
    averageWPM: 45,
    fastestSession: 78,
    slowestSession: 23,
    trend: 'improving'
  };
  
  // Generate daily word counts (mock data)
  const dailyWords = generateDailyWordCounts(story);
  
  // Analyze emotional arcs
  const emotionalArcs = analyzeEmotionalArcs(sentimentAnalysis);
  
  return {
    totalWords,
    totalChapters: story.chapters.length,
    totalCharacters: story.characters.length,
    averageChapterLength,
    writingStreak: calculateWritingStreak(story),
    lastWritingDate: new Date().toISOString(),
    dailyWords,
    weeklyProgress: [],
    monthlyProgress: [],
    writingSpeed,
    characterMentions,
    sentimentAnalysis,
    vocabularyComplexity,
    mostUsedWords,
    writingPatterns: [],
    emotionalArcs
  };
};

// Analyze character mentions in the story
const analyzeCharacterMentions = (story: Story): CharacterMention[] => {
  return story.characters.map(character => {
    let mentions = 0;
    const chaptersWithMention: string[] = [];
    
    story.chapters.forEach(chapter => {
      const regex = new RegExp(`\\b${character.name}\\b`, 'gi');
      const chapterMentions = (chapter.content.match(regex) || []).length;
      
      if (chapterMentions > 0) {
        mentions += chapterMentions;
        chaptersWithMention.push(chapter.id);
      }
    });
    
    return {
      characterId: character.id,
      characterName: character.name,
      mentions,
      chapters: chaptersWithMention,
      sentimentTowards: Math.random() * 2 - 1, // Mock sentiment
      relationships: character.relationships.map(r => r.characterId)
    };
  });
};

// Analyze sentiment of a chapter
const analyzeChapterSentiment = (chapter: Chapter): ChapterSentiment => {
  // Simple sentiment analysis based on keywords (mock implementation)
  const content = chapter.content.toLowerCase();
  
  // Emotion keywords (simplified)
  const emotions = {
    joy: ['feliz', 'alegre', 'contente', 'sorriso', 'riso', 'amor', 'celebr'],
    sadness: ['triste', 'chorar', 'lágrima', 'melancol', 'depress', 'sozinho'],
    anger: ['raiva', 'furioso', 'irritado', 'ódio', 'gritar', 'xingar'],
    fear: ['medo', 'terror', 'assustado', 'pânico', 'tremar', 'fugir'],
    surprise: ['surpresa', 'choque', 'inesperado', 'súbito', 'espanto'],
    disgust: ['nojo', 'repugn', 'asquer', 'horrível', 'podre'],
    trust: ['confiar', 'acreditar', 'fé', 'lealdade', 'amizade'],
    anticipation: ['esperar', 'ansioso', 'futuro', 'planejar', 'preparar']
  };
  
  const emotionScores = Object.entries(emotions).reduce((acc, [emotion, keywords]) => {
    const score = keywords.reduce((sum, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      return sum + (content.match(regex) || []).length;
    }, 0);
    return { ...acc, [emotion]: Math.min(score / 10, 1) }; // Normalize to 0-1
  }, {} as any);
  
  // Calculate overall sentiment
  const positiveEmotions = emotionScores.joy + emotionScores.trust + emotionScores.anticipation;
  const negativeEmotions = emotionScores.sadness + emotionScores.anger + emotionScores.fear + emotionScores.disgust;
  const overallSentiment = (positiveEmotions - negativeEmotions) / 4; // Normalize to -1 to 1
  
  // Determine pacing based on sentence length and punctuation
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const avgSentenceLength = sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / sentences.length;
  const pacing = avgSentenceLength < 10 ? 'fast' : avgSentenceLength > 20 ? 'slow' : 'medium';
  
  return {
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    overallSentiment,
    emotions: emotionScores,
    tension: Math.random(), // Mock tension value
    pacing
  };
};

// Analyze vocabulary complexity
const analyzeVocabulary = (story: Story): VocabularyMetrics => {
  const allText = story.chapters.map(c => c.content).join(' ');
  const words = allText.toLowerCase().split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words).size;
  
  const sentences = allText.split(/[.!?]+/).filter(Boolean);
  const averageSentenceLength = sentences.length > 0
    ? sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / sentences.length
    : 0;
  
  // Simplified Flesch-Kincaid readability score
  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  const readabilityScore = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (totalSyllables / words.length);
  
  const gradeLevel = Math.max(0, Math.min(18, Math.round((readabilityScore - 100) / -10)));
  
  return {
    uniqueWords,
    averageSentenceLength,
    readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
    gradeLevel,
    complexityTrend: 'stable'
  };
};

// Count syllables in a word (simplified)
const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  let count = 0;
  const vowels = 'aeiouy';
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  // Adjust for silent e
  if (word.endsWith('e')) {
    count--;
  }
  
  // Ensure at least one syllable
  return Math.max(1, count);
};

// Get most frequently used words
const getMostUsedWords = (story: Story): WordFrequency[] => {
  const allText = story.chapters.map(c => c.content).join(' ');
  const words = allText.toLowerCase()
    .replace(/[.,!?;:'"]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3); // Filter out small words
  
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Sort by frequency and get top 20
  const sorted = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  return sorted.map(([word, count]) => ({
    word,
    count,
    category: count > words.length * 0.01 ? 'overused' : count > 10 ? 'common' : 'unique',
    suggestions: count > words.length * 0.01 ? generateSynonyms(word) : undefined
  }));
};

// Generate synonyms for overused words
const generateSynonyms = (word: string): string[] => {
  // Mock synonym generation
  const synonymMap: Record<string, string[]> = {
    'disse': ['falou', 'respondeu', 'afirmou', 'declarou', 'murmurou'],
    'olhou': ['observou', 'fitou', 'contemplou', 'encarou', 'vislumbrou'],
    'muito': ['bastante', 'extremamente', 'demasiado', 'imensamente'],
    'coisa': ['objeto', 'item', 'elemento', 'aspecto', 'questão']
  };
  
  return synonymMap[word] || [];
};

// Generate daily word counts (mock data for demonstration)
const generateDailyWordCounts = (story: Story): DailyWordCount[] => {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    days.push({
      date: date.toISOString().split('T')[0],
      words: Math.floor(Math.random() * 2000) + 500,
      chapters: story.chapters.slice(0, Math.floor(Math.random() * 3) + 1).map(c => c.id),
      duration: Math.floor(Math.random() * 120) + 30
    });
  }
  
  return days;
};

// Calculate writing streak
const calculateWritingStreak = (story: Story): number => {
  // Mock implementation - would need actual writing history
  return Math.floor(Math.random() * 30) + 1;
};

// Analyze emotional arcs across chapters
const analyzeEmotionalArcs = (sentiments: ChapterSentiment[]): EmotionalArc[] => {
  const arcs: EmotionalArc[] = [];
  
  if (sentiments.length < 2) return arcs;
  
  let currentArc: EmotionalArc = {
    chapterRange: [0, 0],
    arcType: 'steady',
    intensity: 0,
    keyMoments: []
  };
  
  for (let i = 1; i < sentiments.length; i++) {
    const prev = sentiments[i - 1];
    const curr = sentiments[i];
    const change = curr.overallSentiment - prev.overallSentiment;
    
    if (Math.abs(change) > 0.3) {
      // Significant emotional change
      if (currentArc.chapterRange[1] > currentArc.chapterRange[0]) {
        arcs.push(currentArc);
      }
      
      currentArc = {
        chapterRange: [i - 1, i],
        arcType: change > 0 ? 'rise' : 'fall',
        intensity: Math.abs(change),
        keyMoments: [curr.chapterTitle]
      };
    } else {
      currentArc.chapterRange[1] = i;
    }
  }
  
  if (currentArc.chapterRange[1] > currentArc.chapterRange[0]) {
    arcs.push(currentArc);
  }
  
  return arcs;
};

// Export analytics data to JSON
export const exportAnalytics = (analytics: WritingAnalytics): string => {
  return JSON.stringify(analytics, null, 2);
};

// Generate analytics report in markdown
export const generateAnalyticsReport = (analytics: WritingAnalytics): string => {
  return `# Writing Analytics Report

## Overview
- **Total Words:** ${analytics.totalWords.toLocaleString()}
- **Total Chapters:** ${analytics.totalChapters}
- **Average Chapter Length:** ${analytics.averageChapterLength.toLocaleString()} words
- **Writing Streak:** ${analytics.writingStreak} days

## Writing Speed
- **Average WPM:** ${analytics.writingSpeed.averageWPM}
- **Fastest Session:** ${analytics.writingSpeed.fastestSession} WPM
- **Trend:** ${analytics.writingSpeed.trend}

## Character Analysis
${analytics.characterMentions.map(char => 
  `- **${char.characterName}:** ${char.mentions} mentions across ${char.chapters.length} chapters`
).join('\n')}

## Vocabulary Metrics
- **Unique Words:** ${analytics.vocabularyComplexity.uniqueWords.toLocaleString()}
- **Readability Score:** ${analytics.vocabularyComplexity.readabilityScore.toFixed(1)}/100
- **Grade Level:** ${analytics.vocabularyComplexity.gradeLevel}

## Most Used Words
${analytics.mostUsedWords.slice(0, 10).map(word => 
  `- "${word.word}": ${word.count} times ${word.category === 'overused' ? '⚠️' : ''}`
).join('\n')}
`;
};