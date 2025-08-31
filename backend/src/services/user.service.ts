import { User } from '../types';
import { logger } from '../utils/logger';

/**
 * User service for database operations
 * Note: This is a mock implementation using in-memory storage
 * In production, replace with actual database operations
 */
export class UserService {
  private users: Map<string, User> = new Map();

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  /**
   * Create new user
   */
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    logger.info(`User created: ${user.email}`);
    
    return user;
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...updates,
      id: user.id, // Prevent ID change
      email: user.email, // Prevent email change through update
      createdAt: user.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    logger.info(`User updated: ${updatedUser.email}`);
    
    return updatedUser;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      return false;
    }

    this.users.delete(id);
    logger.info(`User deleted: ${user.email}`);
    
    return true;
  }

  /**
   * Get all users (admin only)
   */
  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}