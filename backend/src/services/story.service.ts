import { Story, Chapter, Character } from '../types';
import { logger } from '../utils/logger';

/**
 * Story service for database operations
 * Note: This is a mock implementation using in-memory storage
 * In production, replace with actual database operations
 */
export class StoryService {
  private stories: Map<string, Story> = new Map();

  /**
   * Find story by ID
   */
  async findById(id: string): Promise<Story | null> {
    return this.stories.get(id) || null;
  }

  /**
   * Find all stories by author
   */
  async findByAuthor(authorId: string): Promise<Story[]> {
    const authorStories: Story[] = [];
    for (const story of this.stories.values()) {
      if (story.authorId === authorId) {
        authorStories.push(story);
      }
    }
    return authorStories;
  }

  /**
   * Create new story
   */
  async create(storyData: Partial<Story>): Promise<Story> {
    const story: Story = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: storyData.title || 'Untitled Story',
      genre: storyData.genre || 'Fiction',
      synopsis: storyData.synopsis || '',
      chapters: storyData.chapters || [],
      characters: storyData.characters || [],
      authorId: storyData.authorId!,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.stories.set(story.id, story);
    logger.info(`Story created: ${story.id}`);
    
    return story;
  }

  /**
   * Update story
   */
  async update(id: string, updates: Partial<Story>): Promise<Story> {
    const story = await this.findById(id);
    if (!story) {
      throw new Error('Story not found');
    }

    const updatedStory = {
      ...story,
      ...updates,
      id: story.id, // Prevent ID change
      authorId: story.authorId, // Prevent author change
      createdAt: story.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    this.stories.set(id, updatedStory);
    logger.info(`Story updated: ${id}`);
    
    return updatedStory;
  }

  /**
   * Delete story
   */
  async delete(id: string): Promise<boolean> {
    const story = await this.findById(id);
    if (!story) {
      return false;
    }

    this.stories.delete(id);
    logger.info(`Story deleted: ${id}`);
    
    return true;
  }

  /**
   * Add chapter to story
   */
  async addChapter(storyId: string, chapterData: Partial<Chapter>): Promise<Chapter> {
    const story = await this.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const chapter: Chapter = {
      id: `chapter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: chapterData.title || 'Untitled Chapter',
      summary: chapterData.summary || '',
      content: chapterData.content || '',
      order: chapterData.order || story.chapters.length + 1
    };

    story.chapters.push(chapter);
    story.updatedAt = new Date();
    this.stories.set(storyId, story);

    logger.info(`Chapter added to story ${storyId}`);
    
    return chapter;
  }

  /**
   * Update chapter
   */
  async updateChapter(storyId: string, chapterId: string, updates: Partial<Chapter>): Promise<Chapter> {
    const story = await this.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const chapterIndex = story.chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) {
      throw new Error('Chapter not found');
    }

    story.chapters[chapterIndex] = {
      ...story.chapters[chapterIndex],
      ...updates,
      id: chapterId // Prevent ID change
    };

    story.updatedAt = new Date();
    this.stories.set(storyId, story);

    logger.info(`Chapter ${chapterId} updated in story ${storyId}`);
    
    return story.chapters[chapterIndex];
  }

  /**
   * Delete chapter
   */
  async deleteChapter(storyId: string, chapterId: string): Promise<boolean> {
    const story = await this.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const initialLength = story.chapters.length;
    story.chapters = story.chapters.filter(c => c.id !== chapterId);

    if (story.chapters.length === initialLength) {
      return false; // Chapter not found
    }

    // Reorder remaining chapters
    story.chapters.forEach((chapter, index) => {
      chapter.order = index + 1;
    });

    story.updatedAt = new Date();
    this.stories.set(storyId, story);

    logger.info(`Chapter ${chapterId} deleted from story ${storyId}`);
    
    return true;
  }

  /**
   * Add character to story
   */
  async addCharacter(storyId: string, characterData: Partial<Character>): Promise<Character> {
    const story = await this.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const character: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: characterData.name || 'Unnamed Character',
      description: characterData.description || '',
      appearance: characterData.appearance || '',
      role: characterData.role || 'Supporting',
      avatarUrl: characterData.avatarUrl
    };

    story.characters.push(character);
    story.updatedAt = new Date();
    this.stories.set(storyId, story);

    logger.info(`Character added to story ${storyId}`);
    
    return character;
  }

  /**
   * Update character
   */
  async updateCharacter(storyId: string, characterId: string, updates: Partial<Character>): Promise<Character> {
    const story = await this.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const characterIndex = story.characters.findIndex(c => c.id === characterId);
    if (characterIndex === -1) {
      throw new Error('Character not found');
    }

    story.characters[characterIndex] = {
      ...story.characters[characterIndex],
      ...updates,
      id: characterId // Prevent ID change
    };

    story.updatedAt = new Date();
    this.stories.set(storyId, story);

    logger.info(`Character ${characterId} updated in story ${storyId}`);
    
    return story.characters[characterIndex];
  }

  /**
   * Delete character
   */
  async deleteCharacter(storyId: string, characterId: string): Promise<boolean> {
    const story = await this.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const initialLength = story.characters.length;
    story.characters = story.characters.filter(c => c.id !== characterId);

    if (story.characters.length === initialLength) {
      return false; // Character not found
    }

    story.updatedAt = new Date();
    this.stories.set(storyId, story);

    logger.info(`Character ${characterId} deleted from story ${storyId}`);
    
    return true;
  }

  /**
   * Publish story
   */
  async publish(id: string): Promise<Story> {
    const story = await this.findById(id);
    if (!story) {
      throw new Error('Story not found');
    }

    story.isPublished = true;
    story.updatedAt = new Date();
    this.stories.set(id, story);

    return story;
  }

  /**
   * Unpublish story
   */
  async unpublish(id: string): Promise<Story> {
    const story = await this.findById(id);
    if (!story) {
      throw new Error('Story not found');
    }

    story.isPublished = false;
    story.updatedAt = new Date();
    this.stories.set(id, story);

    return story;
  }
}