// API Client for NewsPlay Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('newsplay_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('newsplay_token', token);
    } else {
      localStorage.removeItem('newsplay_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Story methods
  async getStories() {
    return this.request('/stories');
  }

  async getStory(id) {
    return this.request(`/stories/${id}`);
  }

  async createStory(storyData) {
    return this.request('/stories', {
      method: 'POST',
      body: JSON.stringify(storyData),
    });
  }

  async updateStory(id, storyData) {
    return this.request(`/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(storyData),
    });
  }

  async deleteStory(id) {
    return this.request(`/stories/${id}`, {
      method: 'DELETE',
    });
  }

  async regenerateImage(storyId, partIndex, promptOverride = null) {
    return this.request(`/stories/${storyId}/regenerate-image`, {
      method: 'POST',
      body: JSON.stringify({ partIndex, promptOverride }),
    });
  }

  // Brand Profile methods
  async getBrandProfiles() {
    return this.request('/brands');
  }

  async getBrandProfile(id) {
    return this.request(`/brands/${id}`);
  }

  async getDefaultBrandProfile() {
    return this.request('/brands/default');
  }

  async createBrandProfile(brandData) {
    return this.request('/brands', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  }

  async updateBrandProfile(id, brandData) {
    return this.request(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
    });
  }

  async deleteBrandProfile(id) {
    return this.request(`/brands/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultBrandProfile(id) {
    return this.request(`/brands/${id}/set-default`, {
      method: 'POST',
    });
  }

  // AI methods
  async generateStoryboard(articleText, brandPreferences = {}) {
    return this.request('/ai/generate-storyboard', {
      method: 'POST',
      body: JSON.stringify({ article_text: articleText, brand_preferences: brandPreferences }),
    });
  }

  async enhancePrompt(originalPrompt, characterPersona = '', visualStyle = 'realistic', colorTheme = 'modern') {
    return this.request('/ai/enhance-prompt', {
      method: 'POST',
      body: JSON.stringify({
        original_prompt: originalPrompt,
        character_persona: characterPersona,
        visual_style: visualStyle,
        color_theme: colorTheme,
      }),
    });
  }

  async generateImage(prompt, options = {}, characterReferenceImages = []) {
    return this.request('/ai/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, options, character_reference_images: characterReferenceImages }),
    });
  }

  async generateMultipleImages(prompts, options = {}) {
    return this.request('/ai/generate-multiple-images', {
      method: 'POST',
      body: JSON.stringify({ prompts, options }),
    });
  }

  async getAIModels() {
    return this.request('/ai/models');
  }

  async testAIConnection() {
    return this.request('/ai/test-connection', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck() {
    return fetch(`${this.baseURL.replace('/api', '')}/health`).then(res => res.json());
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
