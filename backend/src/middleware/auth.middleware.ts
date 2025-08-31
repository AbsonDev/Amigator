import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to verify JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

/**
 * Middleware to check subscription tier
 */
export const requireSubscription = (allowedTiers: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const userTier = req.user.subscription?.tier || 'Free';
    
    if (!allowedTiers.includes(userTier)) {
      return res.status(403).json({ 
        error: 'Insufficient subscription tier',
        required: allowedTiers,
        current: userTier
      });
    }

    next();
  };
};