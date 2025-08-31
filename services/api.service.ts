/**
 * API Service - Centralizes all API calls to the backend
 * This replaces direct Gemini API calls with secure backend calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage if available
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Make authenticated API request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data.data || data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ========== AUTH ENDPOINTS ==========

  async signup(name: string, email: string, password: string) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(updates: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // ========== STORY ENDPOINTS ==========

  async getStories() {
    return this.request('/stories');
  }

  async getStory(id: string) {
    return this.request(`/stories/${id}`);
  }

  async createStory(storyData: any) {
    return this.request('/stories', {
      method: 'POST',
      body: JSON.stringify(storyData)
    });
  }

  async updateStory(id: string, updates: any) {
    return this.request(`/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteStory(id: string) {
    return this.request(`/stories/${id}`, {
      method: 'DELETE'
    });
  }

  async publishStory(id: string) {
    return this.request(`/stories/${id}/publish`, {
      method: 'POST'
    });
  }

  // ========== AI ENDPOINTS ==========

  async generateStory(genre: string, theme: string, prompt: string) {
    return this.request('/ai/generate-story', {
      method: 'POST',
      body: JSON.stringify({ genre, theme, prompt })
    });
  }

  async generateChapter(storyContext: any, chapterPrompt: string, previousChapters?: any[]) {
    return this.request('/ai/generate-chapter', {
      method: 'POST',
      body: JSON.stringify({ storyContext, chapterPrompt, previousChapters })
    });
  }

  async generateCharacter(storyContext: any, characterRole: string, characterTraits?: string) {
    return this.request('/ai/generate-character', {
      method: 'POST',
      body: JSON.stringify({ storyContext, characterRole, characterTraits })
    });
  }

  async generateDialogue(story: any, character: any, recentContext: string) {
    return this.request('/ai/generate-dialogue', {
      method: 'POST',
      body: JSON.stringify({ story, character, recentContext })
    });
  }

  async generateCover(prompt: string, style: string) {
    return this.request('/ai/generate-cover', {
      method: 'POST',
      body: JSON.stringify({ prompt, style })
    });
  }

  async analyzeStory(story: any, analysisType: string, options?: any) {
    return this.request('/ai/analyze-story', {
      method: 'POST',
      body: JSON.stringify({ story, analysisType, ...options })
    });
  }

  async formatText(text: string) {
    return this.request('/ai/format-text', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  async chat(prompt: string, context?: any, model?: string) {
    // Validate prompt before sending
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }
    
    // Ensure prompt is within valid length
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length > 10000) {
      throw new Error('Prompt is too long (max 10000 characters)');
    }
    
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        prompt: trimmedPrompt, 
        context, 
        model: model || 'gemini-flash' 
      })
    });
  }

  // ========== CHAPTER ENDPOINTS ==========

  async addChapter(storyId: string, chapterData: any) {
    return this.request(`/stories/${storyId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapterData)
    });
  }

  async updateChapter(storyId: string, chapterId: string, updates: any) {
    return this.request(`/stories/${storyId}/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteChapter(storyId: string, chapterId: string) {
    return this.request(`/stories/${storyId}/chapters/${chapterId}`, {
      method: 'DELETE'
    });
  }

  // ========== CHARACTER ENDPOINTS ==========

  async addCharacter(storyId: string, characterData: any) {
    return this.request(`/stories/${storyId}/characters`, {
      method: 'POST',
      body: JSON.stringify(characterData)
    });
  }

  async updateCharacter(storyId: string, characterId: string, updates: any) {
    return this.request(`/stories/${storyId}/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteCharacter(storyId: string, characterId: string) {
    return this.request(`/stories/${storyId}/characters/${characterId}`, {
      method: 'DELETE'
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing
export default ApiService;