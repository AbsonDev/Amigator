import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Compare a plain password with a hashed password
 */
export const comparePassword = async (
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate a JWT token for a user
 */
export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    subscription: user.subscription
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: '30d'
  });
};