import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { GeminiService } from '../services/gemini.service';
import { UsageService } from '../services/usage.service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sanitizeHtml } from '../middleware/validation';

export class AIController {
  private geminiService: GeminiService;
  private usageService: UsageService;

  constructor() {
    this.geminiService = new GeminiService();
    this.usageService = new UsageService();
  }

  /**
   * Generate a complete story structure
   */
  generateStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { genre, theme, prompt } = req.body;

      // Check usage limits
      const canGenerate = await this.usageService.checkLimit(userId, 'story_generation', req.user?.subscription?.tier);
      if (!canGenerate) {
        throw new AppError('Monthly story generation limit reached', 429);
      }

      // Generate story
      const story = await this.geminiService.generateStoryStructure(
        genre,
        theme,
        prompt,
        userId
      );

      // Track usage
      await this.usageService.trackUsage(userId, 'story_generation');

      logger.info(`Story generated for user ${userId}`);

      res.json({
        success: true,
        data: story
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate a chapter
   */
  generateChapter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { storyContext, chapterPrompt, previousChapters } = req.body;

      // Check usage limits
      const canGenerate = await this.usageService.checkLimit(userId, 'chapter_generation', req.user?.subscription?.tier);
      if (!canGenerate) {
        throw new AppError('Monthly chapter generation limit reached', 429);
      }

      // Generate chapter
      const chapter = await this.geminiService.generateChapter(
        storyContext,
        chapterPrompt,
        previousChapters
      );

      // Track usage
      await this.usageService.trackUsage(userId, 'chapter_generation');

      res.json({
        success: true,
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate character
   */
  generateCharacter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { storyContext, characterRole, characterTraits } = req.body;

      // Check usage limits
      const canGenerate = await this.usageService.checkLimit(userId, 'character_generation', req.user?.subscription?.tier);
      if (!canGenerate) {
        throw new AppError('Monthly character generation limit reached', 429);
      }

      // Generate character
      const character = await this.geminiService.generateCharacter(
        storyContext,
        characterRole,
        characterTraits
      );

      // Track usage
      await this.usageService.trackUsage(userId, 'character_generation');

      res.json({
        success: true,
        data: character
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate dialogue
   */
  generateDialogue = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { story, character, recentContext } = req.body;

      // Generate dialogue
      const dialogue = await this.geminiService.generateCharacterDialogue(
        story,
        character,
        recentContext
      );

      res.json({
        success: true,
        data: { dialogue }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate book cover
   */
  generateCover = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { prompt, style } = req.body;

      // Check usage limits
      const canGenerate = await this.usageService.checkLimit(userId, 'cover_generation', req.user?.subscription?.tier);
      if (!canGenerate) {
        throw new AppError('Monthly cover generation limit reached', 429);
      }

      // Generate cover
      const coverUrl = await this.geminiService.generateBookCover(prompt, style);

      // Track usage
      await this.usageService.trackUsage(userId, 'cover_generation');

      res.json({
        success: true,
        data: { coverUrl }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Analyze story
   */
  analyzeStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { story, analysisType } = req.body;

      // Perform analysis based on type
      let analysis;
      switch (analysisType) {
        case 'script_issues':
          analysis = await this.geminiService.analyzeScriptIssues(story);
          break;
        case 'repetitions':
          analysis = await this.geminiService.detectRepetitions(story.chapters);
          break;
        case 'pacing':
          analysis = await this.geminiService.analyzePacing(story);
          break;
        case 'character_voice':
          const { characterId } = req.body;
          analysis = await this.geminiService.analyzeCharacterVoice(story, characterId);
          break;
        default:
          throw new AppError('Invalid analysis type', 400);
      }

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Format text with AI
   */
  formatText = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { text } = req.body;

      // Sanitize input
      const sanitizedText = sanitizeHtml(text);

      // Format text
      const formattedText = await this.geminiService.formatTextWithAI(sanitizedText);

      res.json({
        success: true,
        data: { formattedText }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * General chat with AI
   */
  chat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { prompt, context, model = 'gemini-flash' } = req.body;

      // Check usage limits
      const canChat = await this.usageService.checkLimit(userId, 'ai_chat', req.user?.subscription?.tier);
      if (!canChat) {
        throw new AppError('Monthly AI chat limit reached', 429);
      }

      // Sanitize prompt
      const sanitizedPrompt = sanitizeHtml(prompt);

      // Generate response
      const response = await this.geminiService.chat(sanitizedPrompt, context, model);

      // Track usage
      await this.usageService.trackUsage(userId, 'ai_chat');

      res.json({
        success: true,
        data: { response }
      });
    } catch (error) {
      next(error);
    }
  };
}