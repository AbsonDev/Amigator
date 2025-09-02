import { Request, Response, NextFunction } from 'express';
import { hashPassword, comparePassword, generateToken, generateRefreshToken } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { User } from '../types';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * User signup
   */
  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create trial subscription
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      // Create new user
      const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        email,
        password: hashedPassword,
        subscription: {
          tier: 'Amador',
          trialEnds: trialEndDate.toISOString()
        },
        monthlyUsage: {},
        feedbackCredits: 1,
        bio: '',
        isProfilePublic: false
      };

      const user = await this.userService.create(newUser);

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user.id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * User login
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check and update trial status if needed
      if (user.subscription.tier === 'Amador' && user.subscription.trialEnds) {
        const trialEndDate = new Date(user.subscription.trialEnds);
        const now = new Date();
        if (trialEndDate < now) {
          user.subscription = { tier: 'Free' };
          await this.userService.update(user.id, { subscription: user.subscription });
        }
      }

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user.id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh token
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
      }

      // Verify refresh token and get new access token
      // Implementation depends on your token storage strategy
      
      res.json({
        success: true,
        message: 'Token refresh endpoint - implement based on your needs'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user profile
   */
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const updates = req.body;

      // Don't allow password or email updates through this endpoint
      delete updates.password;
      delete updates.email;

      const updatedUser = await this.userService.update(userId, updates);
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   */
  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      await this.userService.update(userId, { password: hashedPassword });

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout
   */
  logout = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // In a real app, you might want to invalidate the token here
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}