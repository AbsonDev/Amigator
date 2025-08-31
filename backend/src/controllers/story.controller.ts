import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { StoryService } from '../services/story.service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class StoryController {
  private storyService: StoryService;

  constructor() {
    this.storyService = new StoryService();
  }

  /**
   * Get all stories for the authenticated user
   */
  getUserStories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const stories = await this.storyService.findByAuthor(userId);

      res.json({
        success: true,
        data: stories
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a specific story
   */
  getStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const story = await this.storyService.findById(id);
      
      if (!story) {
        throw new AppError('Story not found', 404);
      }

      // Check ownership
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized access to story', 403);
      }

      res.json({
        success: true,
        data: story
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new story
   */
  createStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const storyData = {
        ...req.body,
        authorId: userId
      };

      const story = await this.storyService.create(storyData);

      logger.info(`Story created: ${story.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        data: story
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a story
   */
  updateStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized to update this story', 403);
      }

      const updatedStory = await this.storyService.update(id, req.body);

      res.json({
        success: true,
        data: updatedStory
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a story
   */
  deleteStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized to delete this story', 403);
      }

      await this.storyService.delete(id);

      logger.info(`Story deleted: ${id} by user ${userId}`);

      res.json({
        success: true,
        message: 'Story deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add a chapter to a story
   */
  addChapter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const chapter = await this.storyService.addChapter(id, req.body);

      res.status(201).json({
        success: true,
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a chapter
   */
  updateChapter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id, chapterId } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const chapter = await this.storyService.updateChapter(id, chapterId, req.body);

      res.json({
        success: true,
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a chapter
   */
  deleteChapter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id, chapterId } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      await this.storyService.deleteChapter(id, chapterId);

      res.json({
        success: true,
        message: 'Chapter deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add a character
   */
  addCharacter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const character = await this.storyService.addCharacter(id, req.body);

      res.status(201).json({
        success: true,
        data: character
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a character
   */
  updateCharacter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id, characterId } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const character = await this.storyService.updateCharacter(id, characterId, req.body);

      res.json({
        success: true,
        data: character
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a character
   */
  deleteCharacter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id, characterId } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      await this.storyService.deleteCharacter(id, characterId);

      res.json({
        success: true,
        message: 'Character deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Publish a story
   */
  publishStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const publishedStory = await this.storyService.publish(id);

      logger.info(`Story published: ${id}`);

      res.json({
        success: true,
        data: publishedStory
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unpublish a story
   */
  unpublishStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verify ownership
      const story = await this.storyService.findById(id);
      if (!story) {
        throw new AppError('Story not found', 404);
      }
      if (story.authorId !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const unpublishedStory = await this.storyService.unpublish(id);

      logger.info(`Story unpublished: ${id}`);

      res.json({
        success: true,
        data: unpublishedStory
      });
    } catch (error) {
      next(error);
    }
  };
}