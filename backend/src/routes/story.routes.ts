import { Router } from 'express';
import { StoryController } from '../controllers/story.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const storyController = new StoryController();

// All story routes require authentication
router.use(authenticate);

// Story CRUD operations
router.get('/', storyController.getUserStories);
router.get('/:id', storyController.getStory);
router.post('/', storyController.createStory);
router.put('/:id', storyController.updateStory);
router.delete('/:id', storyController.deleteStory);

// Story-specific operations
router.post('/:id/chapters', storyController.addChapter);
router.put('/:id/chapters/:chapterId', storyController.updateChapter);
router.delete('/:id/chapters/:chapterId', storyController.deleteChapter);

router.post('/:id/characters', storyController.addCharacter);
router.put('/:id/characters/:characterId', storyController.updateCharacter);
router.delete('/:id/characters/:characterId', storyController.deleteCharacter);

router.post('/:id/publish', storyController.publishStory);
router.post('/:id/unpublish', storyController.unpublishStory);

export default router;