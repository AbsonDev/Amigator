import { logger } from '../utils/logger';

interface UsageLimits {
  [tier: string]: {
    [feature: string]: number;
  };
}

/**
 * Service to track and limit feature usage
 */
export class UsageService {
  private usageLimits: UsageLimits = {
    'Free': {
      story_generation: 1,
      chapter_generation: 0,
      character_generation: 3,
      cover_generation: 0,
      ai_chat: 10,
      export_pdf: 0,
      export_docx: 0
    },
    'Hobby': {
      story_generation: 3,
      chapter_generation: 5,
      character_generation: 10,
      cover_generation: 0,
      ai_chat: 50,
      export_pdf: 0,
      export_docx: 0
    },
    'Amador': {
      story_generation: 10,
      chapter_generation: 30,
      character_generation: 50,
      cover_generation: 5,
      ai_chat: 200,
      export_pdf: 10,
      export_docx: 10
    },
    'Profissional': {
      story_generation: -1, // Unlimited
      chapter_generation: -1,
      character_generation: -1,
      cover_generation: -1,
      ai_chat: -1,
      export_pdf: -1,
      export_docx: -1
    }
  };

  // In-memory usage tracking (replace with database in production)
  private usageData: Map<string, any> = new Map();

  /**
   * Check if user can use a feature
   */
  async checkLimit(userId: string, feature: string, tier: string = 'Free'): Promise<boolean> {
    const limit = this.usageLimits[tier]?.[feature];
    
    // Unlimited
    if (limit === -1) {
      return true;
    }

    // No access
    if (limit === 0) {
      return false;
    }

    // Check current usage
    const userUsage = this.usageData.get(userId) || {};
    const featureUsage = userUsage[feature] || { count: 0, lastReset: new Date().toISOString() };

    // Check if month has passed and reset if needed
    const lastReset = new Date(featureUsage.lastReset);
    const now = new Date();
    const monthsPassed = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                        (now.getMonth() - lastReset.getMonth());

    if (monthsPassed >= 1) {
      featureUsage.count = 0;
      featureUsage.lastReset = now.toISOString();
    }

    return featureUsage.count < limit;
  }

  /**
   * Track feature usage
   */
  async trackUsage(userId: string, feature: string): Promise<void> {
    const userUsage = this.usageData.get(userId) || {};
    const featureUsage = userUsage[feature] || { count: 0, lastReset: new Date().toISOString() };

    featureUsage.count++;
    userUsage[feature] = featureUsage;
    this.usageData.set(userId, userUsage);

    logger.info(`Usage tracked: User ${userId} used ${feature}. Count: ${featureUsage.count}`);
  }

  /**
   * Get usage statistics for a user
   */
  async getUsageStats(userId: string): Promise<any> {
    return this.usageData.get(userId) || {};
  }

  /**
   * Reset usage for a specific feature
   */
  async resetUsage(userId: string, feature?: string): Promise<void> {
    if (feature) {
      const userUsage = this.usageData.get(userId) || {};
      if (userUsage[feature]) {
        userUsage[feature] = { count: 0, lastReset: new Date().toISOString() };
        this.usageData.set(userId, userUsage);
      }
    } else {
      // Reset all features
      this.usageData.delete(userId);
    }
    
    logger.info(`Usage reset for user ${userId}${feature ? ` feature: ${feature}` : ' (all features)'}`);
  }
}