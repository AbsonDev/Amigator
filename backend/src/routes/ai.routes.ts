import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate, requireSubscription } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { validateAIRequest } from '../middleware/validation';

const router = Router();
const aiController = new AIController();

// All AI routes require authentication
router.use(authenticate);

// AI generation endpoints with rate limiting
router.post('/generate-story', 
  aiRateLimiter,
  aiController.generateStory
);

router.post('/generate-chapter',
  aiRateLimiter,
  requireSubscription(['Hobby', 'Amador', 'Profissional']),
  aiController.generateChapter
);

router.post('/generate-character',
  aiRateLimiter,
  aiController.generateCharacter
);

router.post('/generate-dialogue',
  aiRateLimiter,
  aiController.generateDialogue
);

router.post('/generate-cover',
  aiRateLimiter,
  requireSubscription(['Amador', 'Profissional']),
  aiController.generateCover
);

router.post('/analyze-story',
  aiRateLimiter,
  requireSubscription(['Profissional']),
  aiController.analyzeStory
);

router.post('/format-text',
  aiRateLimiter,
  aiController.formatText
);

router.post('/chat',
  aiRateLimiter,
  validateAIRequest,
  aiController.chat
);

export default router;