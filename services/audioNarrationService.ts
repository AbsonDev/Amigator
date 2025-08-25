import type { Story, Chapter, Character } from '../types';
import type { 
  AudioNarration, 
  VoiceProfile, 
  AudioChapter,
  AudioParagraph,
  AudiobookMetadata,
  AudioSettings
} from '../types/audioNarration';

// Web Speech API for text-to-speech
class NarrationService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // Load voices when they change
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => 
      voice.lang.startsWith('pt') || 
      voice.lang.startsWith('en')
    );
  }

  // Generate narration for text
  async narrate(
    text: string, 
    voiceProfile: VoiceProfile,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing narration
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Set voice
      const voice = this.findBestVoice(voiceProfile);
      if (voice) {
        utterance.voice = voice;
      }

      // Set voice parameters
      utterance.pitch = 1 + voiceProfile.pitch;
      utterance.rate = voiceProfile.speed;
      utterance.volume = 1;
      utterance.lang = voiceProfile.language;

      // Event handlers
      utterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      if (onProgress) {
        utterance.onboundary = (event) => {
          const progress = (event.charIndex / text.length) * 100;
          onProgress(progress);
        };
      }

      // Start speaking
      this.synth.speak(utterance);
    });
  }

  // Find best matching voice
  private findBestVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
    // Try to find exact match
    let bestVoice = this.voices.find(voice => 
      voice.lang === profile.language &&
      voice.name.toLowerCase().includes(profile.gender)
    );

    // Fallback to language match
    if (!bestVoice) {
      bestVoice = this.voices.find(voice => 
        voice.lang.startsWith(profile.language.split('-')[0])
      );
    }

    // Fallback to any Portuguese voice
    if (!bestVoice) {
      bestVoice = this.voices.find(voice => voice.lang.startsWith('pt'));
    }

    return bestVoice || null;
  }

  // Control methods
  play() {
    if (this.isPaused && this.currentUtterance) {
      this.synth.resume();
      this.isPaused = false;
      this.isPlaying = true;
    }
  }

  pause() {
    if (this.isPlaying) {
      this.synth.pause();
      this.isPaused = true;
      this.isPlaying = false;
    }
  }

  stop() {
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isSpeaking: this.synth.speaking
    };
  }
}

// Singleton instance
export const narrationService = new NarrationService();

// Generate audio narration for a chapter
export const generateChapterNarration = async (
  chapter: Chapter,
  voiceProfile: VoiceProfile,
  onProgress?: (progress: number) => void
): Promise<AudioNarration> => {
  const narration: AudioNarration = {
    id: `audio-${Date.now()}`,
    storyId: '',
    chapterId: chapter.id,
    title: `Narração: ${chapter.title}`,
    audioUrl: '', // Will be set after recording
    duration: 0,
    voice: voiceProfile,
    status: 'processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    // Start narration
    const startTime = Date.now();
    await narrationService.narrate(chapter.content, voiceProfile, onProgress);
    const endTime = Date.now();
    
    narration.duration = (endTime - startTime) / 1000;
    narration.status = 'completed';
    narration.updatedAt = new Date().toISOString();
  } catch (error) {
    narration.status = 'error';
    narration.updatedAt = new Date().toISOString();
    throw error;
  }

  return narration;
};

// Generate full audiobook
export const generateAudiobook = async (
  story: Story,
  voiceProfile: VoiceProfile,
  settings: AudioSettings,
  onProgress?: (chapter: number, total: number) => void
): Promise<AudioNarration> => {
  const audioChapters: AudioChapter[] = [];
  let currentTime = 0;

  for (let i = 0; i < story.chapters.length; i++) {
    const chapter = story.chapters[i];
    
    if (onProgress) {
      onProgress(i + 1, story.chapters.length);
    }

    // Parse chapter into paragraphs
    const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());
    const audioParagraphs: AudioParagraph[] = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ').length;
      const estimatedDuration = (words / 150) * 60; // 150 words per minute average

      audioParagraphs.push({
        text: paragraph,
        startTime: currentTime,
        endTime: currentTime + estimatedDuration,
        speaker: detectSpeaker(paragraph, story.characters)
      });

      currentTime += estimatedDuration;
    }

    audioChapters.push({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      startTime: audioChapters.length > 0 
        ? audioChapters[audioChapters.length - 1].endTime + settings.pauseBetweenChapters
        : 0,
      endTime: currentTime,
      paragraphs: audioParagraphs
    });

    // Add pause between chapters
    currentTime += settings.pauseBetweenChapters;
  }

  const audiobook: AudioNarration = {
    id: `audiobook-${Date.now()}`,
    storyId: story.id,
    title: `Audiobook: ${story.title}`,
    audioUrl: '',
    duration: currentTime,
    voice: voiceProfile,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return audiobook;
};

// Detect speaker in dialogue
const detectSpeaker = (text: string, characters: Character[]): string | undefined => {
  for (const character of characters) {
    if (text.includes(`${character.name}:`) || 
        text.includes(`"`, ) && text.includes(character.name)) {
      return character.name;
    }
  }
  return undefined;
};

// Create audiobook metadata
export const createAudiobookMetadata = (
  story: Story,
  narration: AudioNarration,
  narratorName: string
): AudiobookMetadata => {
  return {
    title: story.title,
    author: 'Author Name', // Would come from the app context
    narrator: narratorName,
    duration: narration.duration,
    chapters: story.chapters.length,
    language: narration.voice.language,
    genre: story.genre,
    copyright: `© ${new Date().getFullYear()}`,
  };
};

// Estimate narration duration
export const estimateNarrationDuration = (text: string, speed: number = 1): number => {
  const words = text.split(/\s+/).filter(Boolean).length;
  const baseWPM = 150; // Average words per minute
  const adjustedWPM = baseWPM * speed;
  return (words / adjustedWPM) * 60; // Return in seconds
};

// Export audio as downloadable file (using MediaRecorder API)
export const exportAudioAsFile = async (
  narration: AudioNarration
): Promise<Blob> => {
  // This would require recording the audio during narration
  // For now, return a placeholder
  return new Blob(['Audio data'], { type: 'audio/mp3' });
};

// Generate SSML for advanced speech synthesis
export const generateSSML = (
  text: string,
  voiceProfile: VoiceProfile,
  emotions?: Map<string, string>
): string => {
  let ssml = `<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.w3.org/2001/10/synthesis
                 http://www.w3.org/TR/speech-synthesis11/synthesis.xsd"
       xml:lang="${voiceProfile.language}">`;

  // Add voice settings
  ssml += `<prosody pitch="${voiceProfile.pitch > 0 ? '+' : ''}${voiceProfile.pitch * 50}%" 
                    rate="${voiceProfile.speed * 100}%">`;

  // Process text with emotions
  if (emotions) {
    for (const [phrase, emotion] of emotions) {
      const emotionTag = getEmotionTag(emotion);
      text = text.replace(phrase, `${emotionTag}${phrase}</prosody>`);
    }
  }

  ssml += text;
  ssml += '</prosody>';
  ssml += '</speak>';

  return ssml;
};

// Get emotion tag for SSML
const getEmotionTag = (emotion: string): string => {
  const emotionMap: Record<string, string> = {
    happy: '<prosody pitch="+10%" rate="110%">',
    sad: '<prosody pitch="-10%" rate="90%">',
    angry: '<prosody pitch="+5%" rate="120%" volume="loud">',
    excited: '<prosody pitch="+15%" rate="125%">',
    calm: '<prosody pitch="-5%" rate="85%">',
  };

  return emotionMap[emotion] || '<prosody>';
};

// Voice cloning simulation (would integrate with AI service)
export const cloneVoice = async (
  audioSample: Blob,
  name: string
): Promise<VoiceProfile> => {
  // This would send the audio to an AI service for voice cloning
  // For now, return a mock profile
  return {
    id: `cloned-${Date.now()}`,
    name: `${name} (Clonada)`,
    gender: 'neutral',
    age: 'adult',
    language: 'pt-BR',
    pitch: 0,
    speed: 1
  };
};