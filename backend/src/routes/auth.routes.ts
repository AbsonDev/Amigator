import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateSignup, validateLogin } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/signup', authRateLimiter, validateSignup, authController.signup);
router.post('/login', authRateLimiter, validateLogin, authController.login);
router.post('/refresh', authRateLimiter, authController.refreshToken);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);

export default router;